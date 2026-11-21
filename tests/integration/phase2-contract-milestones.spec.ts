import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { ContractsService } from '../../apps/api/src/modules/contracts/contracts.service';
import { QuotationsService } from '../../apps/api/src/modules/quotations/quotations.service';
import { PricingService } from '../../apps/api/src/modules/quotations/pricing.service';
import { BomService } from '../../apps/api/src/modules/engineering/bom/bom.service';
import { EngineeringService } from '../../apps/api/src/modules/engineering/engineering.service';
import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import { ContractStatus, QuotationStatus, SolarSystemType, ElectricalPhase } from '@solaros/types';

describe('Phase 2 — Contracts & Payment Milestones Workflow', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let contractsService: ContractsService;
  let quotationsService: QuotationsService;
  let bomService: BomService;
  let engineeringService: EngineeringService;

  const tenantOrg = {
    organizationId: '60606060-6060-4060-8060-606060606060',
    organizationSlug: 'contract-test-org',
    organizationName: 'SunPower Contracts Org',
    userId: '90606060-6060-4060-8060-606060606060',
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
          email: 'contractuser@solartest.com',
          firstName: 'Contract',
          lastName: 'Officer',
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
          code: 'VIKRAM',
          name: 'Vikram Solar',
        },
      });

      const panelProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'VIKRAM-550',
          name: 'Vikram 550W Mono',
          modelNumber: 'VS-550',
          type: 'PANEL',
        },
      });
      const panelVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: panelProd.id,
          sku: 'VIKRAM-550-MONO',
          name: 'Vikram 550W Mono PERC',
          ratedCapacityWatts: 550,
          costPrice: 10000.0,
          sellingPrice: 12000.0,
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
          code: 'HUAWEI-5K',
          name: 'Huawei 5kW Inverter',
          modelNumber: 'SUN2000-5K',
          type: 'INVERTER',
        },
      });
      const invVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: invProd.id,
          sku: 'HUAWEI-SUN-5K',
          name: 'Huawei SUN2000 5kW 3-Phase',
          ratedCapacityWatts: 5000,
          costPrice: 40000.0,
          sellingPrice: 48000.0,
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-CON-001',
          name: 'Deepak Patel',
          phone: '+919876500000',
        },
      });
      testCustomerId = customer.id;

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Patel Enterprise Warehouse',
          addressLine1: 'GIDC Industrial Area',
          city: 'Ahmedabad',
          state: 'Gujarat',
          postalCode: '380001',
          sanctionedLoadKw: 5.0,
          roofAreaSqFt: 800,
          shadowFreeAreaSqFt: 700,
          roofType: 'METAL_SHEET',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organizationId: tenantOrg.organizationId,
          surveyNumber: 'SRV-CON-001',
          customerId: customer.id,
          siteId: site.id,
          status: 'APPROVED',
          usableAreaSqFt: 700,
          recommendedCapacityKw: 5.0,
          roofPitchDegrees: 10.0,
          roofAzimuthDegrees: 180.0,
          phaseType: 'THREE_PHASE',
          distanceToMainPanelMeters: 20.0,
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
        title: '5kWp Rooftop Solar - Deepak Patel',
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate an installation contract with a 4-stage payment milestone schedule', async () => {
    const contract = await contractsService.generateContract(
      tenantOrg.organizationId,
      {
        quotationId: testQuotationId,
        paymentScheduleType: 'MILESTONE_BASED',
      },
      tenantOrg.userId,
    );

    expect(contract.id).toBeDefined();
    expect(contract.contractNumber).toMatch(/^CON-\d{4}-\d{6}$/);
    expect(contract.status).toBe(ContractStatus.DRAFT);
    expect(contract.totalContractValue.toNumber()).toBeGreaterThan(150000);

    // Verify 4 milestones exist (20%, 60%, 15%, 5%)
    expect(contract.milestones.length).toBe(4);
    const sumPercentage = contract.milestones.reduce((acc, m) => acc + m.percentage.toNumber(), 0);
    expect(sumPercentage).toBe(100.0);

    const advanceMilestone = contract.milestones.find((m) => m.milestoneType === 'ADVANCE_BOOKING');
    expect(advanceMilestone?.percentage.toNumber()).toBe(20.0);

    testContractId = contract.id;
  });

  it('should record customer signature and activate the contract', async () => {
    const signed = await contractsService.signContract(
      tenantOrg.organizationId,
      testContractId,
      {
        signedByCustomerName: 'Deepak Patel',
        contractDocumentUrl: 'https://storage.solaros.app/solaros-documents/contracts/executed-con-001.pdf',
      },
      tenantOrg.userId,
    );

    expect(signed.status).toBe(ContractStatus.ACTIVE);
    expect(signed.signedByCustomerName).toBe('Deepak Patel');
    expect(signed.signedDate).toBeDefined();
  });
});
