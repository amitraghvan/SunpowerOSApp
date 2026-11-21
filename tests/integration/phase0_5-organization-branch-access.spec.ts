import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PasswordService } from '../../apps/api/src/modules/identity/password.service';
import { SessionService } from '../../apps/api/src/modules/identity/session.service';
import { AccessControlService } from '../../apps/api/src/modules/access-control/access-control.service';
import { OrganizationsService } from '../../apps/api/src/modules/organizations/organizations.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('Phase 0.5 — Organization & Branch Access Control Integration Suite', () => {
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let sessionService: SessionService;
  let accessControlService: AccessControlService;
  let organizationsService: OrganizationsService;

  const orgAId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const orgBId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const orgUnrelatedId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const multiOrgUserId = '99999999-9999-4999-8999-999999999999';

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
    organizationsService = new OrganizationsService(
      prisma,
      sessionService,
      passwordService,
      accessControlService
    );

    await accessControlService.seedPermissionsAndSystemRoles();

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up test tables
      await tx.$executeRawUnsafe(`DELETE FROM "organization_invitations" WHERE "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${multiOrgUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "userId" = '${multiOrgUserId}' OR "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_branches" WHERE "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${multiOrgUserId}' OR "email" LIKE '%@invite-test.com'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);

      // Create Org A, Org B, and Unrelated Org
      await tx.organization.createMany({
        data: [
          { id: orgAId, slug: 'sun-north', name: 'SunPower North' },
          { id: orgBId, slug: 'sun-south', name: 'SunPower South' },
          { id: orgUnrelatedId, slug: 'unrelated-solar', name: 'Unrelated Solar Ltd' },
        ],
      });

      // Create user
      await tx.user.create({
        data: {
          id: multiOrgUserId,
          email: 'director@multisun.com',
          firstName: 'Vikram',
          lastName: 'Mehta',
          status: 'ACTIVE',
        },
      });

      // User belongs to Org A and Org B
      await tx.organizationMembership.createMany({
        data: [
          { organizationId: orgAId, userId: multiOrgUserId, isActive: true },
          { organizationId: orgBId, userId: multiOrgUserId, isActive: true },
        ],
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "organization_invitations" WHERE "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" = '${multiOrgUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "userId" = '${multiOrgUserId}' OR "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_branches" WHERE "organizationId" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${multiOrgUserId}' OR "email" LIKE '%@invite-test.com'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}', '${orgUnrelatedId}')`);
    });
    await prisma.$disconnect();
  });

  describe('1. Multi-Tenant Context Switching', () => {
    it('should list all organizations the user belongs to', async () => {
      const orgs = await organizationsService.listUserOrganizations(multiOrgUserId);
      expect(orgs.length).toBe(2);

      const orgIds = orgs.map((o) => o.organization.id);
      expect(orgIds).toContain(orgAId);
      expect(orgIds).toContain(orgBId);
      expect(orgIds).not.toContain(orgUnrelatedId);
    });

    it('should allow user to switch to Org B and generate a valid session for Org B', async () => {
      const switchRes = await organizationsService.switchOrganization(multiOrgUserId, orgBId);
      expect(switchRes.activeOrganization.id).toBe(orgBId);
      expect(switchRes.sessionToken).toBeDefined();

      const session = await sessionService.validateSession(switchRes.sessionToken!);
      expect(session?.organizationId).toBe(orgBId);
      expect(session?.userId).toBe(multiOrgUserId);
    });

    it('should REJECT switching to an organization the user does not belong to (Negative Test)', async () => {
      await expect(
        organizationsService.switchOrganization(multiOrgUserId, orgUnrelatedId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('2. Branch Management & Assignment', () => {
    it('should create and list branches within active organization', async () => {
      const branch = await organizationsService.createBranch(orgAId, {
        code: 'DEL-NORTH',
        name: 'Delhi North Hub',
        city: 'New Delhi',
        state: 'Delhi',
      });

      expect(branch.id).toBeDefined();
      expect(branch.code).toBe('DEL-NORTH');
      expect(branch.organizationId).toBe(orgAId);

      const branches = await organizationsService.listBranches(orgAId);
      expect(branches.some((b) => b.code === 'DEL-NORTH')).toBe(true);
    });
  });

  describe('3. Employee Invitation Workflow', () => {
    it('should create invitation, verify token, and accept invitation into organization', async () => {
      const inviteeEmail = 'technician.rajesh@invite-test.com';

      // 1. Send invitation
      const inviteRes = await organizationsService.createInvitation(orgAId, multiOrgUserId, {
        email: inviteeEmail,
        roleCode: 'TECHNICIAN',
      });

      expect(inviteRes.invitationId).toBeDefined();
      expect(inviteRes.email).toBe(inviteeEmail);
      expect(inviteRes.invitationToken).toBeDefined();

      // 2. Accept invitation
      const acceptRes = await organizationsService.acceptInvitation({
        token: inviteRes.invitationToken,
        password: 'SolarTechPassword2026!#',
        firstName: 'Rajesh',
        lastName: 'Kumar',
      });

      expect(acceptRes.message).toContain('accepted successfully');

      // 3. Verify user and membership created in DB
      const user = await prisma.user.findUnique({
        where: { email: inviteeEmail },
        include: {
          memberships: {
            include: { roles: { include: { role: true } } },
          },
        },
      });

      expect(user).not.toBeNull();
      expect(user?.status).toBe('ACTIVE');
      expect(user?.memberships.length).toBe(1);
      expect(user?.memberships[0].organizationId).toBe(orgAId);
      expect(user?.memberships[0].roles.some((r) => r.role.code === 'TECHNICIAN')).toBe(true);
    });
  });
});
