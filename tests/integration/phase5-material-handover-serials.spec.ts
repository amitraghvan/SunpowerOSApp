import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { MaterialHandoverService } from '../../apps/api/src/modules/installation/material-handover.service';

describe('Phase 5 — Material Handover, Site Custody & Serial Tracking', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let handoverService: MaterialHandoverService;

  const tenantOrg = {
    organizationId: '84848484-8484-4484-8484-848484848484',
    organizationSlug: 'phase5-handover-org',
    organizationName: 'Phase 5 Handover Org',
    supervisorUserId: '94848484-8484-4484-8484-848484848484',
    transporterUserId: '94848484-8484-4484-8484-848484848485',
  };

  let testProjectId: string;
  let testVariantId: string;
  let testSerial1: string;
  let testSerial2: string;
  let testHandoverId: string;
  let testLineId: string;

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
    handoverService = new MaterialHandoverService(prisma, numberingService);

    testSerial1 = 'SN-TATA-545-001';
    testSerial2 = 'SN-TATA-545-002';

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous test artifacts
      await tx.$executeRawUnsafe(`DELETE FROM "material_consumptions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_handover_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_material_handovers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.supervisorUserId}', '${tenantOrg.transporterUserId}')`);
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
            id: tenantOrg.supervisorUserId,
            email: 'supervisor.mho@solarcrew.com',
            firstName: 'Karan',
            lastName: 'Mehta',
          },
          {
            id: tenantOrg.transporterUserId,
            email: 'driver.mho@solarlogistics.com',
            firstName: 'Suresh',
            lastName: 'Rathore',
          },
        ],
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-003',
          name: 'Shree Cement Factory',
          phone: '+919876522222',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Cement Factory Shed 4',
          addressLine1: 'Plot 10, MIDC Chakan',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '410501',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-003',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-003',
          title: 'Cement Factory 100kW Design',
          targetCapacityKw: 100.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-003',
          revisionNumber: 1,
          totalMaterialCost: 3200000,
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
          quotationNumber: 'QTN-P5-003',
          totalAmount: 4200000,
          grandTotal: 4200000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Cement Factory 100kW Installation',
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
          orderNumber: 'SO-P5-003',
          totalAmount: 4200000,
          advanceRequired: 840000,
          advanceReceived: 840000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-003',
          projectName: 'Shree Cement 100kW Solar Installation',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 100.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.supervisorUserId,
          installationStatus: 'MATERIAL_HANDOVER_PENDING',
        },
      });
      testProjectId = project.id;

      // Seed Product Variant & Serial Numbers
      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-P5-PANEL',
          name: 'Solar PV Modules',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-P5-TATA',
          name: 'Tata Power Solar',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-P5-TATA-545',
          name: 'Tata 545W Mono PERC',
          modelNumber: 'TP-545-MONO',
          type: 'MODULE',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-P5-TATA-545W',
          name: 'Tata 545W Mono PERC Module',
          costPrice: 11000,
          sellingPrice: 13500,
        },
      });
      testVariantId = variant.id;

      const wh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-P5-PUNE',
          name: 'Pune Central Warehouse',
          address: 'Plot 10, MIDC Chakan, Pune, Maharashtra 410501',
        },
      });

      const loc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: wh.id,
          code: 'LOC-P5-A1',
          name: 'Aisle 1 Bay 1',
        },
      });

      // Initial Phase 3/4 inventory receipt movement (stock in warehouse)
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-P5-INIT-001',
          movementType: 'PURCHASE_RECEIPT',
          productVariantId: variant.id,
          toLocationId: loc.id,
          quantity: 2,
          unitCost: 11000,
          totalValue: 22000,
          referenceType: 'PO_INIT',
          referenceId: 'PO-P5-001',
        },
      });

      // Product serials initially IN_STOCK
      await tx.productSerial.createMany({
        data: [
          {
            organizationId: tenantOrg.organizationId,
            productVariantId: variant.id,
            manufacturerSerialNumber: testSerial1,
            internalAssetCode: 'AST-' + testSerial1,
            warehouseId: wh.id,
            storageLocationId: loc.id,
            status: 'IN_STOCK',
          },
          {
            organizationId: tenantOrg.organizationId,
            productVariantId: variant.id,
            manufacturerSerialNumber: testSerial2,
            internalAssetCode: 'AST-' + testSerial2,
            warehouseId: wh.id,
            storageLocationId: loc.id,
            status: 'IN_STOCK',
          },
        ],
      });
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should create material custody handover record with expected lines and serials', async () => {
    const handover = await handoverService.createMaterialHandover(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        receiverRole: 'SITE_SUPERVISOR',
        siteLocationNotes: 'Staged on ground floor secured storage bay',
        lines: [
          {
            productVariantId: testVariantId,
            expectedQuantity: 2,
            serialNumbersExpected: [testSerial1, testSerial2],
          },
        ],
      },
      tenantOrg.transporterUserId,
    );

    expect(handover).toBeDefined();
    expect(handover.handoverNumber).toMatch(/^MHO-\d{4}-\d{6}$/);
    expect(handover.status).toBe('PENDING_RECEIPT');
    expect(Number(handover.totalItemsExpected)).toBe(2);
    expect(handover.lines).toHaveLength(1);
    expect(handover.lines[0].serialNumbersExpected).toContain(testSerial1);
    expect(handover.lines[0].serialNumbersExpected).toContain(testSerial2);

    testHandoverId = handover.id;
    testLineId = handover.lines[0].id;
  });

  it('2. should verify material handover line with serial barcode matching', async () => {
    const updatedLine = await handoverService.verifyHandoverLine(
      tenantOrg.organizationId,
      testHandoverId,
      {
        lineId: testLineId,
        verifiedQuantity: 2,
        serialNumbersVerified: [testSerial1, testSerial2],
        notes: 'Both modules physically inspected, glass and frame intact',
      },
    );

    expect(updatedLine).toBeDefined();
    expect(Number(updatedLine.verifiedQuantity)).toBe(2);
    expect(updatedLine.status).toBe('MATCHED');
    expect(updatedLine.serialNumbersVerified).toHaveLength(2);

    // Verify parent handover status updated to VERIFIED
    const handover = await prisma.asSuperAdmin(async (tx) =>
      tx.projectMaterialHandover.findUnique({
        where: { id: testHandoverId },
      }),
    );
    expect(handover?.status).toBe('VERIFIED');
    expect(Number(handover?.totalItemsVerified)).toBe(2);
  });

  it('3. should accept site custody: ZERO double warehouse stock deduction invariant verified', async () => {
    // Record current inventory movements count before handover acceptance
    const movementsBeforeCount = await prisma.asSuperAdmin(async (tx) =>
      tx.inventoryReceiptMovement.count({
        where: { organizationId: tenantOrg.organizationId },
      }),
    );

    const accepted = await handoverService.acceptHandover(
      tenantOrg.organizationId,
      testHandoverId,
      {
        custodySignatureUrl: 'https://storage.solaros.local/signatures/site-custody-sign.png',
        siteLocationNotes: 'Secured on site under covered shelter',
      },
      tenantOrg.supervisorUserId,
    );

    expect(accepted).toBeDefined();
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.receivedById).toBe(tenantOrg.supervisorUserId);
    expect(accepted.custodySignatureUrl).toBeDefined();

    // CRITICAL INVENTORY INVARIANT VERIFICATION:
    // Ensure ZERO double deduction from inventory_receipt_movements
    const movementsAfterCount = await prisma.asSuperAdmin(async (tx) =>
      tx.inventoryReceiptMovement.count({
        where: { organizationId: tenantOrg.organizationId },
      }),
    );
    expect(movementsAfterCount).toBe(movementsBeforeCount);

    // Verify ProductSerial status moved to ALLOCATED and linked to project
    const serials = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findMany({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: { in: [testSerial1, testSerial2] },
        },
      }),
    );
    expect(serials).toHaveLength(2);
    expect(serials[0].status).toBe('ALLOCATED');
    expect(serials[0].projectInitiationId).toBe(testProjectId);
    expect(serials[1].status).toBe('ALLOCATED');
    expect(serials[1].projectInitiationId).toBe(testProjectId);

    // Verify project installationStatus transitioned to INSTALLATION_IN_PROGRESS
    const project = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(project?.installationStatus).toBe('INSTALLATION_IN_PROGRESS');
  });

  it('4. should log site material consumption and mark serials as INSTALLED', async () => {
    const consumption = await handoverService.recordConsumption(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        productVariantId: testVariantId,
        quantityUsed: 2,
        serialNumbers: [testSerial1, testSerial2],
        notes: 'Both modules mounted on Table 1, String 1',
      },
      tenantOrg.supervisorUserId,
    );

    expect(consumption).toBeDefined();
    expect(consumption.consumptionNumber).toMatch(/^CON-\d{4}-\d{6}$/);
    expect(Number(consumption.quantityUsed)).toBe(2);

    // Verify product serials are now marked INSTALLED
    const installedSerials = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findMany({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: { in: [testSerial1, testSerial2] },
        },
      }),
    );
    expect(installedSerials).toHaveLength(2);
    expect(installedSerials[0].status).toBe('INSTALLED');
    expect(installedSerials[1].status).toBe('INSTALLED');
  });
});
