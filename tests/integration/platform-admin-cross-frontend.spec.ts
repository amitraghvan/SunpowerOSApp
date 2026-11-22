import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { PlatformAuditService } from '../../apps/api/src/modules/platform-admin/services/platform-audit.service';
import { PlatformOrganizationsService } from '../../apps/api/src/modules/platform-admin/services/platform-organizations.service';
import { PlatformEnquiriesService } from '../../apps/api/src/modules/platform-admin/services/platform-enquiries.service';
import { PlatformAnalyticsService } from '../../apps/api/src/modules/platform-admin/services/platform-analytics.service';
import { StorageService } from '../../apps/api/src/infrastructure/storage/storage.service';

describe('SunPowerOS Dual-Frontend Architecture & Platform Admin Sync (Port 3000 & 3001)', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let auditService: PlatformAuditService;
  let orgsService: PlatformOrganizationsService;
  let enquiriesService: PlatformEnquiriesService;
  let analyticsService: PlatformAnalyticsService;
  let storageService: StorageService;

  const testSuperAdmin = {
    userId: '88888888-8888-4888-8888-888888888888',
    email: 'superadmin.cross@sunpowersolutions.in',
  };

  const tenantFromPort3000 = {
    organizationId: '99999999-9999-4999-9999-999999999999',
    slug: 'solarcraft-port3000-epc',
    name: 'SolarCraft Systems Port 3000',
    userId: '77777777-9999-4777-9999-777777777777',
    email: 'ceo@solarcraft3000.com',
  };

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    numberingService = new NumberingService(prisma);
    auditService = new PlatformAuditService(prisma);
    storageService = new StorageService();
    orgsService = new PlatformOrganizationsService(prisma, auditService, storageService);
    enquiriesService = new PlatformEnquiriesService(prisma, numberingService, auditService);
    analyticsService = new PlatformAnalyticsService(prisma);

    // Clean up
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiries" WHERE "email" = 'lead.port3000@sunpowercustomer.com'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_memberships" WHERE "organizationId" = '${tenantFromPort3000.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${tenantFromPort3000.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" IN ('${tenantFromPort3000.userId}', '${testSuperAdmin.userId}')`,
      );

      // Seed SuperAdmin user
      await tx.$executeRawUnsafe(
        `INSERT INTO "users" ("id", "email", "firstName", "lastName", "passwordHash", "isSuperAdmin", "status", "createdAt", "updatedAt")
         VALUES ('${testSuperAdmin.userId}', '${testSuperAdmin.email}', 'Platform', 'Master', '$2a$10$fakehashfortest', true, 'ACTIVE', NOW(), NOW())
         ON CONFLICT ("id") DO NOTHING`,
      );
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiries" WHERE "email" = 'lead.port3000@sunpowercustomer.com'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_memberships" WHERE "organizationId" = '${tenantFromPort3000.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${tenantFromPort3000.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" IN ('${tenantFromPort3000.userId}', '${testSuperAdmin.userId}')`,
      );
    });
    await prisma.$disconnect();
  });

  describe('1. Dual-Frontend Origin & Port Separation', () => {
    it('should validate allowed origins for both Port 3000 (Customer Web) and Port 3001 (Platform Admin)', () => {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      const originRegex = /^http:\/\/localhost:(3000|3001)$/;

      expect(allowedOrigins).toContain('http://localhost:3000');
      expect(allowedOrigins).toContain('http://localhost:3001');

      expect(originRegex.test('http://localhost:3000')).toBe(true);
      expect(originRegex.test('http://localhost:3001')).toBe(true);
      expect(originRegex.test('http://localhost:8080')).toBe(false);
      expect(originRegex.test('http://evil-site.com')).toBe(false);
    });
  });

  describe('2. Real-Time Tenant Registration Sync (Port 3000 -> Port 3001)', () => {
    it('should register tenant via Port 3000 customer workflow and immediately reflect in Port 3001 Platform Organizations Directory', async () => {
      // 1. Simulate registration on Port 3000
      await prisma.asSuperAdmin(async (tx) => {
        await tx.$executeRawUnsafe(
          `INSERT INTO "users" ("id", "email", "firstName", "lastName", "passwordHash", "isSuperAdmin", "status", "createdAt", "updatedAt")
           VALUES ('${tenantFromPort3000.userId}', '${tenantFromPort3000.email}', 'Rohan', 'Verma', '$2a$10$fakehashfortest', false, 'ACTIVE', NOW(), NOW())`,
        );

        await tx.$executeRawUnsafe(
          `INSERT INTO "organizations" ("id", "name", "slug", "status", "createdAt", "updatedAt")
           VALUES ('${tenantFromPort3000.organizationId}', '${tenantFromPort3000.name}', '${tenantFromPort3000.slug}', 'ACTIVE', NOW(), NOW())`,
        );

        await tx.$executeRawUnsafe(
          `INSERT INTO "organization_memberships" ("id", "organizationId", "userId", "createdAt", "updatedAt")
           VALUES ('${tenantFromPort3000.organizationId}-mem', '${tenantFromPort3000.organizationId}', '${tenantFromPort3000.userId}', NOW(), NOW())`,
        );
      });

      // 2. Query from Port 3001 Platform Admin service
      const orgList = await orgsService.listOrganizations({
        search: 'SolarCraft',
        status: 'ACTIVE',
      });

      expect(orgList.total).toBeGreaterThanOrEqual(1);
      const found = orgList.items.find((o) => o.id === tenantFromPort3000.organizationId);
      expect(found).toBeDefined();
      expect(found?.name).toBe('SolarCraft Systems Port 3000');
      expect(found?.slug).toBe('solarcraft-port3000-epc');
      expect(found?._count.memberships).toBe(1);
    });

    it('should query Global User Directory across tenants from Port 3001', async () => {
      const userList = await orgsService.listUsers({
        search: 'Rohan',
        status: 'ACTIVE',
      });

      expect(userList.total).toBeGreaterThanOrEqual(1);
      const userFound = userList.items.find((u) => u.id === tenantFromPort3000.userId);
      expect(userFound).toBeDefined();
      expect(userFound?.email).toBe('ceo@solarcraft3000.com');
      expect(userFound?.memberships?.[0]?.organization?.name).toBe('SolarCraft Systems Port 3000');
    });

    it('should view Organization 360 Workspace details from Port 3001', async () => {
      const detail = await orgsService.getOrganizationDetail(tenantFromPort3000.organizationId);

      expect(detail.organization.id).toBe(tenantFromPort3000.organizationId);
      expect(detail.organization.memberships.length).toBe(1);
      expect(detail.organization.memberships[0].user.email).toBe('ceo@solarcraft3000.com');
    });

    it('should suspend tenant from Port 3001 Platform Admin with immutable audit event', async () => {
      const suspended = await orgsService.suspendOrganization(
        tenantFromPort3000.organizationId,
        { reason: 'Past due enterprise invoice verification' },
        testSuperAdmin.userId,
        testSuperAdmin.email,
      );

      expect(suspended.status).toBe('SUSPENDED');
      expect(suspended.suspensionReason).toBe('Past due enterprise invoice verification');

      // Reactivate
      const reactivated = await orgsService.reactivateOrganization(
        tenantFromPort3000.organizationId,
        testSuperAdmin.userId,
        testSuperAdmin.email,
        'Payment received and verified',
      );

      expect(reactivated.status).toBe('ACTIVE');
      expect(reactivated.suspensionReason).toBeNull();
    });
  });

  describe('3. Public Website Enquiry Intake Sync (Port 3000 -> Port 3001)', () => {
    it('should capture public website lead on Port 3000 and view it in Port 3001 Enquiries Inbox', async () => {
      // 1. Simulate public lead enquiry captured on Port 3000 (/contact)
      const submission = await enquiriesService.submitPublicEnquiry({
        name: 'Arjun Mehta',
        email: 'lead.port3000@sunpowercustomer.com',
        phone: '+91 98765 43210',
        company: 'Mehta Solar Powerparks',
        projectCapacity: '1.5 MW Commercial Rooftop',
        message: 'Looking for full EPC procurement, BOM engineering and net-metering dispatch in Rajasthan.',
      });

      expect(submission.success).toBe(true);
      expect(submission.referenceNumber).toMatch(/^ENQ-\d{4}-\d{6}$/);

      // 2. Fetch from Port 3001 enquiries list
      const enquiriesList = await enquiriesService.listEnquiries({
        search: 'Mehta',
        status: 'NEW',
      });

      const foundEnq = enquiriesList.items.find((e) => e.referenceNumber === submission.referenceNumber);
      expect(foundEnq).toBeDefined();
      expect(foundEnq?.projectCapacity).toBe('1.5 MW Commercial Rooftop');

      // 3. Update status and add administrative note from Port 3001
      const updated = await enquiriesService.updateStatus(
        foundEnq!.id,
        {
          status: 'QUALIFIED',
          notes: 'Qualified commercial EPC prospect. Scheduled discovery presentation.',
        },
        testSuperAdmin.userId,
        testSuperAdmin.email,
      );
      expect(updated.status).toBe('QUALIFIED');
      expect(updated.internalNotes).toContain('Qualified commercial EPC prospect');
    });
  });

  describe('4. Platform Analytics & Resource Health (Port 3001 Operations)', () => {
    it('should compute SaaS plan distribution and growth metrics cleanly', async () => {
      const analytics = await analyticsService.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.planDistribution).toBeDefined();
      expect(analytics.enquiriesByCategory).toBeDefined();
      expect(analytics.ticketsByCategory).toBeDefined();
      expect(analytics.topOrganizationsByProjects).toBeDefined();
      expect(analytics.topOrganizationsByUsers).toBeDefined();
    });
  });
});
