import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { PlatformAuditService } from '../../apps/api/src/modules/platform-admin/services/platform-audit.service';
import { PlatformSupportService } from '../../apps/api/src/modules/platform-admin/services/platform-support.service';
import { ForbiddenException } from '@nestjs/common';
import { PlatformRole } from '@solaros/types';

describe('SunPowerOS Platform Admin — Tenant Support & Escalations', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let auditService: PlatformAuditService;
  let supportService: PlatformSupportService;

  const testSuperAdmin = {
    userId: '66666666-6666-4666-6666-666666666666',
    adminId: '55555555-5555-4555-5555-555555555555',
    email: 'support-admin@sunpowersolutions.in',
  };

  const testTenant = {
    organizationId: '44444444-4444-4444-4444-444444444444',
    slug: 'support-test-epc',
    name: 'Support Test EPC Ltd',
    userId: '33333333-3333-4333-3333-333333333333',
    email: 'operations@supporttestepc.com',
  };

  let testTicketId: string;
  let testTicketNumber: string;

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
    supportService = new PlatformSupportService(prisma, numberingService, auditService);

    // Clean up previous runs
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "support_ticket_messages" WHERE "ticketId" IN (SELECT id FROM "support_tickets" WHERE "organizationId" = '${testTenant.organizationId}')`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "support_tickets" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_memberships" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_administrators" WHERE "id" = '${testSuperAdmin.adminId}' OR "userId" = '${testSuperAdmin.userId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" IN ('${testSuperAdmin.userId}', '${testTenant.userId}')`,
      );

      // Create Platform Admin
      await tx.user.create({
        data: {
          id: testSuperAdmin.userId,
          email: testSuperAdmin.email,
          firstName: 'Support',
          lastName: 'Lead',
          isSuperAdmin: true,
          isActive: true,
        },
      });

      await tx.platformAdministrator.create({
        data: {
          id: testSuperAdmin.adminId,
          userId: testSuperAdmin.userId,
          role: PlatformRole.PLATFORM_SUPPORT,
          isActive: true,
          permissions: ['platform:manage_support'],
        },
      });

      // Create Tenant User & Org
      await tx.organization.create({
        data: {
          id: testTenant.organizationId,
          slug: testTenant.slug,
          name: testTenant.name,
          status: 'ACTIVE',
          isActive: true,
        },
      });

      await tx.user.create({
        data: {
          id: testTenant.userId,
          email: testTenant.email,
          firstName: 'Anand',
          lastName: 'Varma',
          isActive: true,
        },
      });

      await tx.organizationMembership.create({
        data: {
          organizationId: testTenant.organizationId,
          userId: testTenant.userId,
          isActive: true,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(
        `DELETE FROM "support_ticket_messages" WHERE "ticketId" IN (SELECT id FROM "support_tickets" WHERE "organizationId" = '${testTenant.organizationId}')`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "support_tickets" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organization_memberships" WHERE "organizationId" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "organizations" WHERE "id" = '${testTenant.organizationId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "platform_administrators" WHERE "id" = '${testSuperAdmin.adminId}'`,
      );
      await tx.$executeRawUnsafe(
        `DELETE FROM "users" WHERE "id" IN ('${testSuperAdmin.userId}', '${testTenant.userId}')`,
      );
    });
    await prisma.$disconnect();
  });

  it('1. Tenant User should submit support ticket with TCK-YYYY-000001 format', async () => {
    const ticket = await supportService.createTenantTicket(
      testTenant.organizationId,
      testTenant.userId,
      {
        subject: 'BOM pricing calculation mismatch on inverter sync',
        category: 'TECHNICAL',
        priority: 'HIGH',
        message: 'When compiling 50 kW BOM, inverter GST tax is not matching commercial quote.',
      },
    );

    expect(ticket).toBeDefined();
    expect(ticket.ticketNumber).toMatch(/^TCK-\d{4}-\d{6}$/);
    expect(ticket.status).toBe('OPEN');
    expect(ticket.messages.length).toBe(1);
    expect(ticket.messages[0].senderType).toBe('TENANT_USER');

    testTicketId = ticket.id;
    testTicketNumber = ticket.ticketNumber;
  });

  it('2. Platform support agent should assign and send internal note', async () => {
    // Assign
    const assigned = await supportService.assignTicket(
      testTicketId,
      { assignedToId: testSuperAdmin.adminId },
      testSuperAdmin.adminId,
      testSuperAdmin.email,
    );
    expect(assigned.assignedToId).toBe(testSuperAdmin.adminId);
    expect(assigned.status).toBe('IN_PROGRESS');

    // Internal Note
    const internalMsg = await supportService.replyTicket(
      testTicketId,
      testSuperAdmin.userId,
      'PLATFORM_ADMIN',
      {
        message: 'Checked database logs: tax rounding rule discrepancy identified in catalog.',
        isInternalOnly: true,
      },
    );
    expect(internalMsg.isInternalOnly).toBe(true);
  });

  it('3. Internal notes should NOT be visible to tenant user', async () => {
    // Tenant user fetches ticket detail
    const tenantView = await supportService.getTicketDetail(
      testTicketId,
      false, // isPlatformAdmin = false
      testTenant.organizationId,
    );

    const hasInternalMessage = tenantView.messages.some((m: any) => m.isInternalOnly);
    expect(hasInternalMessage).toBe(false);

    // Platform admin fetches ticket detail
    const adminView = await supportService.getTicketDetail(
      testTicketId,
      true, // isPlatformAdmin = true
    );
    const adminHasInternalMessage = adminView.messages.some((m: any) => m.isInternalOnly);
    expect(adminHasInternalMessage).toBe(true);
  });

  it('4. Platform support agent public reply and ticket resolution', async () => {
    // Public reply to customer
    const publicMsg = await supportService.replyTicket(
      testTicketId,
      testSuperAdmin.userId,
      'PLATFORM_ADMIN',
      {
        message: 'We have updated the catalog GST rounding rule. Please refresh your BOM.',
        isInternalOnly: false,
      },
    );
    expect(publicMsg.isInternalOnly).toBe(false);

    // Verify ticket status became WAITING_ON_CUSTOMER
    const detailAfterReply = await supportService.getTicketDetail(testTicketId, true);
    expect(detailAfterReply.status).toBe('WAITING_ON_CUSTOMER');

    // Resolve ticket
    const resolved = await supportService.updateTicketStatus(
      testTicketId,
      { status: 'RESOLVED', resolutionNotes: 'Catalog tax rule patch applied' },
      testSuperAdmin.adminId,
      testSuperAdmin.email,
    );
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedAt).toBeDefined();
  });
});
