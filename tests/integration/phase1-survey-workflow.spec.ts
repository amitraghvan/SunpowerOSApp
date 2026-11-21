import { SurveysService } from '../../apps/api/src/modules/surveys/surveys.service';
import { StorageService } from '../../apps/api/src/infrastructure/storage/storage.service';
import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SurveyStatus } from '@solaros/types';

describe('Phase 1 — Site Survey & Assessment Workflow Integration Suite', () => {
  let prisma: PrismaService;
  let storage: StorageService;
  let surveysService: SurveysService;

  const tenantOrg = {
    organizationId: '55555555-5555-4555-8555-555555555555',
    organizationSlug: 'surv-test-org',
    organizationName: 'Survey Test Organization',
    userId: '22222222-bbbb-4bbb-bbbb-222222222222',
    userEmail: 'tech@survtest.com',
    roles: ['TECHNICIAN'],
    permissions: [],
  };

  let customerId: string;
  let siteId: string;

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
    surveysService = new SurveysService(prisma, storage);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: tenantOrg.userEmail,
          firstName: 'Field',
          lastName: 'Technician',
        },
      });

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      // Create a customer & site
      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-SURV-001',
          name: 'Survey Target Customer',
          phone: '9800011122',
        },
      });
      customerId = customer.id;

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Warehouse 4 Rooftop',
          addressLine1: 'Industrial Area Phase 2',
          city: 'Jaipur',
          state: 'Rajasthan',
          postalCode: '302013',
          roofType: 'METAL_SHEET',
          sanctionedLoadKw: 25,
        },
      });
      siteId = site.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('1. should create a survey and schedule technician site visit', async () => {
    const survey = await surveysService.createSurvey(tenantOrg, {
      customerId,
      siteId,
    });

    expect(survey.id).toBeDefined();
    expect(survey.surveyNumber).toMatch(/^SURV-\d{8}-\d{4}$/);
    expect(survey.status).toBe(SurveyStatus.REQUESTED);

    // Schedule survey
    const scheduled = await surveysService.scheduleSurvey(tenantOrg, survey.id, {
      assignedTechnicianId: tenantOrg.userId,
      scheduledDate: new Date().toISOString(),
    });

    expect(scheduled.status).toBe(SurveyStatus.SCHEDULED);
    expect(scheduled.scheduledDate).toBeDefined();
  });

  it('2. should submit technical rooftop & electrical assessment and generate revision snapshot', async () => {
    const surveys = await surveysService.getSurveys(tenantOrg, {});
    const surveyId = surveys.data[0].id;

    const completed = await surveysService.submitTechnicalAssessment(tenantOrg, surveyId, {
      roofType: 'METAL_SHEET',
      roofAgeYears: 3,
      roofCondition: 'EXCELLENT',
      usableAreaSqFt: 2500,
      roofAzimuthDegrees: 180,
      recommendedCapacityKw: 20,
      sanctionedLoadKw: 25,
      phaseType: 'THREE_PHASE',
      currentVoltage: 415,
      cableLengthMeters: 40,
      earthingRequired: true,
      lightningArresterRequired: true,
      inverterLocation: 'OUTDOOR',
    });

    expect(completed.status).toBe(SurveyStatus.COMPLETED);
    expect(Number(completed.recommendedCapacityKw)).toBe(20);

    // Verify SurveyRevision was recorded
    const revisions = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.surveyRevision.findMany({ where: { surveyId } })
    );
    expect(revisions.length).toBe(1);
    expect(revisions[0].revisionNumber).toBe(1);
  });

  it('3. should generate MinIO presigned upload URL and save confirmed photo records', async () => {
    const surveys = await surveysService.getSurveys(tenantOrg, {});
    const surveyId = surveys.data[0].id;

    const uploadRequest = await surveysService.requestPhotoUploadUrl(tenantOrg, surveyId, {
      fileName: 'roof_south_exposure.jpg',
      mimeType: 'image/jpeg',
      category: 'ROOF',
      caption: 'Full southward rooftop view',
    });

    expect(uploadRequest.uploadUrl).toBeDefined();
    expect(uploadRequest.uploadUrl).toContain('localhost:9000');
    expect(uploadRequest.objectKey).toContain('surveys/');

    // Confirm photo upload
    const confirmed = await surveysService.confirmPhotoUpload(tenantOrg, surveyId, {
      category: 'ROOF',
      objectKey: uploadRequest.objectKey,
      originalFileName: 'roof_south_exposure.jpg',
      mimeType: 'image/jpeg',
      fileSize: 204850,
      caption: 'Full southward rooftop view',
    });

    expect(confirmed.id).toBeDefined();
    expect(confirmed.objectKey).toBe(uploadRequest.objectKey);

    // Fetch photos with signed download URLs
    const photosWithUrls = await surveysService.getSurveyPhotos(tenantOrg, surveyId);
    expect(photosWithUrls.length).toBe(1);
    expect(photosWithUrls[0].downloadUrl).toBeDefined();
  });

  it('4. should handle review lifecycle (revision request and final approval)', async () => {
    const surveys = await surveysService.getSurveys(tenantOrg, {});
    const surveyId = surveys.data[0].id;

    // 1. Request Revision
    const revisionReq = await surveysService.reviewSurvey(tenantOrg, surveyId, {
      action: 'REQUEST_REVISION',
      rejectionReason: 'Need clearer switchboard busbar photographs',
    });
    expect(revisionReq.status).toBe(SurveyStatus.REVISION_REQUESTED);
    expect(revisionReq.currentRevisionNumber).toBe(2);

    // 2. Final Approval
    const approved = await surveysService.reviewSurvey(tenantOrg, surveyId, {
      action: 'APPROVE',
    });
    expect(approved.status).toBe(SurveyStatus.APPROVED);
    expect(approved.rejectionReason).toBeNull();
  });

  it('5. should generate complete printable feasibility assessment report', async () => {
    const surveys = await surveysService.getSurveys(tenantOrg, {});
    const surveyId = surveys.data[0].id;

    const report = await surveysService.generateSurveyReport(tenantOrg, surveyId);
    expect(report.reportTitle).toContain('Site Survey & Feasibility Assessment Report');
    expect(report.customer.name).toBe('Survey Target Customer');
    expect(report.site.siteName).toBe('Warehouse 4 Rooftop');
    expect(Number(report.roofAssessment.recommendedCapacityKw)).toBe(20);
    expect(report.photos.length).toBe(1);
  });
});
