import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { PricingService } from '../../apps/api/src/modules/quotations/pricing.service';
import { QuotationsService } from '../../apps/api/src/modules/quotations/quotations.service';
import { BomService } from '../../apps/api/src/modules/engineering/bom/bom.service';
import { EngineeringService } from '../../apps/api/src/modules/engineering/engineering.service';
import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import { QuotationStatus, AcceptanceMethod, SolarSystemType, ElectricalPhase } from '@solaros/types';

describe('Phase 2 — Quotation Generation, Versioning & Customer Acceptance Workflow', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let pricingService: PricingService;
  let quotationsService: QuotationsService;
  let bomService: BomService;
  let engineeringService: EngineeringService;

  const tenantOrg = {
    organizationId: '70707070-7070-4070-8070-707070707070',
    organizationSlug: 'quote-test-org',
    organizationName: 'SunPower Quotations Org',
    userId: '90707070-7070-4070-8070-707070707070',
  };

  let testCustomerId: string;
  let testSiteId: string;
  let testSurveyId: string;
  let testDesignId: string;
  let testBomId: string;
  let testQuotationId: string;
  let testPanelVariantId: string;
  let testInverterVariantId: string;

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
    pricingService = new PricingService();
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
          email: 'quoteuser@solartest.com',
          firstName: 'Quote',
          lastName: 'Manager',
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
          code: 'ADANI',
          name: 'Adani Solar',
        },
      });

      const panelProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'ADANI-540',
          name: 'Adani 540W Mono',
          modelNumber: 'AD-540',
          type: 'PANEL',
        },
      });
      const panelVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: panelProd.id,
          sku: 'ADANI-540-MONO',
          name: 'Adani 540W Mono PERC',
          ratedCapacityWatts: 540,
          costPrice: 9800.0,
          sellingPrice: 11800.0,
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
          code: 'SOLIS-4K',
          name: 'Solis 4kW Inverter',
          modelNumber: 'SOL-4K',
          type: 'INVERTER',
        },
      });
      const invVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: invProd.id,
          sku: 'SOLIS-4K-SINGLE',
          name: 'Solis 4kW Single Phase',
          ratedCapacityWatts: 4000,
          costPrice: 32000.0,
          sellingPrice: 38000.0,
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-QTN-001',
          name: 'Anjali Verma',
          phone: '+919812345678',
        },
      });
      testCustomerId = customer.id;

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Verma Villa',
          addressLine1: 'Plot 45, Sector 14',
          city: 'Gurugram',
          state: 'Haryana',
          postalCode: '122001',
          sanctionedLoadKw: 4.0,
          roofAreaSqFt: 500,
          shadowFreeAreaSqFt: 450,
          roofType: 'RCC_FLAT',
        },
      });
      testSiteId = site.id;

      const survey = await tx.survey.create({
        data: {
          organizationId: tenantOrg.organizationId,
          surveyNumber: 'SRV-QTN-001',
          customerId: customer.id,
          siteId: site.id,
          status: 'APPROVED',
          usableAreaSqFt: 450,
          recommendedCapacityKw: 4.0,
          roofPitchDegrees: 15.0,
          roofAzimuthDegrees: 180.0,
          phaseType: 'SINGLE_PHASE',
          distanceToMainPanelMeters: 15.0,
        },
      });
      testPanelVariantId = panelVariant.id;
      testInverterVariantId = invVariant.id;
      testSurveyId = survey.id;
    });

    // Create & Configure Design
    const design = await engineeringService.createDesign(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        siteId: testSiteId,
        surveyId: testSurveyId,
        title: '4kW Rooftop Solar - Anjali Verma',
        systemType: SolarSystemType.ON_GRID,
        connectionType: ElectricalPhase.SINGLE_PHASE,
        targetCapacityKw: 4.0,
      },
      tenantOrg.userId,
    );
    testDesignId = design.id;

    await engineeringService.configureRevision(
      tenantOrg.organizationId,
      testDesignId,
      1,
      {
        panelVariantId: testPanelVariantId,
        moduleQuantity: 8,
        inverterVariantId: testInverterVariantId,
        inverterQuantity: 1,
      },
      tenantOrg.userId,
    );

    await engineeringService.runCalculations(
      tenantOrg.organizationId,
      testDesignId,
      1,
      { designId: testDesignId, revisionNumber: 1 },
      tenantOrg.userId,
    );

    await engineeringService.approveDesign(
      tenantOrg.organizationId,
      testDesignId,
      tenantOrg.userId,
    );

    const bom = await bomService.generateBomForDesignRevision(
      tenantOrg.organizationId,
      testDesignId,
      1,
      tenantOrg.userId,
    );
    await bomService.approveBom(tenantOrg.organizationId, bom.id, tenantOrg.userId);
    testBomId = bom.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate a formal commercial quotation with tax, margins, and PM Surya Ghar subsidy', async () => {
    const quote = await quotationsService.createQuotation(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        siteId: testSiteId,
        designId: testDesignId,
        bomId: testBomId,
        discountPercent: 2.0, // 2% discount
        validDays: 30,
      },
      tenantOrg.userId,
    );

    expect(quote.id).toBeDefined();
    expect(quote.quotationNumber).toMatch(/^QTN-\d{4}-\d{6}$/);
    expect(quote.status).toBe(QuotationStatus.DRAFT);
    expect(quote.grandTotal.toNumber()).toBeGreaterThan(150000);
    expect(quote.subsidyAmount.toNumber()).toBe(78000); // 4kW qualifies for 78k subsidy
    expect(quote.netCustomerPayable.toNumber()).toBe(quote.grandTotal.toNumber() - 78000);
    expect(quote.items.length).toBe(2);

    testQuotationId = quote.id;
  });

  it('should approve the quotation', async () => {
    const approved = await quotationsService.approveQuotation(
      tenantOrg.organizationId,
      testQuotationId,
      tenantOrg.userId,
    );

    expect(approved.status).toBe(QuotationStatus.APPROVED);
    expect(approved.approvedAt).toBeDefined();
  });

  it('should record customer acceptance with digital evidence', async () => {
    const accepted = await quotationsService.recordCustomerAcceptance(
      tenantOrg.organizationId,
      testQuotationId,
      {
        acceptanceMethod: AcceptanceMethod.DIGITAL_SIGNATURE,
        acceptanceEvidenceUrl: 'https://storage.solaros.app/solaros-documents/quotes/signed-qtn-001.pdf',
        acceptedByCustomerName: 'Anjali Verma',
        notes: 'Signed proposal received via customer portal',
      },
      tenantOrg.userId,
    );

    expect(accepted.status).toBe(QuotationStatus.ACCEPTED);
    expect(accepted.acceptanceDate).toBeDefined();
    expect(accepted.acceptanceMethod).toBe('DIGITAL_SIGNATURE');
  });
});
