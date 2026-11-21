import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { PlatformAuditService } from '../../apps/api/src/modules/platform-admin/services/platform-audit.service';
import { PlatformOverviewService } from '../../apps/api/src/modules/platform-admin/services/platform-overview.service';
import { PlatformOrganizationsService } from '../../apps/api/src/modules/platform-admin/services/platform-organizations.service';
import { PlatformEnquiriesService } from '../../apps/api/src/modules/platform-admin/services/platform-enquiries.service';
import { PlatformHealthService } from '../../apps/api/src/modules/platform-admin/services/platform-health.service';
import { PlatformAdminManagementService } from '../../apps/api/src/modules/platform-admin/services/platform-admin-management.service';
import { PasswordService } from '../../apps/api/src/modules/identity/password.service';
import { BadRequestException } from '@nestjs/common';
import { PlatformRole } from '@solaros/types';

describe('SunPowerOS Platform Admin — Core Lifecycle, Enquiries & Health', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let auditService: PlatformAuditService;
  let overviewService: PlatformOverviewService;
  let orgsService: PlatformOrganizationsService;
  let enquiriesService: PlatformEnquiriesService;
  let healthService: PlatformHealthService;
  let managementService: PlatformAdminManagementService;
  let passwordService: PasswordService;

  const testSuperAdmin = {
    userId: '99999999-9999-4999-9999-999999999999',
    adminId: '88888888-8888-4888-8888-888888888888',
    email: 'test-platform-owner@sunpowersolutions.in',
  };

  const testTenant = {
    organizationId: '77777777-7777-4777-7777-777777777777',
    slug: 'lifecycle-test-epc',
    name: 'Lifecycle Test Solar EPC',
  };

  let testEnquiryRef: string;
  let testEnquiryId: string;
  let testAlertId: string;

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
    passwordService = new PasswordService();
    overviewService = new PlatformOverviewService(prisma);
    orgsService = new PlatformOrganizationsService(prisma, auditService);
    enquiriesService = new PlatformEnquiriesService(prisma, numberingService, auditService);
    healthService = new PlatformHealthService(prisma, numberingService, auditService);
    managementService = new PlatformAdminManagementService(prisma, passwordService, auditService);

    // Clean up previous runs
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiry_activities" WHERE "enquiryId" IN (SELECT id FROM "platform_enquiries" WHERE email = 'prospect@commercialsolar.in')`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiries" WHERE email = 'prospect@commercialsolar.in'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_alerts" WHERE "source" = 'TestHealthMonitor'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_audit_events" WHERE "actorId" = '${testSuperAdmin.adminId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_subscriptions" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_administrators" WHERE "id" = '${testSuperAdmin.adminId}' OR "userId" = '${testSuperAdmin.userId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" = '${testSuperAdmin.userId}' OR "email" = '${testSuperAdmin.email}'`,
      );

      // Seed SuperAdmin User & PlatformAdministrator
      const pwHash = await passwordService.hashPassword('SuperAdmin123!');
      await tx.user.create({
        data: {
          id: testSuperAdmin.userId,
          email: testSuperAdmin.email,
          firstName: 'Platform',
          lastName: 'Director',
          passwordHash: pwHash,
          isSuperAdmin: true,
          isActive: true,
        },
      });

      await tx.platformAdministrator.create({
        data: {
          id: testSuperAdmin.adminId,
          userId: testSuperAdmin.userId,
          role: PlatformRole.PLATFORM_OWNER,
          isActive: true,
          permissions: ['*'],
        },
      });

      // Seed test tenant organization
      await tx.organization.create({
        data: {
          id: testTenant.organizationId,
          slug: testTenant.slug,
          name: testTenant.name,
          status: 'ACTIVE',
          isActive: true,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiry_activities" WHERE "enquiryId" IN (SELECT id FROM "platform_enquiries" WHERE email = 'prospect@commercialsolar.in')`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_enquiries" WHERE email = 'prospect@commercialsolar.in'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_alerts" WHERE "source" = 'TestHealthMonitor'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_subscriptions" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_administrators" WHERE "id" = '${testSuperAdmin.adminId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" = '${testSuperAdmin.userId}'`,
      );
    });
    await prisma.$disconnect();
  });

  describe('1. Platform Overview & Metrics', () => {
    it('should aggregate metrics across all organizations without error', async () => {
      const metrics = await overviewService.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.totalOrganizations).toBeGreaterThanOrEqual(1);
      expect(metrics.activeOrganizations).toBeGreaterThanOrEqual(1);
      expect(metrics.totalUsers).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(metrics.monthlyGrowth)).toBe(true);
      expect(metrics.monthlyGrowth.length).toBe(6);
    });
  });

  describe('2. Public Website Enquiries & Lead Progression', () => {
    it('should accept public enquiry and generate ENQ-YYYY-000001 sequence', async () => {
      const result = await enquiriesService.submitPublicEnquiry(
        {
          name: 'Rajesh Mehra',
          email: 'prospect@commercialsolar.in',
          company: 'Mehra Textiles Ltd',
          phone: '+91 98765 00001',
          category: 'SALES_DEMO',
          projectCapacity: '100 kW Rooftop',
          message: 'Looking for an enterprise ERP to manage rooftop solar operations.',
        },
        '127.0.0.1',
      );

      expect(result.success).toBe(true);
      expect(result.referenceNumber).toMatch(/^ENQ-\d{4}-\d{6}$/);
      testEnquiryRef = result.referenceNumber;

      // Find in database
      const found = await prisma.platformEnquiry.findUnique({
        where: { referenceNumber: testEnquiryRef },
      });
      expect(found).toBeDefined();
      expect(found?.status).toBe('NEW');
      testEnquiryId = found!.id;
    });

    it('should assign enquiry to platform administrator and update status', async () => {
      // Assign
      const assigned = await enquiriesService.assignEnquiry(
        testEnquiryId,
        { assignedToId: testSuperAdmin.adminId },
        testSuperAdmin.adminId,
        testSuperAdmin.email,
      );
      expect(assigned.assignedToId).toBe(testSuperAdmin.adminId);

      // Update status
      const updated = await enquiriesService.updateStatus(
        testEnquiryId,
        { status: 'CONTACTED', notes: 'Scheduled demo call for Thursday 3 PM' },
        testSuperAdmin.adminId,
        testSuperAdmin.email,
      );
      expect(updated.status).toBe('CONTACTED');

      // Add note
      const noted = await enquiriesService.addNote(
        testEnquiryId,
        { notes: 'Demo completed. High interest in BOM and dispatch.' },
        testSuperAdmin.adminId,
        testSuperAdmin.email,
      );
      expect(noted.internalNotes).toContain('High interest in BOM');
    });
  });

  describe('3. Organization Lifecycle Management & Suspension', () => {
    it('should list organizations and retrieve 360 detail workspace', async () => {
      const list = await orgsService.listOrganizations({
        search: testTenant.slug,
      });
      expect(list.items.length).toBeGreaterThanOrEqual(1);

      const detail = await orgsService.getOrganizationDetail(testTenant.organizationId);
      expect(detail.organization.id).toBe(testTenant.organizationId);
      expect(detail.organization.name).toBe(testTenant.name);
      expect(detail.storage).toBeDefined();
    });

    it('should enforce descriptive suspension reason and suspend organization', async () => {
      // Attempt with too short reason
      await expect(
        orgsService.suspendOrganization(
          testTenant.organizationId,
          { reason: 'bad' },
          testSuperAdmin.adminId,
          testSuperAdmin.email,
        ),
      ).rejects.toThrow(BadRequestException);

      // Suspend with valid reason
      const suspended = await orgsService.suspendOrganization(
        testTenant.organizationId,
        { reason: 'Subscription payment overdue 30 days' },
        testSuperAdmin.adminId,
        testSuperAdmin.email,
      );

      expect(suspended.status).toBe('SUSPENDED');
      expect(suspended.isActive).toBe(false);
      expect(suspended.suspensionReason).toBe('Subscription payment overdue 30 days');
      expect(suspended.suspendedById).toBe(testSuperAdmin.adminId);
    });

    it('should reactivate organization and clear suspension flags', async () => {
      const reactivated = await orgsService.reactivateOrganization(
        testTenant.organizationId,
        testSuperAdmin.adminId,
        testSuperAdmin.email,
        'Payment received in full',
      );

      expect(reactivated.status).toBe('ACTIVE');
      expect(reactivated.isActive).toBe(true);
      expect(reactivated.suspensionReason).toBeNull();
      expect(reactivated.suspendedAt).toBeNull();
    });
  });

  describe('4. Infrastructure Health & Alert Resolution', () => {
    it('should check PostgreSQL connectivity and report healthy status', async () => {
      const health = await healthService.getSystemHealth();
      expect(health.services.database.status).toBe('HEALTHY');
      expect(health.services.database.latencyMs).toBeGreaterThanOrEqual(0);
      expect(health.services.storage.status).toBe('HEALTHY');
    });

    it('should create and resolve platform alert with audit tracking', async () => {
      const alert = await healthService.createAlert({
        severity: 'WARNING',
        category: 'STORAGE',
        source: 'TestHealthMonitor',
        title: 'Storage warning threshold',
        message: 'Tenant approaching 80% MinIO storage allocation',
      });

      expect(alert.alertNumber).toMatch(/^ALT-\d{4}-\d{6}$/);
      expect(alert.status).toBe('OPEN');
      testAlertId = alert.id;

      // Acknowledge
      const acked = await healthService.acknowledgeAlert(testAlertId, testSuperAdmin.adminId);
      expect(acked.status).toBe('ACKNOWLEDGED');

      // Resolve
      const resolved = await healthService.resolveAlert(
        testAlertId,
        { notes: 'Tenant storage quota increased' },
        testSuperAdmin.adminId,
        testSuperAdmin.email,
      );
      expect(resolved.status).toBe('RESOLVED');
      expect(resolved.resolvedAt).toBeDefined();
    });
  });
});
