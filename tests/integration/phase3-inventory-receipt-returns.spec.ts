import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { InventoryService } from '../../apps/api/src/modules/inventory/inventory.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import {
  InventoryLocationType,
  ProductSerialStatus,
  SupplierReturnStatus,
  SupplierReturnType,
  MovementType,
} from '@solaros/types';

describe('Phase 3 — Inventory Receiving Ledger, Multi-Location & Supplier Returns', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let procurementService: ProcurementService;
  let inventoryService: InventoryService;

  const tenantOrg = {
    organizationId: '65656565-6565-4565-8565-656565656565',
    organizationSlug: 'phase3-ledger-returns-org',
    organizationName: 'Phase 3 Ledger Returns Org',
    userId: '95656565-6565-4565-8565-656565656565',
  };

  let testSupplierId: string;
  let testVariantId: string;
  let testSerialId: string;
  let testSerialNum: string;

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
    procurementService = new ProcurementService(prisma, numberingService);
    inventoryService = new InventoryService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'warehouse-clerk@solaros.io',
          firstName: 'Warehouse',
          lastName: 'Receiving',
        },
      });

      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-BATTERY-RET',
          name: 'Lithium Batteries Return Test',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-EXIDE-RET',
          name: 'Exide Industries Ltd',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: mfr.id,
          code: 'PROD-EXIDE-5KWH',
          name: 'Exide 5kWh LiFePO4 Storage Unit',
          modelNumber: 'EX-5K-LFP',
          type: 'BATTERY',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-EXIDE-5KWH-LFP',
          name: 'Exide 5.12kWh 51.2V 100Ah LFP Battery',
          costPrice: 95000,
          sellingPrice: 120000,
        },
      });
      testVariantId = variant.id;

      const supplier = await tx.supplier.create({
        data: {
          organizationId: tenantOrg.organizationId,
          supplierCode: 'SUP-EXIDE-POWER',
          legalName: 'Exide Energy Solutions Limited',
          category: 'MANUFACTURER',
          supplierType: 'BATTERIES',
          gstin: '29AAACE1234K1Z9',
        },
      });
      testSupplierId = supplier.id;
    });

    // Create PO and GRN to supply a real GRN relation for the serial
    const po = await procurementService.createPurchaseOrder(
      tenantOrg.organizationId,
      {
        supplierId: testSupplierId,
        expectedDeliveryDate: new Date(Date.now() + 5 * 86400000),
        lines: [
          {
            productVariantId: testVariantId,
            itemDescription: 'Exide 5kWh LiFePO4 Storage Unit',
            orderedQuantity: 1,
            unitPrice: 95000,
          },
        ],
      },
      tenantOrg.userId,
    );

    const grn = await inventoryService.createGoodsReceiptNote(
      tenantOrg.organizationId,
      {
        purchaseOrderId: po.id,
        supplierId: testSupplierId,
        supplierInvoiceNumber: 'INV-EXIDE-RET-01',
        lines: [
          {
            purchaseOrderLineId: po.lines[0].id,
            productVariantId: testVariantId,
            receivedQuantity: 1,
            acceptedQuantity: 1,
            rejectedQuantity: 0,
          },
        ],
      },
      tenantOrg.userId,
    );

    // Seed a serial battery for return testing
    testSerialNum = 'EXIDE-LFP-DEFECT-001';
    const serial = await prisma.asSuperAdmin(async (tx) => {
      return tx.productSerial.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productVariantId: testVariantId,
          goodsReceiptNoteId: grn.id,
          goodsReceiptLineId: grn.lines[0].id,
          manufacturerSerialNumber: testSerialNum,
          internalAssetCode: 'AST-2026-999901',
          status: ProductSerialStatus.IN_STOCK,
        },
      });
    });
    testSerialId = serial.id;
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('should configure inventory locations across receiving, quarantine and damaged goods zones', async () => {
    const bay = await inventoryService.createLocation(tenantOrg.organizationId, {
      code: 'BAY-REC-01',
      name: 'Receiving Dock 1',
      type: InventoryLocationType.RECEIVING_BAY,
      isDefaultReceiving: true,
    });
    expect(bay.code).toBe('BAY-REC-01');

    const quarantine = await inventoryService.createLocation(tenantOrg.organizationId, {
      code: 'ZONE-QUARANTINE',
      name: 'QA Quarantine Staging',
      type: InventoryLocationType.QUARANTINE,
    });
    expect(quarantine.type).toBe(InventoryLocationType.QUARANTINE);

    const locations = await inventoryService.listLocations(tenantOrg.organizationId);
    expect(locations.length).toBe(2);
  });

  it('should create a Supplier Return for defective battery unit with debit note details', async () => {
    const ret = await inventoryService.createSupplierReturn(
      tenantOrg.organizationId,
      {
        supplierId: testSupplierId,
        returnType: SupplierReturnType.DEFECTIVE_REJECTION,
        reason: 'Internal cell balancing BMS fault detected during QA test bench',
        debitNoteNumber: 'DN-2026-0041',
        transporterDetails: {
          transporter: 'TCI Freight',
          vehicleNo: 'MH-14-GH-1234',
          driverContact: '+919876500000',
        },
        lines: [
          {
            productVariantId: testVariantId,
            returnedQuantity: 1,
            unitPrice: 95000,
            serialNumbers: [testSerialNum],
            reason: 'BMS communication fault',
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(ret).toBeDefined();
    expect(ret.returnNumber).toMatch(/^RET-\d{4}-\d{6}$/);
    expect(ret.status).toBe(SupplierReturnStatus.SUBMITTED);
    expect(Number(ret.totalReturnAmount)).toBe(95000);
    expect(ret.debitNoteNumber).toBe('DN-2026-0041');

    // Verify serial status transitioned to RETURNED_TO_VENDOR
    const serial = await inventoryService.getSerialDetails(
      tenantOrg.organizationId,
      testSerialId,
    );
    expect(serial.status).toBe(ProductSerialStatus.RETURNED_TO_VENDOR);
  });

  it('should track inventory ledger movements for returned goods', async () => {
    const movements = await inventoryService.listMovements(tenantOrg.organizationId, {
      productVariantId: testVariantId,
      movementType: MovementType.SUPPLIER_RETURN,
    });

    expect(movements.length).toBe(1);
    expect(movements[0].movementNumber).toMatch(/^MOV-\d{4}-\d{6}$/);
    expect(movements[0].movementType).toBe(MovementType.SUPPLIER_RETURN);
    expect(Number(movements[0].quantity)).toBe(1);
    expect(Number(movements[0].unitCost)).toBe(95000);
  });
});
