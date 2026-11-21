import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { StockService } from '../../apps/api/src/modules/inventory/stock.service';
import { ReservationService } from '../../apps/api/src/modules/inventory/reservation.service';
import { PickingPackingService } from '../../apps/api/src/modules/inventory/picking-packing.service';
import { PickingOrderStatus, PackingOrderStatus, MovementType } from '@solaros/types';

describe('Phase 4 — Material Picking, Barcode Serial Validation & Packing Workspace', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let stockService: StockService;
  let reservationService: ReservationService;
  let pickingPackingService: PickingPackingService;

  const tenantOrg = {
    organizationId: '75757575-7575-4575-8575-757575757575',
    organizationSlug: 'phase4-picking-packing-org',
    organizationName: 'Phase 4 Picking Packing Org',
    userId: '95757575-7575-4575-8575-757575757575',
  };

  let testWarehouseId: string;
  let testLocationId: string;
  let testVariantId: string;
  let reservationId: string;
  const serialNumbers = ['INV-SN-10001', 'INV-SN-10002'];

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
    stockService = new StockService(prisma, numberingService);
    reservationService = new ReservationService(prisma, numberingService, stockService);
    pickingPackingService = new PickingPackingService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous runs
      await tx.$executeRawUnsafe(`DELETE FROM "packing_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "packing_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "picking_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "picking_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'picker@solaros.io',
          firstName: 'Warehouse',
          lastName: 'Picker',
        },
      });

      const wh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-HYD',
          name: 'Hyderabad Central DC',
          address: 'Hyderabad, Telangana',
        },
      });
      testWarehouseId = wh.id;

      const loc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: wh.id,
          code: 'WH-HYD-BIN-01',
          name: 'Storage Bin 01',
          type: 'STORAGE',
        },
      });
      testLocationId = loc.id;

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-INV-PICK',
          name: 'Hybrid Solar Inverters',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-DEYE',
          name: 'Deye Solar',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-DEYE-12K',
          name: 'Deye 12kW Hybrid Inverter',
          modelNumber: 'DEYE-SUN-12K-SG04LP3',
          type: 'INVERTER',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-DEYE-12K-HYB',
          name: 'Deye 12kW Hybrid 3-Phase Inverter',
          costPrice: 110000,
          sellingPrice: 135000,
        },
      });
      testVariantId = variant.id;

      // Seed inbound stock (2 units)
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-HYD-INIT-001',
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: variant.id,
          toLocationId: loc.id,
          quantity: 2,
          unitCost: 110000,
          totalValue: 220000,
          referenceType: 'PO_PICK_TEST',
          referenceId: 'PO-HYD-01',
        },
      });

      // Seed serial numbers in stock
      for (const sn of serialNumbers) {
        await tx.productSerial.create({
          data: {
            organizationId: tenantOrg.organizationId,
            productVariantId: variant.id,
            manufacturerSerialNumber: sn,
            internalAssetCode: 'AST-' + sn,
            storageLocationId: loc.id,
            warehouseId: wh.id,
            status: 'IN_STOCK',
          },
        });
      }
    });

    // Create reservation for these 2 inverters
    const res = await reservationService.createReservation(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        lines: [{ productVariantId: testVariantId, quantity: 2 }],
        notes: 'Reservation for commercial dispatch',
      },
      tenantOrg.userId,
    );
    reservationId = res.id;
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "packing_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "packing_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "picking_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "picking_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should generate picking order from reservation and confirm scanned serial numbers', async () => {
    const pickingOrder = await pickingPackingService.createPickingOrder(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        reservationId: reservationId,
        notes: 'Picking order for solar EPC shipment',
      },
      tenantOrg.userId,
    );

    expect(pickingOrder).toBeDefined();
    expect(pickingOrder.pickingNumber).toMatch(/^PCK-/);
    expect(pickingOrder.status).toBe(PickingOrderStatus.READY);
    expect(pickingOrder.lines.length).toBe(1);
    expect(Number(pickingOrder.lines[0].requiredQuantity)).toBe(2);

    const pickLineId = pickingOrder.lines[0].id;

    // Confirm picking with scanned serial numbers
    const confirmedPick = await pickingPackingService.confirmPicking(
      tenantOrg.organizationId,
      pickingOrder.id,
      {
        lines: [
          {
            pickingOrderLineId: pickLineId,
            pickedQuantity: 2,
            scannedSerials: serialNumbers,
          },
        ],
        notes: 'Both units picked from Bin 01 and serials scanned',
      },
      tenantOrg.userId,
    );

    expect(confirmedPick.status).toBe(PickingOrderStatus.PICKED);
    expect(Number(confirmedPick.lines[0].pickedQuantity)).toBe(2);
    expect(confirmedPick.lines[0].status).toBe('PICKED');

    // Verify serial numbers updated to PICKED status
    const serials = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findMany({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: { in: serialNumbers },
        },
      }),
    );
    expect(serials.every((s) => s.status === 'PICKED')).toBe(true);
  });

  it('should enforce 8-point checklist verification during packing confirmation', async () => {
    const pickingOrders = await pickingPackingService.listPickingOrders(tenantOrg.organizationId);
    const pickedOrder = pickingOrders.find((p) => p.status === PickingOrderStatus.PICKED);

    // Create packing order from picked order
    const packingOrder = await pickingPackingService.createPackingOrder(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        pickingOrderId: pickedOrder!.id,
        packageCount: 1,
        totalWeightKg: 48.5,
        dimensions: '80x60x40 cm',
        notes: 'Heavy duty wooden pallet packing',
      },
      tenantOrg.userId,
    );

    expect(packingOrder).toBeDefined();
    expect(packingOrder.packingNumber).toMatch(/^PAK-/);
    expect(packingOrder.status).toBe(PackingOrderStatus.PACKING_IN_PROGRESS);

    // Attempting to confirm packing with unverified checklist should be rejected
    await expect(
      pickingPackingService.confirmPacking(
        tenantOrg.organizationId,
        packingOrder.id,
        {
          packageCount: 1,
          totalWeightKg: 48.5,
          checklistResults: [
            { item: 'Solar modules verified and inspected for micro-cracks', verified: true },
            { item: 'Inverter model, wattage, and accessories checked', verified: false }, // UNVERIFIED!
          ],
        },
        tenantOrg.userId,
      ),
    ).rejects.toThrow();

    // Confirm packing with all checklist items verified
    const allVerifiedChecklist = [
      { item: 'Solar modules verified and inspected for micro-cracks', verified: true },
      { item: 'Inverter model, wattage, and accessories checked', verified: true },
      { item: 'Battery units and BMS verified (if applicable)', verified: true },
      { item: 'BOS mounting rails, clamps, and fasteners counted', verified: true },
      { item: 'DC/AC surge protection devices and cables verified', verified: true },
      { item: 'Serial numbers scanned and verified', verified: true },
      { item: 'Delivery challan and safety manuals enclosed', verified: true },
      { item: 'Final box strapping and weather-proof packaging complete', verified: true },
    ];

    const confirmedPacking = await pickingPackingService.confirmPacking(
      tenantOrg.organizationId,
      packingOrder.id,
      {
        packageCount: 1,
        totalWeightKg: 48.5,
        dimensions: '80x60x40 cm',
        checklistResults: allVerifiedChecklist,
        notes: 'QA signed and certified package',
      },
      tenantOrg.userId,
    );

    expect(confirmedPacking.status).toBe(PackingOrderStatus.VERIFIED);
    expect(Number(confirmedPacking.totalWeightKg)).toBe(48.5);
    expect(confirmedPacking.verifiedById).toBe(tenantOrg.userId);
  });
});
