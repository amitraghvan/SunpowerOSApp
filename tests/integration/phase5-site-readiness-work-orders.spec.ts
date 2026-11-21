import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { SiteReadinessService } from '../../apps/api/src/modules/installation/site-readiness.service';
import { WorkOrderService } from '../../apps/api/src/modules/installation/work-order.service';

describe('Phase 5 — Site Readiness Verification & Work Orders Execution', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let siteReadinessService: SiteReadinessService;
  let workOrderService: WorkOrderService;

  const tenantOrg = {
    organizationId: '83838383-8383-4383-8383-838383838383',
    organizationSlug: 'phase5-readiness-org',
    organizationName: 'Phase 5 Readiness Org',
    supervisorUserId: '93838383-8383-4383-8383-838383838383',
  };

  let testProjectId: string;

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
    siteReadinessService = new SiteReadinessService(prisma, numberingService);
    workOrderService = new WorkOrderService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "installation_tasks" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "installation_milestones" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "installation_work_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "site_readiness_checks" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "site_readiness_records" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.supervisorUserId}'`);
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
          id: tenantOrg.supervisorUserId,
          email: 'supervisor.sr@solarcrew.com',
          firstName: 'Anil',
          lastName: 'Deshmukh',
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-002',
          name: 'GreenField Agro Tech',
          phone: '+919876511111',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'GreenField Cold Storage Roof',
          addressLine1: 'NH-48, Baramati',
          city: 'Baramati',
          state: 'Maharashtra',
          postalCode: '413102',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-002',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-002',
          title: 'GreenField 40kW Design',
          targetCapacityKw: 40.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-002',
          revisionNumber: 1,
          totalMaterialCost: 1400000,
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
          quotationNumber: 'QTN-P5-002',
          totalAmount: 1800000,
          grandTotal: 1800000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'GreenField 40kW Turnkey Installation',
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
          orderNumber: 'SO-P5-002',
          totalAmount: 1800000,
          advanceRequired: 360000,
          advanceReceived: 360000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-002',
          projectName: 'GreenField 40kW Solar Installation',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 40.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.supervisorUserId,
        },
      });
      testProjectId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  let readinessRecord: any;

  it('1. should initialize 12-point readiness audit and enforce mandatory gate on failure', async () => {
    // Audit with one mandatory failure (e.g. Roof Access not secured)
    readinessRecord = await siteReadinessService.createReadinessRecord(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        roofAccessAvailable: false,
        checks: [
          {
            checkItemKey: 'ROOF_SAFE_ACCESS',
            description: 'Safe ladder / staircase roof access available with anchor points',
            isMandatory: true,
            status: 'FAIL',
            remarks: 'Staircase railing damaged, scaffolding ladder required',
          },
          {
            checkItemKey: 'STRUCTURAL_INTEGRITY',
            description: 'Purlin thickness and roof deflection verified',
            isMandatory: true,
            status: 'PASS',
          },
        ],
      },
      tenantOrg.supervisorUserId,
    );

    expect(readinessRecord.id).toBeDefined();
    expect(readinessRecord.readinessCode).toMatch(/^SRR-/);
    // Because mandatory check failed, overall status must be REJECTED
    expect(readinessRecord.overallStatus).toBe('REJECTED');

    // Attempting normal approval should throw BadRequestException
    await expect(
      siteReadinessService.approveReadiness(tenantOrg.organizationId, readinessRecord.id, tenantOrg.supervisorUserId),
    ).rejects.toThrow();
  });

  it('2. should permit controlled supervisor exception with documented justification', async () => {
    const updated = await siteReadinessService.authorizeException(
      tenantOrg.organizationId,
      readinessRecord.id,
      {
        exceptionReason: 'Temporary certified aluminum tower scaffolding mobilized with dual safety harnesses',
      },
      tenantOrg.supervisorUserId,
    );

    expect(updated.overallStatus).toBe('APPROVED_WITH_EXCEPTION');
    expect(updated.exceptionAuthorizedById).toBe(tenantOrg.supervisorUserId);

    // Verify project advanced to READY_FOR_EXECUTION
    const proj = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({ where: { id: testProjectId } }),
    );
    expect(proj?.installationStatus).toBe('READY_FOR_EXECUTION');
  });

  let workOrder: any;

  it('3. should generate installation work order with standard 9 tasks and 7 milestones', async () => {
    workOrder = await workOrderService.createWorkOrder(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        priority: 'HIGH',
      },
      tenantOrg.supervisorUserId,
    );

    expect(workOrder.id).toBeDefined();
    expect(workOrder.workOrderNumber).toMatch(/^IWO-/);
    expect(workOrder.totalTasks).toBe(9);
    expect(workOrder.completedTasks).toBe(0);
    expect(Number(workOrder.completionPercentage)).toBe(0);
    expect(workOrder.tasks.length).toBe(9);

    // Check milestones auto-provisioned
    const milestones = await prisma.asSuperAdmin(async (tx) =>
      tx.installationMilestone.findMany({ where: { projectInitiationId: testProjectId } }),
    );
    expect(milestones.length).toBe(7);

    // Project should now be INSTALLATION_IN_PROGRESS
    const proj = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({ where: { id: testProjectId } }),
    );
    expect(proj?.installationStatus).toBe('INSTALLATION_IN_PROGRESS');
  });

  it('4. should track task completion progress and transition to INSTALLATION_COMPLETED when all tasks finish', async () => {
    const tasks = workOrder.tasks;

    // Complete first 5 tasks
    for (let i = 0; i < 5; i++) {
      await workOrderService.updateTaskStatus(
        tenantOrg.organizationId,
        tasks[i].id,
        {
          status: 'COMPLETED',
          actualHours: 8,
          notes: 'Inspected and certified compliant',
        },
        tenantOrg.supervisorUserId,
      );
    }

    let fetchedWo = await workOrderService.getWorkOrder(tenantOrg.organizationId, workOrder.id);
    expect(fetchedWo.completedTasks).toBe(5);
    expect(Math.round(Number(fetchedWo.completionPercentage))).toBe(56); // 5/9 = 55.55%
    expect(fetchedWo.status).toBe('IN_PROGRESS');

    // Complete remaining 4 tasks
    for (let i = 5; i < 9; i++) {
      await workOrderService.updateTaskStatus(
        tenantOrg.organizationId,
        tasks[i].id,
        {
          status: 'COMPLETED',
          actualHours: 6,
        },
        tenantOrg.supervisorUserId,
      );
    }

    fetchedWo = await workOrderService.getWorkOrder(tenantOrg.organizationId, workOrder.id);
    expect(fetchedWo.completedTasks).toBe(9);
    expect(Number(fetchedWo.completionPercentage)).toBe(100);
    expect(fetchedWo.status).toBe('COMPLETED');

    // Verify project updated to INSTALLATION_COMPLETED
    const proj = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({ where: { id: testProjectId } }),
    );
    expect(proj?.installationStatus).toBe('INSTALLATION_COMPLETED');
  });
});
