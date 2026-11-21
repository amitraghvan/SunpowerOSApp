import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { PasswordService } from '../../apps/api/src/modules/identity/password.service';
import { SessionService } from '../../apps/api/src/modules/identity/session.service';
import { AccessControlService } from '../../apps/api/src/modules/access-control/access-control.service';
import { AuthenticationGuard } from '../../apps/api/src/common/guards/authentication.guard';
import { TenantContextGuard } from '../../apps/api/src/common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../apps/api/src/common/guards/permissions.guard';
import { PERMISSIONS_KEY } from '../../apps/api/src/common/decorators/require-permissions.decorator';
import { API_CONSTANTS } from '@solaros/config';

describe('Phase 0.5 — Centralized RBAC & Module Security Guards Integration Suite', () => {
  let prisma: PrismaService;
  let sessionService: SessionService;
  let accessControlService: AccessControlService;
  let reflector: Reflector;
  let authGuard: AuthenticationGuard;
  let tenantGuard: TenantContextGuard;
  let permGuard: PermissionsGuard;

  const orgAlpha = '12121212-1212-4212-8212-121212121212';
  const orgBeta = '23232323-2323-4323-8323-232323232323';
  const techUserId = '34343434-3434-4434-8434-343434343434';
  const salesUserId = '45454545-4545-4545-8545-454545454545';

  let techSessionToken: string;
  let salesSessionToken: string;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    sessionService = new SessionService(prisma);
    accessControlService = new AccessControlService(prisma);
    reflector = new Reflector();

    authGuard = new AuthenticationGuard(reflector, sessionService);
    tenantGuard = new TenantContextGuard(reflector, prisma, accessControlService);
    permGuard = new PermissionsGuard(reflector);

    await accessControlService.seedPermissionsAndSystemRoles();

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" IN ('${techUserId}', '${salesUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "membership_roles" WHERE "membershipId" IN (SELECT "id" FROM "organization_memberships" WHERE "organizationId" IN ('${orgAlpha}', '${orgBeta}'))`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" IN ('${orgAlpha}', '${orgBeta}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${techUserId}', '${salesUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAlpha}', '${orgBeta}')`);

      // Create Org Alpha and Org Beta
      await tx.organization.createMany({
        data: [
          { id: orgAlpha, slug: 'alpha-solar', name: 'Alpha Solar' },
          { id: orgBeta, slug: 'beta-solar', name: 'Beta Solar' },
        ],
      });

      // Create users
      await tx.user.createMany({
        data: [
          { id: techUserId, email: 'tech@alpha.com', firstName: 'Tech', lastName: 'Guy', status: 'ACTIVE' },
          { id: salesUserId, email: 'sales@alpha.com', firstName: 'Sales', lastName: 'Rep', status: 'ACTIVE' },
        ],
      });

      // Memberships in Org Alpha
      const mTech = await tx.organizationMembership.create({
        data: { organizationId: orgAlpha, userId: techUserId, isActive: true },
      });
      const mSales = await tx.organizationMembership.create({
        data: { organizationId: orgAlpha, userId: salesUserId, isActive: true },
      });

      // Role assignment
      const techRole = await tx.role.findFirstOrThrow({ where: { code: 'TECHNICIAN', organizationId: null } });
      const salesRole = await tx.role.findFirstOrThrow({ where: { code: 'SALES_REP', organizationId: null } });

      await tx.membershipRole.createMany({
        data: [
          { membershipId: mTech.id, roleId: techRole.id },
          { membershipId: mSales.id, roleId: salesRole.id },
        ],
      });
    });

    // Create active sessions in Org Alpha
    const techSession = await sessionService.createSession({ userId: techUserId, organizationId: orgAlpha });
    techSessionToken = techSession.rawToken;

    const salesSession = await sessionService.createSession({ userId: salesUserId, organizationId: orgAlpha });
    salesSessionToken = salesSession.rawToken;
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "sessions" WHERE "userId" IN ('${techUserId}', '${salesUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "membership_roles" WHERE "membershipId" IN (SELECT "id" FROM "organization_memberships" WHERE "organizationId" IN ('${orgAlpha}', '${orgBeta}'))`);
      await tx.$executeRawUnsafe(`DELETE FROM "organization_memberships" WHERE "organizationId" IN ('${orgAlpha}', '${orgBeta}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${techUserId}', '${salesUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAlpha}', '${orgBeta}')`);
    });
    await prisma.$disconnect();
  });

  function createMockExecutionContext(req: any, requiredPerms?: string[]): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
        getNext: () => ({}),
      }),
      getHandler: () => () => {},
      getClass: () => ({}),
    } as any;
  }

  describe('1. AuthenticationGuard Validation', () => {
    it('should throw 401 Unauthorized when request lacks session cookie and Bearer token', async () => {
      const req = { headers: {} };
      const ctx = createMockExecutionContext(req);

      await expect(authGuard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('should pass and attach user when valid Bearer token is provided', async () => {
      const req: any = {
        headers: { authorization: `Bearer ${techSessionToken}` },
      };
      const ctx = createMockExecutionContext(req);

      const result = await authGuard.canActivate(ctx);
      expect(result).toBe(true);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(techUserId);
    });
  });

  describe('2. Cross-Tenant Protection in TenantContextGuard', () => {
    it('should throw 403 Forbidden when authenticated user attempts cross-tenant access to Org Beta', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${techSessionToken}`,
          [API_CONSTANTS.TENANT_ID_HEADER]: orgBeta, // User only belongs to orgAlpha!
        },
      };
      const ctx = createMockExecutionContext(req);

      await authGuard.canActivate(ctx);
      await expect(tenantGuard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
    });

    it('should populate tenantContext and effective permissions when user accesses own organization', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${techSessionToken}`,
          [API_CONSTANTS.TENANT_ID_HEADER]: orgAlpha,
        },
      };
      const ctx = createMockExecutionContext(req);

      await authGuard.canActivate(ctx);
      await tenantGuard.canActivate(ctx);

      expect(req.tenantContext).toBeDefined();
      expect(req.tenantContext.organizationId).toBe(orgAlpha);
      expect(req.tenantContext.roles).toContain('TECHNICIAN');
      expect(req.tenantContext.permissions).toContain('survey:surveys:update');
    });
  });

  describe('3. Fine-Grained PermissionsGuard Enforcement Across Modules', () => {
    it('should REJECT Technician from accessing Survey Review with 403 Forbidden', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${techSessionToken}`,
          [API_CONSTANTS.TENANT_ID_HEADER]: orgAlpha,
        },
      };
      const ctx = createMockExecutionContext(req);
      await authGuard.canActivate(ctx);
      await tenantGuard.canActivate(ctx);

      // Mock route requiring 'survey:surveys:review'
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['survey:surveys:review'];
        return false;
      });

      expect(() => permGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should REJECT Sales Rep from updating Product Pricing with 403 Forbidden', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${salesSessionToken}`,
          [API_CONSTANTS.TENANT_ID_HEADER]: orgAlpha,
        },
      };
      const ctx = createMockExecutionContext(req);
      await authGuard.canActivate(ctx);
      await tenantGuard.canActivate(ctx);

      // Mock route requiring 'catalog:pricing:update'
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['catalog:pricing:update'];
        return false;
      });

      expect(() => permGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should ALLOW Sales Rep to create CRM Leads (has crm:leads:create permission)', async () => {
      const req: any = {
        headers: {
          authorization: `Bearer ${salesSessionToken}`,
          [API_CONSTANTS.TENANT_ID_HEADER]: orgAlpha,
        },
      };
      const ctx = createMockExecutionContext(req);
      await authGuard.canActivate(ctx);
      await tenantGuard.canActivate(ctx);

      // Route requiring 'crm:leads:create'
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['crm:leads:create'];
        return false;
      });

      const permitted = permGuard.canActivate(ctx);
      expect(permitted).toBe(true);
    });
  });
});
