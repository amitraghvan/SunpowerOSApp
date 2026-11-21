import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { CommissioningService } from '../../apps/api/src/modules/installation/commissioning.service';
import { BadRequestException } from '@nestjs/common';

describe('Phase 5 — Testing, Commissioning & Mandatory Quality Gate Enforcement', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let commissioningService: CommissioningService;

  const tenantOrg = {
    organizationId: '86868686-8686-4686-8686-868686868686',
    organizationSlug: 'phase5-commissioning-org',
    organizationName: 'Phase 5 Commissioning Org',
    engineerUserId: '96868686-8686-4686-8686-868686868686',
    managerUserId: '96868686-8686-4686-8686-868686868687',
  };

  let testProjectId: string;
  let testVariantId: string;
  let testInverterSerial: string;
  let testCommissioningId: string;

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
    commissioningService = new CommissioningService(prisma, numberingService);
    testInverterSerial = 'INV-SUNGROW-50K-001';

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous test artifacts
      await tx.$executeRawUnsafe(`DELETE FROM "commissioning_tests" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "commissioning_records" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.engineerUserId}', '${tenantOrg.managerUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.user.createMany({
        data: [
          {
            id: tenantOrg.engineerUserId,
            email: 'engineer.comm@solarcrew.com',
            firstName: 'Naveen',
            lastName: 'Kumar',
          },
          {
            id: tenantOrg.managerUserId,
            email: 'manager.comm@solarcrew.com',
            firstName: 'Sunil',
            lastName: 'Verma',
          },
        ],
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-005',
          name: 'Metro Hospitals Pune',
          phone: '+919876544444',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Hospital Tertiary Wing Roof',
          addressLine1: 'Bhandarkar Road, Shivajinagar',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411004',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-005',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-005',
          title: 'Metro Hospital 50kW Design',
          targetCapacityKw: 50.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-005',
          revisionNumber: 1,
          totalMaterialCost: 1600000,
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
          quotationNumber: 'QTN-P5-005',
          totalAmount: 2200000,
          grandTotal: 2200000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Metro Hospital 50kW Turnkey Installation',
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
          orderNumber: 'SO-P5-005',
          totalAmount: 2200000,
          advanceRequired: 440000,
          advanceReceived: 440000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-005',
          projectName: 'Metro Hospital 50kW Solar EPC',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 50.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.engineerUserId,
          installationStatus: 'INSTALLATION_COMPLETED',
        },
      });
      testProjectId = project.id;

      // Seed Inverter Product Variant & Serial
      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-P5-INV',
          name: 'Solar Inverters',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-P5-SUNGROW',
          name: 'Sungrow Power Supply',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-P5-SG50CX',
          name: 'Sungrow SG50CX 50kW Inverter',
          modelNumber: 'SG50CX',
          type: 'INVERTER',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-P5-SG50CX',
          name: 'Sungrow 50kW On-Grid Inverter',
          costPrice: 120000,
          sellingPrice: 145000,
        },
      });
      testVariantId = variant.id;

      await tx.productSerial.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productVariantId: variant.id,
          manufacturerSerialNumber: testInverterSerial,
          internalAssetCode: 'AST-' + testInverterSerial,
          projectInitiationId: project.id,
          status: 'ALLOCATED',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should create technical commissioning record with Voc, Isc and 8 standard test protocols', async () => {
    const record = await commissioningService.createCommissioningRecord(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        installedCapacityKw: 50.0,
        inverterSerialNumbers: [testInverterSerial],
        dcVocMeasured: 420.5,
        dcIscMeasured: 13.4,
        acVoltageRy: 415.2,
        acVoltageYb: 414.8,
        acVoltageBr: 415.0,
        gridFrequencyHz: 50.02,
        earthResistanceOhms: 2.3,
        insulationResistanceMohms: 32.0,
        antiIslandingTripTimeSeconds: 0.8,
      },
      tenantOrg.engineerUserId,
    );

    expect(record).toBeDefined();
    expect(record.commissioningNumber).toMatch(/^COM-\d{4}-\d{6}$/);
    expect(record.status).toBe('IN_PROGRESS');
    expect(record.tests).toHaveLength(8);

    // Verify project installationStatus transitioned to COMMISSIONING_PENDING
    const project = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(project?.installationStatus).toBe('COMMISSIONING_PENDING');
    expect(project?.commissioningStatus).toBe('TESTING');

    testCommissioningId = record.id;
  });

  it('2. should enforce STRICT GATE: approveCommissioning must throw BadRequestException if any mandatory test failed', async () => {
    // Intentionally inject a failing mandatory test
    await prisma.asSuperAdmin(async (tx) =>
      tx.commissioningTest.updateMany({
        where: {
          commissioningRecordId: testCommissioningId,
          testCategory: 'ANTI_ISLANDING',
        },
        data: {
          testResult: 'FAIL',
          remarks: 'Inverter did not trip within 2 seconds upon grid loss simulation',
        },
      }),
    );

    await expect(
      commissioningService.approveCommissioning(
        tenantOrg.organizationId,
        testCommissioningId,
        { notes: 'Attempting approval with failed anti-islanding test' },
        tenantOrg.managerUserId,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('3. should approve commissioning once all mandatory tests pass and stamp ProductSerial.commissionedAt', async () => {
    // Correct the failing test to PASS
    await prisma.asSuperAdmin(async (tx) =>
      tx.commissioningTest.updateMany({
        where: {
          commissioningRecordId: testCommissioningId,
          testCategory: 'ANTI_ISLANDING',
        },
        data: {
          testResult: 'PASS',
          measuredValue: '0.78 Seconds',
          remarks: 'Firmware protection trip threshold calibrated and verified',
        },
      }),
    );

    const approved = await commissioningService.approveCommissioning(
      tenantOrg.organizationId,
      testCommissioningId,
      { notes: 'All 8 tests fully verified compliant with grid codes and IS 3043:2018' },
      tenantOrg.managerUserId,
    );

    expect(approved).toBeDefined();
    expect(approved.status).toBe('APPROVED');
    expect(approved.approvedById).toBe(tenantOrg.managerUserId);
    expect(approved.approvedAt).toBeDefined();

    // Verify project installationStatus transitioned to COMMISSIONED
    const project = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(project?.installationStatus).toBe('COMMISSIONED');
    expect(project?.commissioningStatus).toBe('APPROVED');

    // Verify inverter ProductSerial status is INSTALLED and commissionedAt is stamped
    const serial = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findFirst({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: testInverterSerial,
        },
      }),
    );
    expect(serial?.status).toBe('INSTALLED');
    expect(serial?.commissionedAt).toBeDefined();
  });
});
