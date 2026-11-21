import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { LeadsService } from '../../apps/api/src/modules/crm/leads.service';
import { CustomersService } from '../../apps/api/src/modules/customers/customers.service';
import { SurveysService } from '../../apps/api/src/modules/surveys/surveys.service';
import { StorageService } from '../../apps/api/src/infrastructure/storage/storage.service';
import { ConfigService } from '@nestjs/config';
import { EngineeringService } from '../../apps/api/src/modules/engineering/engineering.service';
import { CompatibilityService } from '../../apps/api/src/modules/engineering/compatibility/compatibility.service';
import { BomService } from '../../apps/api/src/modules/engineering/bom/bom.service';
import { PricingService } from '../../apps/api/src/modules/quotations/pricing.service';
import { QuotationsService } from '../../apps/api/src/modules/quotations/quotations.service';
import { ContractsService } from '../../apps/api/src/modules/contracts/contracts.service';
import { SalesOrdersService } from '../../apps/api/src/modules/sales-orders/sales-orders.service';
import {
  TenantContext,
  LeadStatus,
  SurveyStatus,
  SolarSystemType,
  ElectricalPhase,
  BOMStatus,
  QuotationStatus,
  AcceptanceMethod,
  ContractStatus,
  SalesOrderStatus,
  FulfillmentStatus,
  ProjectHandoverStatus,
} from '@solaros/types';

describe('Phase 2 — Master End-to-End Solar Engineering & Commercial Lifecycle Journey', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let leadsService: LeadsService;
  let customersService: CustomersService;
  let surveysService: SurveysService;
  let engineeringService: EngineeringService;
  let bomService: BomService;
  let quotationsService: QuotationsService;
  let contractsService: ContractsService;
  let salesOrdersService: SalesOrdersService;

  const tenantOrg: TenantContext = {
    organizationId: '11111111-2222-4333-8444-555555555555',
    organizationSlug: 'master-e2e-org',
    organizationName: 'SunPower Master EPC India',
    userId: '99999999-8888-4777-8666-555555555555',
    userEmail: 'mastere2e@sunpower.com',
    roles: ['ORG_ADMIN', 'SOLAR_ENGINEER'],
    permissions: [],
  };

  let testPanelVariantId: string;
  let testInverterVariantId: string;

  beforeAll(async () => {
    const configService = new ConfigService({
      STORAGE_ENDPOINT: 'localhost',
      STORAGE_PORT: 9000,
      STORAGE_USE_SSL: 'false',
      STORAGE_ACCESS_KEY: 'minioadmin',
      STORAGE_SECRET_KEY: 'minioadmin',
    });
    const storage = new StorageService(configService);
    await storage.onModuleInit();

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
    const compatibilityService = new CompatibilityService();

    leadsService = new LeadsService(prisma);
    customersService = new CustomersService(prisma);
    surveysService = new SurveysService(prisma, storage);
    bomService = new BomService(prisma, numberingService);
    engineeringService = new EngineeringService(prisma, numberingService, compatibilityService, bomService);
    quotationsService = new QuotationsService(prisma, numberingService, pricingService);
    contractsService = new ContractsService(prisma, numberingService);
    salesOrdersService = new SalesOrdersService(prisma, numberingService);

    // Clean database for this tenant
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
      await tx.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: tenantOrg.userEmail,
          firstName: 'Master',
          lastName: 'Engineer',
          isActive: true,
        },
      });

      // Products setup
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
          code: 'GOLDI-SOLAR',
          name: 'Goldi Solar Ltd',
        },
      });

      const pProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'GOLDI-550',
          name: 'Goldi 550W Mono PERC',
          modelNumber: 'GS-550',
          type: 'PANEL',
        },
      });
      const pVar = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: pProd.id,
          sku: 'GOLDI-550-BIFACIAL',
          name: 'Goldi 550W Bifacial',
          ratedCapacityWatts: 550,
          costPrice: 10400.0,
          sellingPrice: 12400.0,
        },
      });
      testPanelVariantId = pVar.id;

      const invProd = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'LUMINOUS-5K',
          name: 'Luminous 5kW Inverter',
          modelNumber: 'LM-5K',
          type: 'INVERTER',
        },
      });
      const invVar = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: invProd.id,
          sku: 'LUMINOUS-5K-GRID',
          name: 'Luminous 5kW 3-Phase Grid Inverter',
          ratedCapacityWatts: 5000,
          costPrice: 37000.0,
          sellingPrice: 44000.0,
        },
      });
      testInverterVariantId = invVar.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should execute the full 14-step commercial and engineering journey seamlessly', async () => {
    // Step 1: Create CRM Won Lead
    const lead = await leadsService.createLead(tenantOrg, {
      firstName: 'Arvind',
      lastName: 'Roy',
      phone: '9988776655',
      email: 'arvind.roy@royclinic.in',
      city: 'Jaipur',
      state: 'Rajasthan',
      estimatedCapacityKw: 5.0,
    });
    expect(lead.id).toBeDefined();

    await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.CONTACTED,
      reason: 'Initial consultation conducted',
    });
    await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.QUALIFIED,
      reason: 'Proposal confirmed, transitioning to customer and survey',
    });

    // Step 2: Convert Lead to Customer & Customer Site
    const conversion = await leadsService.convertLead(tenantOrg, lead.id, {
      customerType: 'COMMERCIAL',
      siteName: 'Roy Medical Center Rooftop',
      sanctionedLoadKw: 5.0,
      electricityConnectionNumber: 'JVVNL-JPR-10293',
    });
    expect(conversion.customerId).toBeDefined();
    expect(conversion.siteId).toBeDefined();

    // Step 3: Create & Submit & Approve Site Survey
    const survey = await surveysService.createSurvey(tenantOrg, {
      customerId: conversion.customerId,
      siteId: conversion.siteId,
      leadId: lead.id,
      assignedTechnicianId: tenantOrg.userId,
    });

    await surveysService.submitTechnicalAssessment(tenantOrg, survey.id, {
      roofType: 'RCC_FLAT',
      usableAreaSqFt: 550,
      recommendedCapacityKw: 5.0,
      roofPitchDegrees: 15.0,
      roofAzimuthDegrees: 180.0,
      phaseType: 'THREE_PHASE',
      distanceToMainPanelMeters: 20.0,
    });

    const approvedSurvey = await surveysService.reviewSurvey(tenantOrg, survey.id, {
      action: 'APPROVE',
    });
    expect(approvedSurvey.status).toBe(SurveyStatus.APPROVED);

    // Step 4: Create Engineering Design from Approved Survey
    const design = await engineeringService.createDesign(
      tenantOrg.organizationId,
      {
        customerId: conversion.customerId,
        siteId: conversion.siteId,
        surveyId: approvedSurvey.id,
        title: '5kWp Commercial Rooftop Solar - Dr. Arvind Roy Clinic',
        systemType: SolarSystemType.ON_GRID,
        connectionType: ElectricalPhase.THREE_PHASE,
        targetCapacityKw: 5.0,
      },
      tenantOrg.userId,
    );
    expect(design.designNumber).toMatch(/^DES-\d{4}-\d{6}$/);

    // Step 5: Configure Technical Hardware
    const configuredRev = await engineeringService.configureRevision(
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
    expect(configuredRev.totalDcCapacityKw.toNumber()).toBe(5.5);

    // Step 6: Run Technical Calculations & Sizing
    const calcResult = await engineeringService.runCalculations(
      tenantOrg.organizationId,
      design.id,
      1,
      { designId: design.id, revisionNumber: 1 },
      tenantOrg.userId,
    );
    expect(calcResult.revision.compatibilityStatus).toBe('COMPATIBLE');
    expect(calcResult.output.energyYield.estAnnualGenerationKwh).toBeGreaterThan(6000);

    // Step 7: Approve Engineering Design
    const approvedDesign = await engineeringService.approveDesign(
      tenantOrg.organizationId,
      design.id,
      tenantOrg.userId,
    );
    expect(approvedDesign.status).toBe('APPROVED');

    // Step 8: Generate & Approve BOM
    const bom = await bomService.generateBomForDesignRevision(
      tenantOrg.organizationId,
      design.id,
      1,
      tenantOrg.userId,
    );
    expect(bom.bomNumber).toMatch(/^BOM-\d{4}-\d{6}$/);
    expect(bom.items.length).toBeGreaterThanOrEqual(10);

    const approvedBom = await bomService.approveBom(
      tenantOrg.organizationId,
      bom.id,
      tenantOrg.userId,
    );
    expect(approvedBom.status).toBe(BOMStatus.APPROVED);

    // Step 9: Generate Commercial Quotation
    const quotation = await quotationsService.createQuotation(
      tenantOrg.organizationId,
      {
        customerId: conversion.customerId,
        siteId: conversion.siteId,
        designId: design.id,
        bomId: approvedBom.id,
        discountPercent: 3.0,
      },
      tenantOrg.userId,
    );
    expect(quotation.quotationNumber).toMatch(/^QTN-\d{4}-\d{6}$/);
    expect(quotation.status).toBe(QuotationStatus.DRAFT);

    const approvedQuotation = await quotationsService.approveQuotation(
      tenantOrg.organizationId,
      quotation.id,
      tenantOrg.userId,
    );
    expect(approvedQuotation.status).toBe(QuotationStatus.APPROVED);

    // Step 10: Record Customer Acceptance
    const acceptedQuotation = await quotationsService.recordCustomerAcceptance(
      tenantOrg.organizationId,
      approvedQuotation.id,
      {
        acceptanceMethod: AcceptanceMethod.DIGITAL_SIGNATURE,
        acceptedByCustomerName: 'Dr. Arvind Roy',
        acceptanceEvidenceUrl: 'https://storage.solaros.app/solaros-documents/quotes/arvind-roy-signed.pdf',
      },
      tenantOrg.userId,
    );
    expect(acceptedQuotation.status).toBe(QuotationStatus.ACCEPTED);

    // Step 11: Generate & Sign Legal Contract
    const contract = await contractsService.generateContract(
      tenantOrg.organizationId,
      {
        quotationId: acceptedQuotation.id,
      },
      tenantOrg.userId,
    );
    expect(contract.contractNumber).toMatch(/^CON-\d{4}-\d{6}$/);

    const signedContract = await contractsService.signContract(
      tenantOrg.organizationId,
      contract.id,
      {
        signedByCustomerName: 'Dr. Arvind Roy',
      },
      tenantOrg.userId,
    );
    expect(signedContract.status).toBe(ContractStatus.ACTIVE);

    // Step 12: Create Sales Order & Clear Advance Payment
    const salesOrder = await salesOrdersService.createSalesOrder(
      tenantOrg.organizationId,
      {
        quotationId: acceptedQuotation.id,
        contractId: signedContract.id,
        advanceRequiredPercentage: 20.0,
      },
      tenantOrg.userId,
    );
    expect(salesOrder.orderNumber).toMatch(/^SO-\d{4}-\d{6}$/);
    expect(salesOrder.prerequisitesMet).toBe(false);

    const updatedOrder = await salesOrdersService.recordAdvancePayment(
      tenantOrg.organizationId,
      salesOrder.id,
      {
        amount: salesOrder.advanceRequired.toNumber(),
        paymentMode: 'RTGS',
        referenceNumber: 'RTGS-20261121-778899',
      },
      tenantOrg.userId,
    );
    expect(updatedOrder.prerequisitesMet).toBe(true);

    // Step 13: Confirm Sales Order & Validate Project Initiation Handoff
    const confirmedOrder = await salesOrdersService.confirmSalesOrder(
      tenantOrg.organizationId,
      salesOrder.id,
      { notes: 'Commercial prerequisites verified. Initializing project execution.' },
      tenantOrg.userId,
    );

    expect(confirmedOrder.status).toBe(SalesOrderStatus.CONFIRMED);
    expect(confirmedOrder.fulfillmentStatus).toBe(FulfillmentStatus.PROCUREMENT);
    expect(confirmedOrder.projectInitiation).toBeDefined();
    expect(confirmedOrder.projectInitiation?.projectCode).toMatch(/^PRJ-\d{4}-\d{6}$/);
    expect(confirmedOrder.projectInitiation?.handoverStatus).toBe(ProjectHandoverStatus.READY_FOR_PROCUREMENT);
    expect(confirmedOrder.projectInitiation?.customerId).toBe(conversion.customerId);
  });
});
