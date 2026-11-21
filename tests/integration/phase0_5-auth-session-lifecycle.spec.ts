import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PasswordService } from '../../apps/api/src/modules/identity/password.service';
import { SessionService } from '../../apps/api/src/modules/identity/session.service';
import { AuthService } from '../../apps/api/src/modules/identity/auth.service';
import { AccessControlService } from '../../apps/api/src/modules/access-control/access-control.service';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Phase 0.5 — Authentication & Session Lifecycle Integration Suite', () => {
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let sessionService: SessionService;
  let accessControlService: AccessControlService;
  let authService: AuthService;

  const testOrgId = '44444444-4444-4444-8444-444444444444';
  const testUserId = '55555555-5555-4555-8555-555555555555';
  const testEmail = 'lead.engineer@solartest.com';
  const testPassword = 'SolarSecure2026!#Argon';

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    passwordService = new PasswordService();
    sessionService = new SessionService(prisma);
    accessControlService = new AccessControlService(prisma);
    authService = new AuthService(prisma, passwordService, sessionService, accessControlService);

    // Clean up test data
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "userId" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${testOrgId}'`);

      await tx.organization.create({
        data: {
          id: testOrgId,
          slug: 'solar-auth-test',
          name: 'Solar Auth Testing Corp',
        },
      });

      const hash = await passwordService.hashPassword(testPassword);
      await tx.user.create({
        data: {
          id: testUserId,
          email: testEmail,
          firstName: 'Anil',
          lastName: 'Sharma',
          passwordHash: hash,
          status: 'ACTIVE',
        },
      });

      await tx.organizationMembership.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          isActive: true,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "userId" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${testOrgId}'`);
    });
    await prisma.$disconnect();
  });

  describe('1. Argon2id Password Hashing & Verification', () => {
    it('should hash password with Argon2id and verify correctly', async () => {
      const hash = await passwordService.hashPassword('SuperSecret123');
      expect(hash).toMatch(/^\$argon2id\$/);

      const isValid = await passwordService.verifyPassword(hash, 'SuperSecret123');
      expect(isValid).toBe(true);

      const isInvalid = await passwordService.verifyPassword(hash, 'WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });

  describe('2. Authentication Flow & Session Generation', () => {
    it('should successfully authenticate with valid credentials and return session token', async () => {
      const res = await authService.login({
        email: testEmail,
        password: testPassword,
      });

      expect(res.user.email).toBe(testEmail);
      expect(res.activeOrganization.id).toBe(testOrgId);
      expect(res.sessionToken).toBeDefined();
      expect(res.sessionToken?.length).toBe(64); // 32 bytes hex = 64 chars

      // Verify session exists in DB with SHA-256 hash
      const session = await sessionService.validateSession(res.sessionToken!);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(testUserId);
      expect(session?.organizationId).toBe(testOrgId);
      expect(session?.revokedAt).toBeNull();
    });

    it('should reject invalid password with UnauthorizedException and increment failed attempts', async () => {
      await expect(
        authService.login({
          email: testEmail,
          password: 'IncorrectPassword!',
        })
      ).rejects.toThrow(UnauthorizedException);

      const user = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(user?.failedLoginAttempts).toBeGreaterThanOrEqual(1);
    });

    it('should lock out account after 5 consecutive failed login attempts', async () => {
      // Force failed attempts to 4
      await prisma.user.update({
        where: { id: testUserId },
        data: { failedLoginAttempts: 4 },
      });

      // 5th attempt fails -> triggers lock
      await expect(
        authService.login({
          email: testEmail,
          password: 'IncorrectPassword5thTime!',
        })
      ).rejects.toThrow(ForbiddenException);

      const lockedUser = await prisma.user.findUnique({ where: { id: testUserId } });
      expect(lockedUser?.lockedUntil).not.toBeNull();
      expect(lockedUser?.lockedUntil!.getTime()).toBeGreaterThan(Date.now());

      // Attempting to log in while locked throws ForbiddenException
      await expect(
        authService.login({
          email: testEmail,
          password: testPassword,
        })
      ).rejects.toThrow(/temporarily locked/i);

      // Unlock for subsequent tests
      await prisma.user.update({
        where: { id: testUserId },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    });
  });

  describe('3. Session Lifecycle & Invalidation', () => {
    it('should invalidate session on logout', async () => {
      const loginRes = await authService.login({
        email: testEmail,
        password: testPassword,
      });

      const token = loginRes.sessionToken!;
      const validBefore = await sessionService.validateSession(token);
      expect(validBefore).not.toBeNull();

      // Logout
      await authService.logout(token);

      const validAfter = await sessionService.validateSession(token);
      expect(validAfter).toBeNull();
    });

    it('should support revoking all sessions except current session', async () => {
      // Create session 1
      const s1 = await authService.login({ email: testEmail, password: testPassword });
      // Create session 2
      const s2 = await authService.login({ email: testEmail, password: testPassword });

      const sessionsBefore = await sessionService.listUserSessions(testUserId);
      expect(sessionsBefore.length).toBeGreaterThanOrEqual(2);

      // Revoke all except s2
      const s2Record = await sessionService.validateSession(s2.sessionToken!);
      await sessionService.revokeAllUserSessions(testUserId, s2Record?.id);

      // s1 should be revoked
      expect(await sessionService.validateSession(s1.sessionToken!)).toBeNull();
      // s2 should still be valid
      expect(await sessionService.validateSession(s2.sessionToken!)).not.toBeNull();
    });
  });

  describe('4. Password Recovery Flow', () => {
    it('should generate password reset token and update password securely', async () => {
      const forgotRes = await authService.forgotPassword({ email: testEmail });
      expect(forgotRes.message).toBeDefined();

      const resetTokenRecord = await prisma.passwordResetToken.findFirst({
        where: { userId: testUserId, usedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      expect(resetTokenRecord).not.toBeNull();

      // Find token and simulate user resetting password
      // Since rawToken was generated in memory, we verify resetPassword logic with a known token
      const rawToken = 'test-recovery-token-xyz-1234567890abcdef';
      const tokenHash = sessionService.hashToken(rawToken);

      await prisma.passwordResetToken.create({
        data: {
          userId: testUserId,
          tokenHash,
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });

      const newPassword = 'NewSolarPassword2026!#Strong';
      const resetRes = await authService.resetPassword({
        token: rawToken,
        newPassword,
      });
      expect(resetRes.message).toContain('successfully reset');

      // Old password should now fail
      await expect(
        authService.login({
          email: testEmail,
          password: testPassword,
        })
      ).rejects.toThrow(UnauthorizedException);

      // New password should succeed
      const newLogin = await authService.login({
        email: testEmail,
        password: newPassword,
      });
      expect(newLogin.user.id).toBe(testUserId);
    });
  });
});
