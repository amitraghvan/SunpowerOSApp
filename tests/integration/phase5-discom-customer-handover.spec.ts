import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { DiscomTrackingService } from '../../apps/api/src/modules/installation/discom-tracking.service';
import { CustomerHandoverService } from '../../apps/api/src/modules/installation/customer-handover.service';
import { ProjectCostService } from '../../apps/api/src/modules/installation/project-cost.service';
import { BadRequestException } from '@nestjs/common';

describe('Phase 5 — DISCOM Utility Tracking, Customer Handover & Execution Costs', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let discomService: DiscomTrackingService;
  let handoverService: CustomerHandoverService;
  let costService: ProjectCostService;

  const tenantOrg = {
    organizationId: '87878787-8787-4787-8787-878787878787',
    organizationSlug: 'phase5-discom-org',
    organizationName: 'Phase 5 Discom Org',
    managerUserId: '97878787-8787-4787-8787-878787878787',
  };

  let testProjectId: string;
  let testTrackingId: string;
  let testHandoverId: string;
  let testPunchlistId: string;

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
    discomService = new DiscomTrackingService(prisma, numberingService);
    handoverService = new CustomerHandoverService(prisma, numberingService);
    costService = new ProjectCostService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous test artifacts
      await tx.$executeRawUnsafe(`DELETE FROM "project_cost_records" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "handover_punchlist_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_handovers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "utility_connection_trackings" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.managerUserId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.user.create({
        data: {
          id: tenantOrg.managerUserId,
          email: 'manager.discom@solarcrew.com',
          firstName: 'Siddharth',
          lastName: 'Rao',
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-006',
          name: 'Kirloskar Pneumatic Works',
          phone: '+919876555555',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Heavy Compressor Bay Roof',
          addressLine1: 'Hadapsar Industrial Estate',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411013',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-006',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-006',
          title: 'Kirloskar 75kW Solar Design',
          targetCapacityKw: 75.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-006',
          revisionNumber: 1,
          totalMaterialCost: 2400000,
          status: 'APPROVED',
        },
      });

      const quote = await tx.quotation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          quotationNumber: 'QTN-P5-006',
          totalAmount: 3300000,
          grandTotal: 3300000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Kirloskar 75kW Turnkey Installation',
          paymentTerms: { advance: 20 },
          status: 'ACCEPTED',
        },
      });

      const salesOrder = await tx.salesOrder.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          quotation: { connect: { id: quote.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          orderNumber: 'SO-P5-006',
          totalAmount: 3300000,
          advanceRequired: 660000,
          advanceReceived: 660000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-006',
          projectName: 'Kirloskar 75kW Solar Project',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 75.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.managerUserId,
          installationStatus: 'COMMISSIONED',
        },
      });
      testProjectId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should create DISCOM tracking record with consumer details and PM Surya Ghar subsidy ID', async () => {
    const tracking = await discomService.createUtilityTracking(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        discomName: 'MSEDCL (Maharashtra State Electricity Distribution Co Ltd)',
        divisionOffice: 'Rasta Peth Division, Pune Urban Circle',
        consumerNumber: '028519012345',
        sanctionedLoadKw: 100.0,
        solarCapacityKw: 75.0,
        applicationNumber: 'MSEDCL-RTS-2026-99881',
        subsidyPortalRegistrationId: 'PMSURYA-MH-PUN-098765',
        notes: 'Net-metering application submitted under Maharashtra Solar Policy',
      },
    );

    expect(tracking).toBeDefined();
    expect(tracking.trackingCode).toMatch(/^UTL-\d{4}-\d{6}$/);
    expect(tracking.discomName).toContain('MSEDCL');
    expect(tracking.status).toBe('APPLICATION_SUBMITTED');
    expect(tracking.subsidyClaimStatus).toBe('SUBMITTED');

    testTrackingId = tracking.id;
  });

  it('2. should update DISCOM milestones: feasibility approval, net meter serial and grid synchronization', async () => {
    const updated = await discomService.updateUtilityTracking(
      tenantOrg.organizationId,
      testTrackingId,
      {
        technicalFeasibilityStatus: 'APPROVED',
        feasibilityApprovalDate: new Date().toISOString(),
        discomWorkOrderNumber: 'WO-MSEDCL-2026-4433',
        meterTestingStatus: 'PASSED',
        meterTestingDate: new Date().toISOString(),
        netMeterSerialNumber: 'GENUS-LT-3PH-789012',
        netMeterInstallationDate: new Date().toISOString(),
        gridSynchronizationDate: new Date().toISOString(),
        status: 'GRID_CONNECTED',
        subsidyClaimStatus: 'APPROVED',
      },
    );

    expect(updated).toBeDefined();
    expect(updated.technicalFeasibilityStatus).toBe('APPROVED');
    expect(updated.netMeterSerialNumber).toBe('GENUS-LT-3PH-789012');
    expect(updated.status).toBe('GRID_CONNECTED');
    expect(updated.subsidyClaimStatus).toBe('APPROVED');
  });

  it('3. should create customer handover process and transition project to CUSTOMER_HANDOVER_PENDING', async () => {
    const handover = await handoverService.createCustomerHandover(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        customerRepName: 'Girish Kirloskar',
        customerRepPhone: '+919876555555',
        customerRepDesignation: 'Plant Head & Director Operations',
        customerFeedbackNotes: 'Clean rooftop installation, completed ahead of schedule',
        finalInstalledCapacityKw: 75.0,
      },
      tenantOrg.managerUserId,
    );

    expect(handover).toBeDefined();
    expect(handover.handoverNumber).toMatch(/^CHO-\d{4}-\d{6}$/);
    expect(handover.status).toBe('DRAFT');

    // Verify project installationStatus transitioned to CUSTOMER_HANDOVER_PENDING
    const project = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(project?.installationStatus).toBe('CUSTOMER_HANDOVER_PENDING');

    testHandoverId = handover.id;
  });

  it('4. should manage punchlist items: add punchlist and enforce strict sign-off block on unresolved MAJOR items', async () => {
    const punchlistItem = await handoverService.addPunchlistItem(
      tenantOrg.organizationId,
      testHandoverId,
      {
        description: 'Provide laminated single-line diagram (SLD) mounted in inverter room',
        severity: 'MAJOR',
        assignedTo: 'Vikram Singh (Site Supervisor)',
      },
    );

    expect(punchlistItem).toBeDefined();
    expect(punchlistItem.severity).toBe('MAJOR');
    expect(punchlistItem.isResolved).toBe(false);

    testPunchlistId = punchlistItem.id;

    // Verify strict sign-off gate: cannot sign off while MAJOR punchlist item is unresolved
    await expect(
      handoverService.signOffHandover(
        tenantOrg.organizationId,
        testHandoverId,
        {
          customerSatisfactionScore: 5,
          warrantyPeriodMonths: 60,
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('5. should resolve punchlist item and sign off handover: transitions project to COMPLETED and starts 60-month warranty', async () => {
    // Resolve the punchlist item
    const resolvedItem = await handoverService.resolvePunchlistItem(
      tenantOrg.organizationId,
      testPunchlistId,
      {
        resolutionNotes: 'A3 laminated SLD framed and mounted adjacent to LT AC-DB panel',
      },
      tenantOrg.managerUserId,
    );
    expect(resolvedItem.isResolved).toBe(true);

    // Sign off handover
    const signedOff = await handoverService.signOffHandover(
      tenantOrg.organizationId,
      testHandoverId,
      {
        customerSatisfactionScore: 5,
        warrantyPeriodMonths: 60,
        customerSignatureUrl: 'https://storage.solaros.local/signatures/kirloskar-rep-sign.png',
        companyRepresentativeSignatureUrl: 'https://storage.solaros.local/signatures/pm-sign.png',
      },
    );

    expect(signedOff).toBeDefined();
    expect(signedOff.status).toBe('COMPLETED');
    expect(signedOff.customerSatisfactionScore).toBe(5);
    expect(signedOff.handoverPackGenerated).toBe(true);
    expect(signedOff.warrantyCertificateGenerated).toBe(true);
    expect(signedOff.warrantyStartDate).toBeDefined();
    expect(signedOff.warrantyEndDate).toBeDefined();

    // Verify project installationStatus transitioned to COMPLETED
    const project = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(project?.installationStatus).toBe('COMPLETED');
    expect(project?.actualCompletionDate).toBeDefined();
  });

  it('6. should track execution costs across categories and summarize project expenditures', async () => {
    // Record labor cost
    const laborCost = await costService.createProjectCost(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        costCategory: 'LABOR',
        amount: 85000,
        vendorName: 'Pune Electrical Contractors Pvt Ltd',
        invoiceNumber: 'INV-PEC-2026-112',
        notes: 'Structure erection and DC array cabling labor charges',
      },
      tenantOrg.managerUserId,
    );
    expect(laborCost.costRecordNumber).toMatch(/^CST-\d{4}-\d{6}$/);

    // Record rental equipment cost
    const rentalCost = await costService.createProjectCost(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        costCategory: 'EQUIPMENT_RENTAL',
        amount: 35000,
        vendorName: 'SkyHigh Scaffolding Rentals',
        invoiceNumber: 'INV-SHS-9921',
        notes: 'Hydraulic scissor lift rental for 3 days',
      },
      tenantOrg.managerUserId,
    );
    expect(rentalCost.costRecordNumber).toMatch(/^CST-\d{4}-\d{6}$/);

    // Record DISCOM fee / permit cost
    const permitCost = await costService.createProjectCost(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        costCategory: 'PERMITS_FEES',
        amount: 15000,
        vendorName: 'MSEDCL',
        invoiceNumber: 'MSEDCL-FEE-8871',
        notes: 'Net meter processing & CT/PT inspection charges',
      },
      tenantOrg.managerUserId,
    );
    expect(permitCost.costRecordNumber).toMatch(/^CST-\d{4}-\d{6}$/);

    // Get cost summary
    const summary = await costService.getProjectCostSummary(
      tenantOrg.organizationId,
      testProjectId,
    );

    expect(summary).toBeDefined();
    expect(summary.totalAmount).toBe(135000);
    expect(summary.costsCount).toBe(3);
    expect(summary.byCategory['LABOR']).toBe(85000);
    expect(summary.byCategory['EQUIPMENT_RENTAL']).toBe(35000);
    expect(summary.byCategory['PERMITS_FEES']).toBe(15000);
  });
});
