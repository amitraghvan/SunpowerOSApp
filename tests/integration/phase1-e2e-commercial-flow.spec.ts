import { LeadsService } from '../../apps/api/src/modules/crm/leads.service';
import { CustomersService } from '../../apps/api/src/modules/customers/customers.service';
import { SurveysService } from '../../apps/api/src/modules/surveys/surveys.service';
import { CatalogService } from '../../apps/api/src/modules/catalog/catalog.service';
import { StorageService } from '../../apps/api/src/infrastructure/storage/storage.service';
import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LeadStatus, SurveyStatus } from '@solaros/types';

describe('Phase 1 — Complete Commercial End-to-End Lifecycle', () => {
  let prisma: PrismaService;
  let storage: StorageService;
  let leadsService: LeadsService;
  let customersService: CustomersService;
  let surveysService: SurveysService;
  let catalogService: CatalogService;

  const tenantOrg = {
    organizationId: '99999999-9999-4999-8999-999999999999',
    organizationSlug: 'e2e-commercial-org',
    organizationName: 'SunPower Commercial Solar EPC',
    userId: '44444444-dddd-4ddd-dddd-444444444444',
    userEmail: 'leadengineer@sunpowerepc.com',
    roles: ['SOLAR_ENGINEER', 'ORG_ADMIN'],
    permissions: [],
  };

  beforeAll(async () => {
    const configService = new ConfigService({
      STORAGE_ENDPOINT: 'localhost',
      STORAGE_PORT: 9000,
      STORAGE_USE_SSL: 'false',
      STORAGE_ACCESS_KEY: 'minioadmin',
      STORAGE_SECRET_KEY: 'minioadmin',
    });

    storage = new StorageService(configService);
    await storage.onModuleInit();

    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    leadsService = new LeadsService(prisma);
    customersService = new CustomersService(prisma);
    surveysService = new SurveysService(prisma, storage);
    catalogService = new CatalogService(prisma);

    // Initialize tenant context
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: tenantOrg.userEmail,
          firstName: 'Principal',
          lastName: 'Solar Engineer',
        },
      });

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('executes full end-to-end commercial lifecycle without mocks', async () => {
    // -------------------------------------------------------------------------
    // Step 1: Solar Lead Ingestion & Qualification
    // -------------------------------------------------------------------------
    const lead = await leadsService.createLead(tenantOrg, {
      firstName: 'Ananya',
      lastName: 'Deshmukh',
      phone: '9820011223',
      email: 'ananya.deshmukh@example.com',
      address: 'Plot 88, Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411045',
      source: 'REFERRAL',
      systemType: 'ON_GRID',
      estimatedMonthlyBill: 7500,
      estimatedRoofAreaSqFt: 1100,
      estimatedCapacityKw: 6,
    });

    expect(lead.status).toBe(LeadStatus.NEW);
    expect(lead.score).toBeGreaterThan(70);

    // Transition: NEW -> CONTACTED -> QUALIFIED
    await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.CONTACTED,
      reason: 'Introduction call completed, high purchase intent',
    });

    await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.QUALIFIED,
      reason: 'Satellite imagery confirms unshaded south-facing RCC roof',
    });

    // -------------------------------------------------------------------------
    // Step 2: Atomic Conversion to Customer 360 Account
    // -------------------------------------------------------------------------
    const conversion = await leadsService.convertLead(tenantOrg, lead.id, {
      customerType: 'INDIVIDUAL',
      siteName: 'Baner Bungalow Rooftop',
      sanctionedLoadKw: 7,
      electricityConnectionNumber: 'MSEDCL-PUN-88912',
    });

    expect(conversion.success).toBe(true);
    expect(conversion.customerId).toBeDefined();

    // Verify Customer 360 data
    const customer360 = await customersService.getCustomer360(tenantOrg, conversion.customerId);
    expect(customer360.name).toBe('Ananya Deshmukh');
    expect(customer360.sites.length).toBe(1);
    expect(customer360.sites[0].electricityConnectionNumber).toBe('MSEDCL-PUN-88912');

    // -------------------------------------------------------------------------
    // Step 3: Site Survey Dispatch & Technical Assessment
    // -------------------------------------------------------------------------
    const survey = await surveysService.createSurvey(tenantOrg, {
      customerId: conversion.customerId,
      siteId: conversion.siteId,
      leadId: lead.id,
      assignedTechnicianId: tenantOrg.userId,
      scheduledDate: new Date().toISOString(),
    });

    expect(survey.status).toBe(SurveyStatus.SCHEDULED);

    // Field technician submits full technical parameters
    const completedSurvey = await surveysService.submitTechnicalAssessment(tenantOrg, survey.id, {
      roofType: 'RCC_FLAT',
      roofAgeYears: 4,
      roofCondition: 'EXCELLENT',
      usableAreaSqFt: 950,
      roofAzimuthDegrees: 180,
      recommendedCapacityKw: 6,

      sanctionedLoadKw: 7,
      currentVoltage: 235,
      phaseType: 'SINGLE_PHASE',
      incomingCableCapacitySqMm: 16,
      cableLengthMeters: 18,
      earthingRequired: true,
      lightningArresterRequired: true,
      inverterLocation: 'INDOOR',
    });

    expect(completedSurvey.status).toBe(SurveyStatus.COMPLETED);

    // -------------------------------------------------------------------------
    // Step 4: Field Photo Upload & Verification
    // -------------------------------------------------------------------------
    const upload = await surveysService.requestPhotoUploadUrl(tenantOrg, survey.id, {
      fileName: 'meter_sanctioned_load.jpg',
      mimeType: 'image/jpeg',
      category: 'METER',
      caption: 'MSEDCL digital meter reading showing 7kW sanctioned load',
    });

    await surveysService.confirmPhotoUpload(tenantOrg, survey.id, {
      category: 'METER',
      objectKey: upload.objectKey,
      originalFileName: 'meter_sanctioned_load.jpg',
      mimeType: 'image/jpeg',
      fileSize: 154000,
      caption: 'MSEDCL digital meter reading',
    });

    const photos = await surveysService.getSurveyPhotos(tenantOrg, survey.id);
    expect(photos.length).toBe(1);
    expect(photos[0].category).toBe('METER');

    // -------------------------------------------------------------------------
    // Step 5: Solar Engineering Review & Feasibility Report Generation
    // -------------------------------------------------------------------------
    const approvedSurvey = await surveysService.reviewSurvey(tenantOrg, survey.id, {
      action: 'APPROVE',
    });
    expect(approvedSurvey.status).toBe(SurveyStatus.APPROVED);

    const report = await surveysService.generateSurveyReport(tenantOrg, survey.id);
    expect(report.customer.name).toBe('Ananya Deshmukh');
    expect(report.site.siteName).toBe('Baner Bungalow Rooftop');
    expect(Number(report.roofAssessment.recommendedCapacityKw)).toBe(6);

    // -------------------------------------------------------------------------
    // Step 6: Catalog Lookups & Variant Pricing for Proposed System
    // -------------------------------------------------------------------------
    const category = await catalogService.createCategory(tenantOrg, {
      code: 'SOLAR_MODULES',
      name: 'Solar PV Modules',
    });

    const manufacturer = await catalogService.createManufacturer(tenantOrg, {
      code: 'WAAREE',
      name: 'Waaree Energies Ltd',
      country: 'India',
    });

    const product = await catalogService.createProduct(tenantOrg, {
      categoryId: category.id,
      manufacturerId: manufacturer.id,
      code: 'WAAREE-540-BIFI',
      name: 'Waaree 540W Bifacial Mono PERC Module',
      modelNumber: 'WSE-540',
      type: 'PANEL',
      warrantyYears: 25,
    });

    const variant = await catalogService.createVariant(tenantOrg, product.id, {
      sku: 'WAAREE-540-BIFI-SILVER',
      name: '540W Silver Frame',
      ratedCapacityWatts: 540,
      costPrice: 9900,
      sellingPrice: 12400,
    });

    expect(variant.id).toBeDefined();
    expect(Number(variant.sellingPrice)).toBe(12400);

    // Calculate BOM requirement: 6 kW / 0.540 kW = 12 modules
    const modulesNeeded = Math.ceil((Number(report.roofAssessment.recommendedCapacityKw) * 1000) / Number(variant.ratedCapacityWatts));
    expect(modulesNeeded).toBe(12);
    const totalModulesSellingPrice = modulesNeeded * Number(variant.sellingPrice);
    expect(totalModulesSellingPrice).toBe(12 * 12400);
  });
});
