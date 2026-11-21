import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import { MaterialRequirementStatus, RequisitionStatus } from '@solaros/types';

describe('Phase 3 — Material Requirement Planning (MRP) & Purchase Requisition Workflow', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let procurementService: ProcurementService;

  const tenantOrg = {
    organizationId: '61616161-6161-4161-8161-616161616161',
    organizationSlug: 'phase3-mrp-test-org',
    organizationName: 'Phase 3 MRP Test Org',
    userId: '91616161-6161-4161-8161-616161616161',
  };

  let testProjectInitiationId: string;
  let testVariantId: string;
  let testMrpId: string;
  let testRequisitionId: string;

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
    procurementService = new ProcurementService(prisma, numberingService);

    // Setup Tenant & Project with BOM
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisition_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisitions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirement_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bom_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
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
          id: tenantOrg.userId,
          email: 'mrp-tester@solaros.io',
          firstName: 'MRP',
          lastName: 'Planner',
        },
      });

      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-PANELS-MRP',
          name: 'Solar Panels MRP',
        },
      });

      const manufacturer = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-TATA-MRP',
          name: 'Tata Power Solar',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: manufacturer.id,
          code: 'PROD-TATA-545',
          name: 'Tata Power 545W Mono PERC',
          modelNumber: 'TP-545',
          type: 'PANEL',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-TATA-545W',
          name: 'Tata 545W Mono PERC',
          costPrice: 11000,
          sellingPrice: 14000,
        },
      });
      testVariantId = variant.id;

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-MRP-001',
          name: 'Vikas Sharma Commercial Site',
          phone: '+919988776655',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Vikas Sharma Factory Roof',
          addressLine1: 'Plot 45, MIDC Bhosari',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411026',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-MRP-001',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-MRP-001',
          title: '10kW Factory Solar Design',
          targetCapacityKw: 10,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-MRP-001',
          revisionNumber: 1,
          totalMaterialCost: 220000,
          status: 'APPROVED',
          items: {
            create: [
              {
                organization: { connect: { id: tenantOrg.organizationId } },
                category: 'SOLAR_GENERATION',
                variant: { connect: { id: variant.id } },
                itemCode: 'PANEL-545W',
                description: 'Tata 545W Mono PERC Solar Panels',
                quantity: 20,
                effectiveQuantity: 20,
                unitCost: 11000,
                totalCost: 220000,
              },
            ],
          },
        },
      });

      const quote = await tx.quotation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          quotationNumber: 'QTN-MRP-001',
          totalAmount: 280000,
          grandTotal: 280000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Turnkey rooftop solar installation',
          paymentTerms: { advance: 20, delivery: 80 },
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
          orderNumber: 'SO-MRP-001',
          totalAmount: 280000,
          advanceRequired: 56000,
          advanceReceived: 56000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          salesOrder: { connect: { id: salesOrder.id } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          initiatedBy: { connect: { id: tenantOrg.userId } },
          projectCode: 'PRJ-MRP-001',
          projectName: '10kW Factory Solar Installation',
          systemCapacityKw: 10,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          handoverStatus: 'READY_FOR_PROCUREMENT',
        },
      });
      testProjectInitiationId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisition_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisitions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirement_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bom_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should generate MRP calculation from project initiation BOM items', async () => {
    const mrp = await procurementService.generateMRPFromProject(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectInitiationId,
        plannedDate: new Date(),
      },
      tenantOrg.userId,
    );

    expect(mrp).toBeDefined();
    expect(mrp.requirementNumber).toMatch(/^MRP-\d{4}-\d{6}$/);
    expect(mrp.status).toBe(MaterialRequirementStatus.CALCULATED);
    expect(mrp.lines.length).toBe(1);
    expect(Number(mrp.lines[0].requiredQuantity)).toBe(20);
    expect(Number(mrp.lines[0].netProcurementQuantity)).toBe(20);
    expect(Number(mrp.lines[0].estimatedUnitCost)).toBe(11000);
    expect(Number(mrp.estimatedTotalAmount)).toBe(220000);
    testMrpId = mrp.id;
  });

  it('should convert calculated MRP into Purchase Requisition (PR)', async () => {
    const pr = await procurementService.convertMRPToRequisition(
      tenantOrg.organizationId,
      testMrpId,
      tenantOrg.userId,
    );

    expect(pr).toBeDefined();
    expect(pr.requisitionNumber).toMatch(/^PR-\d{4}-\d{6}$/);
    expect(pr.status).toBe(RequisitionStatus.DRAFT);
    expect(pr.lines.length).toBe(1);
    expect(Number(pr.lines[0].requestedQuantity)).toBe(20);
    expect(Number(pr.lines[0].approvedQuantity)).toBe(20);
    expect(Number(pr.totalEstimatedAmount)).toBe(220000);
    testRequisitionId = pr.id;

    // Check MRP status updated
    const updatedMrp = await procurementService.getMaterialRequirement(
      tenantOrg.organizationId,
      testMrpId,
    );
    expect(updatedMrp.status).toBe(MaterialRequirementStatus.CONVERTED_TO_PR);
  });

  it('should submit requisition for managerial approval', async () => {
    const submitted = await procurementService.submitRequisition(
      tenantOrg.organizationId,
      testRequisitionId,
    );

    expect(submitted.status).toBe(RequisitionStatus.SUBMITTED);
  });

  it('should approve requisition with authorized line quantities', async () => {
    const approved = await procurementService.approveRequisition(
      tenantOrg.organizationId,
      testRequisitionId,
      {
        notes: 'Approved for procurement based on project timeline',
      },
      tenantOrg.userId,
    );

    expect(approved.status).toBe(RequisitionStatus.APPROVED);
    expect(approved.approvedById).toBe(tenantOrg.userId);
    expect(approved.approvedAt).toBeDefined();
  });

  it('should reject a requisition with structured rejection reason', async () => {
    // Create another draft requisition to test rejection
    const dummyPr = await procurementService.createRequisition(
      tenantOrg.organizationId,
      {
        title: 'Emergency Cable Spool',
        lines: [
          {
            productVariantId: testVariantId,
            requestedQuantity: 2,
            estimatedUnitCost: 11000,
          },
        ],
      },
      tenantOrg.userId,
    );

    const rejected = await procurementService.rejectRequisition(
      tenantOrg.organizationId,
      dummyPr.id,
      {
        rejectionReason: 'Excess stock already available in Pune staging depot',
      },
      tenantOrg.userId,
    );

    expect(rejected.status).toBe(RequisitionStatus.REJECTED);
    expect(rejected.rejectionReason).toBe(
      'Excess stock already available in Pune staging depot',
    );
  });
});
