import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { AccessControlService } from '../../apps/api/src/modules/access-control/access-control.service';
import { PERMISSION_REGISTRY, SYSTEM_ROLE_TEMPLATES } from '../../apps/api/src/modules/access-control/permissions.registry';

describe('Phase 0.5 — RBAC & Permission Evaluation Integration Suite', () => {
  let prisma: PrismaService;
  let accessControlService: AccessControlService;

  const testOrgId = '77777777-7777-4777-8777-777777777777';
  const testUserId = '88888888-8888-4888-8888-888888888888';

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();
    accessControlService = new AccessControlService(prisma);

    await accessControlService.seedPermissionsAndSystemRoles();

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "membership_roles" WHERE "membershipId" IN (SELECT "id" FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "roles" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${testOrgId}'`);

      await tx.organization.create({
        data: {
          id: testOrgId,
          slug: 'rbac-test-org',
          name: 'RBAC Test Org',
        },
      });

      await tx.user.create({
        data: {
          id: testUserId,
          email: 'rbac.user@solartest.com',
          firstName: 'RBAC',
          lastName: 'Tester',
          status: 'ACTIVE',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "membership_roles" WHERE "membershipId" IN (SELECT "id" FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "roles" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" = '${testOrgId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${testUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${testOrgId}'`);
    });
    await prisma.$disconnect();
  });

  describe('1. Permission Registry Coverage', () => {
    it('should have all registry permissions seeded in the database', async () => {
      const dbPermissions = await accessControlService.listPermissions();
      expect(dbPermissions.length).toBeGreaterThanOrEqual(PERMISSION_REGISTRY.length);

      const codes = new Set(dbPermissions.map((p) => p.code));
      for (const expected of PERMISSION_REGISTRY) {
        expect(codes.has(expected.code)).toBe(true);
      }
    });

    it('should have all system role templates seeded in the database', async () => {
      const dbRoles = await accessControlService.listRoles();
      const roleCodes = new Set(dbRoles.map((r) => r.code));

      for (const t of SYSTEM_ROLE_TEMPLATES) {
        expect(roleCodes.has(t.code)).toBe(true);
      }
    });
  });

  describe('2. Effective Permissions Evaluation for User Roles', () => {
    it('should correctly evaluate permissions when assigned TECHNICIAN role', async () => {
      // Create membership and assign TECHNICIAN role
      const techRole = await prisma.role.findFirstOrThrow({
        where: { code: 'TECHNICIAN', organizationId: null },
      });

      const membership = await prisma.organizationMembership.create({
        data: {
          organizationId: testOrgId,
          userId: testUserId,
          isActive: true,
        },
      });

      await prisma.membershipRole.create({
        data: {
          membershipId: membership.id,
          roleId: techRole.id,
        },
      });

      const effective = await accessControlService.getEffectivePermissions(testUserId, testOrgId);
      expect(effective.roles).toContain('TECHNICIAN');
      expect(effective.permissions).toContain('survey:surveys:read');
      expect(effective.permissions).toContain('survey:surveys:update');

      // TECHNICIAN should NOT have pricing update permission
      expect(effective.permissions).not.toContain('catalog:pricing:update');
      // TECHNICIAN should NOT have survey review/approval permission
      expect(effective.permissions).not.toContain('survey:surveys:review');
    });

    it('should combine permissions when user has multiple roles', async () => {
      const salesRole = await prisma.role.findFirstOrThrow({
        where: { code: 'SALES_REP', organizationId: null },
      });

      const membership = await prisma.organizationMembership.findFirstOrThrow({
        where: { userId: testUserId, organizationId: testOrgId },
      });

      await prisma.membershipRole.create({
        data: {
          membershipId: membership.id,
          roleId: salesRole.id,
        },
      });

      const effective = await accessControlService.getEffectivePermissions(testUserId, testOrgId);
      expect(effective.roles).toContain('TECHNICIAN');
      expect(effective.roles).toContain('SALES_REP');

      // Now user has both survey update AND lead creation permissions
      expect(effective.permissions).toContain('survey:surveys:update');
      expect(effective.permissions).toContain('crm:leads:create');
      expect(effective.permissions).toContain('quotation:quotations:manage');
    });
  });

  describe('3. Custom Organization Role Management', () => {
    it('should allow creating, updating, and deleting custom roles scoped to organization', async () => {
      const readPerm = await prisma.permission.findFirstOrThrow({ where: { code: 'crm:leads:read' } });
      const exportPerm = await prisma.permission.findFirstOrThrow({ where: { code: 'crm:leads:export' } });

      // Create custom role
      const customRole = await accessControlService.createRole(testOrgId, {
        code: 'CUSTOM_LEAD_AUDITOR',
        name: 'Lead Auditor',
        description: 'Read and export leads only',
        permissionIds: [readPerm.id, exportPerm.id],
      });

      expect(customRole.code).toBe('CUSTOM_LEAD_AUDITOR');
      expect(customRole.organizationId).toBe(testOrgId);
      expect(customRole.isSystem).toBe(false);
      expect(customRole.permissions).toContain('crm:leads:read');
      expect(customRole.permissions).toContain('crm:leads:export');

      // Update custom role
      const updatePerm = await prisma.permission.findFirstOrThrow({ where: { code: 'customer:customers:read' } });
      const updatedRole = await accessControlService.updateRole(customRole.id, testOrgId, {
        name: 'Lead & Customer Auditor',
        permissionIds: [readPerm.id, exportPerm.id, updatePerm.id],
      });

      expect(updatedRole.name).toBe('Lead & Customer Auditor');
      expect(updatedRole.permissions).toContain('customer:customers:read');

      // Delete custom role
      await accessControlService.deleteRole(customRole.id, testOrgId);
      await expect(accessControlService.getRoleById(customRole.id, testOrgId)).rejects.toThrow();
    });
  });
});
