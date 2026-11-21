import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { BomService } from '../../apps/api/src/modules/engineering/bom/bom.service';
import { EngineeringService } from '../../apps/api/src/modules/engineering/engineering.service';
import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import { BOMCategory, BOMStatus, SolarSystemType, ElectricalPhase } from '@solaros/types';

describe('Phase 2 — Automated BOM Generation & Topology Categorization', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let compatibilityService: CompatibilityService;
  let bomService: BomService;
  let engineeringService: EngineeringService;

  const tenantOrg = {
    organizationId: '80808080-8080-4080-8080-808080808080',
    organizationSlug: 'bom-test-org',
    organizationName: 'SunPower BOM Testing Org',
    userId: '90808080-8080-4080-8080-808080808080',
  };

  let testCustomerId: string;
  let testSiteId: string;
  let testSurveyId: string;
  let testPanelVariantId: string;
  let testInverterVariantId: string;
  let testDesignId: string;

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
    compatibilityService = new CompatibilityService();
    bomService = new BomService(prisma, numberingService);
    engineeringService = new EngineeringService(
      prisma,
      numberingService,
      compatibilityService,
      bomService,
    );

    // Initialize clean tenant data
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
          email: 'bomengineer@solartest.com',
          firstName: 'BOM',
          lastName: 'Engineer',
          isActive: true,
        },
      });

      // Create Category & Manufacturer
      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'SOLAR_PANELS',
          name: 'Solar PV Panels',
        },
      });
      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WAAREE',
          name: 'Waaree Energies Ltd',
        },
      });

      // Create Panel Product & Variant
      const panelProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-PANEL-550',
          name: 'Waaree 550W Mono PERC',
          modelNumber: 'W-550',
          type: 'PANEL',
        },
      });
      const panelVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: panelProd.id,
          sku: 'PANEL-550-TOPCON',
          name: '550W TopCon Bifacial',
          ratedCapacityWatts: 550,
          costPrice: 10500.0,
          sellingPrice: 12500.0,
        },
      });
      testPanelVariantId = panelVariant.id;

      // Create Inverter Product & Variant
      const invCat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'INVERTERS',
          name: 'Solar Grid-Tie Inverters',
        },
      });
      const invProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: invCat.id,
          manufacturerId: mfr.id,
          code: 'PROD-INV-5KW',
          name: 'Growatt 5kW 3-Phase',
          modelNumber: 'GW-5K',
          type: 'INVERTER',
        },
      });
      const invVariant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: invProd.id,
          sku: 'INV-GROWATT-5K',
          name: 'Growatt MOD 5KTL3-X',
          ratedCapacityWatts: 5000,
          costPrice: 38000.0,
          sellingPrice: 45000.0,
        },
      });
      testInverterVariantId = invVariant.id;

      // Create Customer, Site & APPROVED Survey
      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-BOM-001',
          name: 'Rajesh Sharma',
          phone: '+919876543210',
          customerType: 'INDIVIDUAL',
        },
      });
      testCustomerId = customer.id;

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Residence Rooftop',
          addressLine1: 'B-12, Green Park',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
          sanctionedLoadKw: 5.0,
          roofAreaSqFt: 600,
          shadowFreeAreaSqFt: 500,
          roofType: 'RCC_FLAT',
        },
      });
      testSiteId = site.id;

      const survey = await tx.survey.create({
        data: {
          organizationId: tenantOrg.organizationId,
          surveyNumber: 'SRV-BOM-001',
          customerId: customer.id,
          siteId: site.id,
          status: 'APPROVED',
          usableAreaSqFt: 500,
          recommendedCapacityKw: 5.0,
          roofPitchDegrees: 15.0,
          roofAzimuthDegrees: 180.0,
          phaseType: 'THREE_PHASE',
          distanceToMainPanelMeters: 20.0,
        },
      });
      testSurveyId = survey.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create an engineering design and configure technical hardware', async () => {
    const design = await engineeringService.createDesign(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        siteId: testSiteId,
        surveyId: testSurveyId,
        title: '5kWp Rooftop Solar - Rajesh Sharma',
        systemType: SolarSystemType.ON_GRID,
        connectionType: ElectricalPhase.THREE_PHASE,
        targetCapacityKw: 5.0,
      },
      tenantOrg.userId,
    );

    expect(design.id).toBeDefined();
    expect(design.designNumber).toMatch(/^DES-\d{4}-\d{6}$/);
    testDesignId = design.id;

    // Configure hardware for revision 1
    const revision = await engineeringService.configureRevision(
      tenantOrg.organizationId,
      testDesignId,
      1,
      {
        panelVariantId: testPanelVariantId,
        moduleQuantity: 10,
        inverterVariantId: testInverterVariantId,
        inverterQuantity: 1,
      },
      tenantOrg.userId,
    );

    expect(revision.moduleQuantity).toBe(10);
    expect(revision.totalDcCapacityKw.toNumber()).toBe(5.5);
    expect(revision.totalAcCapacityKw.toNumber()).toBe(5.0);
  });

  it('should run technical calculations and verify design', async () => {
    const calcResult = await engineeringService.runCalculations(
      tenantOrg.organizationId,
      testDesignId,
      1,
      {
        designId: testDesignId,
        revisionNumber: 1,
      },
      tenantOrg.userId,
    );

    expect(calcResult.revision.stringCount).toBeGreaterThanOrEqual(1);
    expect(calcResult.revision.estAnnualGenerationKwh?.toNumber()).toBeGreaterThan(5000);
    expect(calcResult.revision.compatibilityStatus).toBe('COMPATIBLE');

    // Approve design
    const approved = await engineeringService.approveDesign(
      tenantOrg.organizationId,
      testDesignId,
      tenantOrg.userId,
    );
    expect(approved.status).toBe('APPROVED');
  });

  it('should generate a complete, topology-classified BOM from the design revision', async () => {
    const bom = await bomService.generateBomForDesignRevision(
      tenantOrg.organizationId,
      testDesignId,
      1,
      tenantOrg.userId,
    );

    expect(bom.bomNumber).toMatch(/^BOM-\d{4}-\d{6}$/);
    expect(bom.status).toBe(BOMStatus.DRAFT);
    expect(bom.totalMaterialCost.toNumber()).toBeGreaterThan(100000);

    // Verify all 5-6 core categories exist in the generated BOM
    const categories = bom.items.map((i) => i.category);
    expect(categories).toContain(BOMCategory.SOLAR_GENERATION);
    expect(categories).toContain(BOMCategory.POWER_CONVERSION);
    expect(categories).toContain(BOMCategory.MOUNTING);
    expect(categories).toContain(BOMCategory.ELECTRICAL_BOS);
    expect(categories).toContain(BOMCategory.SERVICES);

    // Verify module line item
    const moduleLine = bom.items.find((i) => i.category === BOMCategory.SOLAR_GENERATION);
    expect(moduleLine?.quantity.toNumber()).toBe(10);
    expect(moduleLine?.unitCost.toNumber()).toBe(10500.0);
    expect(moduleLine?.totalCost.toNumber()).toBe(105000.0);

    // Verify inverter line item
    const inverterLine = bom.items.find((i) => i.category === BOMCategory.POWER_CONVERSION);
    expect(inverterLine?.quantity.toNumber()).toBe(1);
    expect(inverterLine?.unitCost.toNumber()).toBe(38000.0);
  });

  it('should approve and freeze the BOM', async () => {
    const boms = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.billOfMaterials.findMany({
        where: { designId: testDesignId, organizationId: tenantOrg.organizationId },
      }),
    );
    expect(boms.length).toBe(1);

    const approvedBom = await bomService.approveBom(
      tenantOrg.organizationId,
      boms[0].id,
      tenantOrg.userId,
    );

    expect(approvedBom.status).toBe(BOMStatus.APPROVED);
    expect(approvedBom.approvedAt).toBeDefined();
  });
});
