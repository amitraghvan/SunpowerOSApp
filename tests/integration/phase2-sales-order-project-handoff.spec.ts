import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { SalesOrdersService } from '../../apps/api/src/modules/sales-orders/sales-orders.service';
import { ContractsService } from '../../apps/api/src/modules/contracts/contracts.service';
import { QuotationsService } from '../../apps/api/src/modules/quotations/quotations.service';
import { PricingService } from '../../apps/api/src/modules/quotations/pricing.service';
import { BomService } from '../../apps/api/src/modules/engineering/bom/bom.service';
import { EngineeringService } from '../../apps/api/src/modules/engineering/engineering.service';
import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import {
  SalesOrderStatus,
  FulfillmentStatus,
  PaymentStatus,
  ProjectHandoverStatus,
  SolarSystemType,
  ElectricalPhase,
} from '@solaros/types';

describe('Phase 2 — Sales Orders, Commercial Prerequisites & Project Initiation Handoff', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let salesOrdersService: SalesOrdersService;
  let contractsService: ContractsService;
  let quotationsService: QuotationsService;
  let bomService: BomService;
  let engineeringService: EngineeringService;

  const tenantOrg = {
    organizationId: '50505050-5050-4050-8050-505050505050',
    organizationSlug: 'sales-order-test-org',
    organizationName: 'SunPower Sales Orders Org',
    userId: '90505050-5050-4050-8050-505050505050',
  };

  let testCustomerId: string;
  let testSiteId: string;
  let testSurveyId: string;
  let testPanelVariantId: string;
  let testInverterVariantId: string;
  let testDesignId: string;
  let testBomId: string;
  let testQuotationId: string;
  let testContractId: string;
  let testSalesOrderId: string;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    numberingService = new NumberingService(prisma);
    const pricingService = new PricingService();
    salesOrdersService = new SalesOrdersService(prisma, numberingService);
    contractsService = new ContractsService(prisma, numberingService);
    quotationsService = new QuotationsService(prisma, numberingService, pricingService);
    const compatibilityService = new CompatibilityService();
    bomService = new BomService(prisma, numberingService);
    engineeringService = new EngineeringService(
      prisma,
      numberingService,
      compatibilityService,
      bomService,
    );

    // Clean tenant setup
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "document_sequences" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_order_milestones" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "contract_payment_milestones" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "contracts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotation_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "cost_estimates" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bom_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "calculation_runs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_design_revisions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'salesorderuser@solartest.com',
          firstName: 'Sales',
          lastName: 'Director',
          isActive: true,
        },
      });

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'PANELS',
          name: 'Solar Panels',
        },
      });
      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'TATA',
          name: 'Tata Power Solar',
        },
      });

      const panelProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'TATA-545',
          name: 'Tata 545W Mono PERC',
          modelNumber: 'TP-545',
          type: 'PANEL',
        },
      });
      const panelVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: panelProd.id,
          sku: 'TATA-545-MONO',
          name: 'Tata 545W Mono PERC',
          ratedCapacityWatts: 545,
          costPrice: 10200.0,
          sellingPrice: 12200.0,
        },
      });

      const invCat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'INV',
          name: 'Inverters',
        },
      });
      const invProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: invCat.id,
          manufacturerId: mfr.id,
          code: 'POLYCAB-5K',
          name: 'Polycab 5kW Inverter',
          modelNumber: 'PC-5K',
          type: 'INVERTER',
        },
      });
      const invVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: invProd.id,
          sku: 'POLYCAB-5K-GRID',
          name: 'Polycab 5kW 3-Phase',
          ratedCapacityWatts: 5000,
          costPrice: 36000.0,
          sellingPrice: 42000.0,
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-SO-001',
          name: 'Sanjay Deshmukh',
          phone: '+919876543219',
        },
      });
      testCustomerId = customer.id;

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Deshmukh Hospital',
          addressLine1: 'Station Road',
          city: 'Nagpur',
          state: 'Maharashtra',
          postalCode: '440001',
          sanctionedLoadKw: 5.0,
          roofAreaSqFt: 600,
          shadowFreeAreaSqFt: 500,
          roofType: 'RCC_FLAT',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organizationId: tenantOrg.organizationId,
          surveyNumber: 'SRV-SO-001',
          customerId: customer.id,
          siteId: site.id,
          status: 'APPROVED',
          usableAreaSqFt: 500,
          recommendedCapacityKw: 5.0,
          roofPitchDegrees: 15.0,
          roofAzimuthDegrees: 180.0,
          phaseType: 'THREE_PHASE',
          distanceToMainPanelMeters: 25.0,
        },
      });

      testPanelVariantId = panelVariant.id;
      testInverterVariantId = invVariant.id;
      testSiteId = site.id;
      testSurveyId = survey.id;
    });

    const design = await engineeringService.createDesign(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        siteId: testSiteId,
        surveyId: testSurveyId,
        title: '5kWp Rooftop Solar - Sanjay Deshmukh',
        systemType: SolarSystemType.ON_GRID,
        connectionType: ElectricalPhase.THREE_PHASE,
        targetCapacityKw: 5.0,
      },
      tenantOrg.userId,
    );
    testDesignId = design.id;

    await engineeringService.configureRevision(
      tenantOrg.organizationId,
      design.id,
      1,
      {
        panelVariantId: testPanelVariantId,
        moduleQuantity: 10,
        inverterVariantId: testInverterVariantId,
        inverterQuantity: 1,
      },
      tenantOrg.userId,
    );

    await engineeringService.runCalculations(
      tenantOrg.organizationId,
      design.id,
      1,
      { designId: design.id, revisionNumber: 1 },
      tenantOrg.userId,
    );

    await engineeringService.approveDesign(
      tenantOrg.organizationId,
      design.id,
      tenantOrg.userId,
    );

    const bom = await bomService.generateBomForDesignRevision(
      tenantOrg.organizationId,
      design.id,
      1,
      tenantOrg.userId,
    );
    await bomService.approveBom(tenantOrg.organizationId, bom.id, tenantOrg.userId);
    testBomId = bom.id;

    const quote = await quotationsService.createQuotation(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        siteId: testSiteId,
        designId: design.id,
        bomId: bom.id,
      },
      tenantOrg.userId,
    );
    await quotationsService.approveQuotation(tenantOrg.organizationId, quote.id, tenantOrg.userId);
    testQuotationId = quote.id;

    const contract = await contractsService.generateContract(
      tenantOrg.organizationId,
      {
        quotationId: quote.id,
      },
      tenantOrg.userId,
    );
    await contractsService.signContract(
      tenantOrg.organizationId,
      contract.id,
      {
        signedByCustomerName: 'Sanjay Deshmukh',
      },
      tenantOrg.userId,
    );
    testContractId = contract.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a Sales Order with prerequisite flags in initial DRAFT state', async () => {
    const order = await salesOrdersService.createSalesOrder(
      tenantOrg.organizationId,
      {
        quotationId: testQuotationId,
        contractId: testContractId,
        advanceRequiredPercentage: 20.0,
      },
      tenantOrg.userId,
    );

    expect(order.id).toBeDefined();
    expect(order.orderNumber).toMatch(/^SO-\d{4}-\d{6}$/);
    expect(order.status).toBe(SalesOrderStatus.DRAFT);
    expect(order.fulfillmentStatus).toBe(FulfillmentStatus.NOT_STARTED);
    expect(order.paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(order.prerequisitesMet).toBe(false);
    expect(order.advanceReceived.toNumber()).toBe(0);
    expect(order.advanceRequired.toNumber()).toBeGreaterThan(30000);

    testSalesOrderId = order.id;
  });

  it('should reject order confirmation if minimum advance payment has not been received', async () => {
    await expect(
      salesOrdersService.confirmSalesOrder(
        tenantOrg.organizationId,
        testSalesOrderId,
        {},
        tenantOrg.userId,
      ),
    ).rejects.toThrow('Commercial Prerequisites Failed: Minimum advance payment');
  });

  it('should record advance payment and mark commercial prerequisites satisfied', async () => {
    const orderBefore = await salesOrdersService.getOrder(
      tenantOrg.organizationId,
      testSalesOrderId,
    );
    const advanceAmount = orderBefore.advanceRequired.toNumber();

    const updated = await salesOrdersService.recordAdvancePayment(
      tenantOrg.organizationId,
      testSalesOrderId,
      {
        amount: advanceAmount,
        paymentMode: 'NEFT',
        referenceNumber: 'NEFT-20261121-889900',
      },
      tenantOrg.userId,
    );

    expect(updated.advanceReceived.toNumber()).toBe(advanceAmount);
    expect(updated.prerequisitesMet).toBe(true);
    expect(updated.paymentStatus).toBe(PaymentStatus.PARTIALLY_PAID);
  });

  it('should confirm Sales Order and generate Project Initiation handoff record with BOM & Design snapshots', async () => {
    const confirmed = await salesOrdersService.confirmSalesOrder(
      tenantOrg.organizationId,
      testSalesOrderId,
      { notes: 'Advance received via NEFT. Handing over to procurement & engineering.' },
      tenantOrg.userId,
    );

    expect(confirmed.status).toBe(SalesOrderStatus.CONFIRMED);
    expect(confirmed.fulfillmentStatus).toBe(FulfillmentStatus.PROCUREMENT);
    expect(confirmed.confirmedAt).toBeDefined();

    // Verify Project Initiation Artifact
    expect(confirmed.projectInitiation).toBeDefined();
    expect(confirmed.projectInitiation?.projectCode).toMatch(/^PRJ-\d{4}-\d{6}$/);
    expect(confirmed.projectInitiation?.handoverStatus).toBe(ProjectHandoverStatus.READY_FOR_PROCUREMENT);
    expect(confirmed.projectInitiation?.bomSnapshot).toBeDefined();
    expect(confirmed.projectInitiation?.designSnapshot).toBeDefined();
  });

  it('should list Sales Orders for tenant', async () => {
    const list = await salesOrdersService.listOrders(tenantOrg.organizationId);
    expect(list).toBeDefined();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].customer).toBeDefined();
  });
});
