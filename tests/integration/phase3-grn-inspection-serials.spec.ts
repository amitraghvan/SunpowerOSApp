import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { InventoryService } from '../../apps/api/src/modules/inventory/inventory.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import {
  GRNStatus,
  LineInspectionStatus,
  InspectionOutcome,
  InspectionAction,
  ProductSerialStatus,
  PurchaseOrderStatus,
} from '@solaros/types';

describe('Phase 3 — Goods Receipt Note (GRN), Quality Inspection & Serial Registration', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let inventoryService: InventoryService;
  let procurementService: ProcurementService;

  const tenantOrg = {
    organizationId: '64646464-6464-4464-8464-646464646464',
    organizationSlug: 'phase3-grn-test-org',
    organizationName: 'Phase 3 GRN Test Org',
    userId: '94646464-6464-4464-8464-646464646464',
  };

  let testSupplierId: string;
  let testVariantId: string;
  let testPoId: string;
  let testPoLineId: string;
  let testLocationId: string;
  let testGrnId: string;
  let testGrnLineId: string;
  let testInspectionId: string;

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
    inventoryService = new InventoryService(prisma, numberingService);
    procurementService = new ProcurementService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quality_inspections" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'qa-tester@solaros.io',
          firstName: 'QA',
          lastName: 'Inspector',
        },
      });

      const location = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'LOC-REC-BAY-1',
          name: 'Main Receiving Bay 1',
          type: 'RECEIVING_BAY',
          isDefaultReceiving: true,
        },
      });
      testLocationId = location.id;

      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-PANELS-GRN',
          name: 'Solar Panels GRN',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-VIKRAM-GRN',
          name: 'Vikram Solar Ltd',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: mfr.id,
          code: 'PROD-VIKRAM-550',
          name: 'Vikram Solar 550W Somera Mono PERC',
          modelNumber: 'VSMD-550',
          type: 'PANEL',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-VIKRAM-550W',
          name: 'Vikram 550W Mono PERC',
          costPrice: 10900,
          sellingPrice: 13800,
        },
      });
      testVariantId = variant.id;

      const supplier = await tx.supplier.create({
        data: {
          organizationId: tenantOrg.organizationId,
          supplierCode: 'SUP-VIKRAM-SOLAR',
          legalName: 'Vikram Solar Limited',
          category: 'MANUFACTURER',
          supplierType: 'SOLAR_PANELS',
          gstin: '19AAACV1234F1Z1',
        },
      });
      testSupplierId = supplier.id;
    });

    // Create an approved PO for 10 panels outside the setup transaction
    const po = await procurementService.createPurchaseOrder(
      tenantOrg.organizationId,
      {
        supplierId: testSupplierId,
        expectedDeliveryDate: new Date(Date.now() + 5 * 86400000),
        lines: [
          {
            productVariantId: testVariantId,
            itemDescription: 'Vikram 550W Somera Solar Panels',
            orderedQuantity: 10,
            unitPrice: 10900,
          },
        ],
      },
      tenantOrg.userId,
    );

    await procurementService.approvePurchaseOrder(
      tenantOrg.organizationId,
      po.id,
      { decision: 'APPROVE' },
      tenantOrg.userId,
    );

    testPoId = po.id;
    testPoLineId = po.lines[0].id;
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quality_inspections" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should create an inbound Goods Receipt Note (GRN) with challan and gate pass verification', async () => {
    const grn = await inventoryService.createGoodsReceiptNote(
      tenantOrg.organizationId,
      {
        purchaseOrderId: testPoId,
        supplierId: testSupplierId,
        supplierChallanNumber: 'CHAL-VIKRAM-9912',
        supplierInvoiceNumber: 'INV-VIKRAM-2026-0881',
        gatePassNumber: 'GP-GATE1-0042',
        vehicleNumber: 'MH-12-PQ-9988',
        transporterName: 'Om Logistics Ltd',
        lrNumber: 'LR-OM-778899',
        receivedLocationId: testLocationId,
        lines: [
          {
            purchaseOrderLineId: testPoLineId,
            productVariantId: testVariantId,
            challanQuantity: 10,
            receivedQuantity: 10,
            unitCost: 10900,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(grn).toBeDefined();
    expect(grn.grnNumber).toMatch(/^GRN-\d{4}-\d{6}$/);
    expect(grn.status).toBe(GRNStatus.INSPECTION_PENDING);
    expect(grn.lines.length).toBe(1);
    expect(Number(grn.lines[0].receivedQuantity)).toBe(10);

    testGrnId = grn.id;
    testGrnLineId = grn.lines[0].id;

    // Verify PO received quantity was updated
    const po = await procurementService.getPurchaseOrder(tenantOrg.organizationId, testPoId);
    expect(Number(po.lines[0].receivedQuantity)).toBe(10);
    expect(po.lines[0].isFullyReceived).toBe(true);
    expect(po.status).toBe(PurchaseOrderStatus.FULLY_RECEIVED);
  });

  it('should perform Quality Inspection (QIR) with checklist results and electrical flash test measurements', async () => {
    const inspection = await inventoryService.performQualityInspection(
      tenantOrg.organizationId,
      {
        goodsReceiptNoteId: testGrnId,
        goodsReceiptLineId: testGrnLineId,
        productVariantId: testVariantId,
        inspectionType: 'COMPLETE' as any,
        totalInspectedQuantity: 10,
        passedQuantity: 9,
        rejectedQuantity: 1,
        overallOutcome: InspectionOutcome.PASS,
        checklistResults: [
          { item: 'Glass Packaging & Seal Integrity', result: 'PASS', criteria: 'No cracks or chips' },
          { item: 'Junction Box & IP68 Rating', result: 'PASS', criteria: 'Intact diodes and seals' },
          { item: 'Frame Anodization & Ground Holes', result: 'PASS', criteria: '35mm frame standard' },
          { item: 'EL Image & Micro-crack Screening', result: 'PASS', criteria: 'Zero cell micro-cracks' },
        ],
        measurements: {
          sampleVocVolts: 49.8,
          sampleIscAmps: 13.9,
          measuredPmaxWatts: 552.4,
          flashTestTolerancePct: 0.43,
        },
        rejectionReasons: ['1 panel backsheet delamination defect near terminal box'],
        actionRecommended: InspectionAction.ACCEPT,
        inspectorNotes: '9 panels passed complete STC verification; 1 panel rejected due to rear delamination',
      },
      tenantOrg.userId,
    );

    expect(inspection).toBeDefined();
    expect(inspection.inspectionNumber).toMatch(/^QIR-\d{4}-\d{6}$/);
    expect(inspection.overallOutcome).toBe(InspectionOutcome.PASS);
    expect(Number(inspection.passedQuantity)).toBe(9);
    expect(Number(inspection.rejectedQuantity)).toBe(1);
    testInspectionId = inspection.id;

    // Verify GRN line and note statuses updated
    const grn = await inventoryService.getGoodsReceiptNote(tenantOrg.organizationId, testGrnId);
    expect(grn.lines[0].inspectionStatus).toBe(LineInspectionStatus.PASSED);
    expect(Number(grn.lines[0].acceptedQuantity)).toBe(9);
    expect(Number(grn.lines[0].rejectedQuantity)).toBe(1);
    expect(grn.status).toBe(GRNStatus.PARTIALLY_ACCEPTED);
  });

  it('should register individual serial numbers with electrical specs and internal asset codes', async () => {
    const serials = await inventoryService.registerSerialNumbers(
      tenantOrg.organizationId,
      {
        goodsReceiptNoteId: testGrnId,
        goodsReceiptLineId: testGrnLineId,
        inspectionId: testInspectionId,
        productVariantId: testVariantId,
        serials: [
          {
            manufacturerSerialNumber: 'VSMD550-2026-000101',
            batchNumber: 'BATCH-2026-Q4-01',
            electricalSpecs: { voc: 49.82, isc: 13.91, pmax: 552.8 },
            warrantyPeriodMonths: 144, // 12-year product warranty
          },
          {
            manufacturerSerialNumber: 'VSMD550-2026-000102',
            batchNumber: 'BATCH-2026-Q4-01',
            electricalSpecs: { voc: 49.79, isc: 13.90, pmax: 551.9 },
            warrantyPeriodMonths: 144,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(serials.length).toBe(2);
    expect(serials[0].manufacturerSerialNumber).toBe('VSMD550-2026-000101');
    expect(serials[0].internalAssetCode).toMatch(/^AST-\d{4}-\d{6}$/);
    expect(serials[0].status).toBe(ProductSerialStatus.IN_STOCK);
    expect(serials[0].storageLocationId).toBe(testLocationId);
  });

  it('should reject registering duplicate manufacturer serial numbers', async () => {
    await expect(
      inventoryService.registerSerialNumbers(
        tenantOrg.organizationId,
        {
          goodsReceiptNoteId: testGrnId,
          goodsReceiptLineId: testGrnLineId,
          productVariantId: testVariantId,
          serials: [
            {
              manufacturerSerialNumber: 'VSMD550-2026-000101', // already registered
            },
          ],
        },
        tenantOrg.userId,
      ),
    ).rejects.toThrow('already registered');
  });

  it('should track registered serial inventory with status and asset provenance', async () => {
    const list = await inventoryService.listSerials(tenantOrg.organizationId, {
      productVariantId: testVariantId,
      status: ProductSerialStatus.IN_STOCK,
    });

    expect(list.total).toBe(2);
    expect(list.items.length).toBe(2);

    const details = await inventoryService.getSerialDetails(
      tenantOrg.organizationId,
      list.items[0].id,
    );
    expect(details.goodsReceiptNote.grnNumber).toMatch(/^GRN-\d{4}-\d{6}$/);
    expect(details.goodsReceiptNote.supplier.legalName).toBe('Vikram Solar Limited');
    expect(details.qualityInspection?.inspectionNumber).toMatch(/^QIR-\d{4}-\d{6}$/);
  });
});
