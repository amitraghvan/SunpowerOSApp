import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PasswordService } from '../../apps/api/src/modules/identity/password.service';
import { SessionService } from '../../apps/api/src/modules/identity/session.service';
import { AuthService } from '../../apps/api/src/modules/identity/auth.service';
import { AccessControlService } from '../../apps/api/src/modules/access-control/access-control.service';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('SunPowerOS Public Website & Self-Service Signup Integration Suite', () => {
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let sessionService: SessionService;
  let accessControlService: AccessControlService;
  let authService: AuthService;

  const testEmail = 'signup.founder@sunpower-test.com';
  const testPassword = 'SunPowerSecure2026!';

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

    // Clean up any previous test artifacts
    await prisma.asSuperAdmin(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: testEmail } });
      if (existing) {
        await tx.$executeRawUnsafe(`DELETE FROM "audit_logs" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "membership_roles" WHERE "membershipId" IN (SELECT id FROM "organization_memberships" WHERE "userId" = '${existing.id}')`);
        await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "organization_branches" WHERE "organizationId" IN (SELECT id FROM "organizations" WHERE "slug" LIKE 'apex-solar%')`);
        await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "slug" LIKE 'apex-solar%'`);
        await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${existing.id}'`);
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should reject registration if terms or privacy policy are not accepted', async () => {
    await expect(
      authService.register({
        firstName: 'Rajesh',
        lastName: 'Sharma',
        email: testEmail,
        password: testPassword,
        organizationName: 'Apex Solar Energy',
        termsAccepted: false,
        privacyAccepted: true,
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('2. should successfully register user, create organization, branch, membership, and return active session', async () => {
    const result = await authService.register({
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: testEmail,
      password: testPassword,
      phone: '+91 98110 12345',
      organizationName: 'Apex Solar Energy Solutions',
      organizationSlug: 'apex-solar',
      businessCategory: 'SOLAR_EPC',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      termsAccepted: true,
      privacyAccepted: true,
    });

    expect(result).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.firstName).toBe('Rajesh');
    expect(result.user.lastName).toBe('Sharma');
    expect(result.user.isSuperAdmin).toBe(false);
    expect(result.activeOrganization.name).toBe('Apex Solar Energy Solutions');
    expect(result.activeOrganization.slug).toBe('apex-solar');
    expect(result.activeBranch?.code).toBe('HQ');
    expect(result.sessionToken).toBeDefined();
    expect(result.roles).toContain('ORG_ADMIN');
    expect(result.roles).not.toContain('SYSTEM_ADMIN');
  });

  it('3. should reject duplicate registration with same email address', async () => {
    await expect(
      authService.register({
        firstName: 'Duplicate',
        lastName: 'Attempt',
        email: testEmail,
        password: 'AnotherPassword123!',
        organizationName: 'Another Solar Co',
        termsAccepted: true,
        privacyAccepted: true,
      })
    ).rejects.toThrow(ConflictException);
  });

  it('4. should automatically generate unique slug if organization slug conflicts', async () => {
    const uniqueEmail = 'another.founder@sunpower-test.com';
    // Clean up if exists
    await prisma.asSuperAdmin(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email: uniqueEmail } });
      if (existing) {
        await tx.$executeRawUnsafe(`DELETE FROM "audit_logs" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "userId" = '${existing.id}'`);
        await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${existing.id}'`);
      }
    });

    const result = await authService.register({
      firstName: 'Sunil',
      lastName: 'Gupta',
      email: uniqueEmail,
      password: testPassword,
      organizationName: 'Apex Solar Energy Solutions',
      organizationSlug: 'apex-solar', // Conflicting slug
      termsAccepted: true,
      privacyAccepted: true,
    });

    expect(result.activeOrganization.slug).toBe('apex-solar-1');
  });
});
