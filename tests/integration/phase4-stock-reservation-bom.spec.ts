import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { StockService } from '../../apps/api/src/modules/inventory/stock.service';
import { ReservationService } from '../../apps/api/src/modules/inventory/reservation.service';
import { MovementType, StockReservationStatus } from '@solaros/types';

describe('Phase 4 — Stock Visibility, Authoritative Ledger & BOM Reservations', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let stockService: StockService;
  let reservationService: ReservationService;

  const tenantOrg = {
    organizationId: '73737373-7373-4373-8373-737373737373',
    organizationSlug: 'phase4-stock-reservation-org',
    organizationName: 'Phase 4 Stock Reservation Org',
    userId: '93737373-7373-4373-8373-737373737373',
  };

  let testWarehouseId: string;
  let testLocationId: string;
  let testVariantId: string;

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

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous runs
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'inventory-planner@solaros.io',
          firstName: 'Inventory',
          lastName: 'Planner',
        },
      });

      const wh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-BLR-01',
          name: 'Bengaluru Distribution Center',
          address: 'Bengaluru, Karnataka',
          isActive: true,
        },
      });
      testWarehouseId = wh.id;

      const loc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: wh.id,
          code: 'WH-BLR-STORAGE-A',
          name: 'Storage Zone A',
          type: 'STORAGE',
        },
      });
      testLocationId = loc.id;

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-PANELS-RES',
          name: 'Solar PV Modules',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-WAAREE-RES',
          name: 'Waaree Energies',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-WAAREE-540',
          name: 'Waaree 540W Mono PERC',
          modelNumber: 'W-540-BIFACIAL',
          type: 'MODULE',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-WAAREE-540W-BIFACIAL',
          name: 'Waaree 540W Mono Bifacial Module',
          costPrice: 9800,
          sellingPrice: 12500,
        },
      });
      testVariantId = variant.id;

      // Seed authoritative inbound stock (100 units) via ledger
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-BLR-INIT-001',
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: variant.id,
          toLocationId: loc.id,
          quantity: 100,
          unitCost: 9800,
          totalValue: 980000,
          referenceType: 'INITIAL_STOCK',
          referenceId: 'PO-2026-INIT',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_reservations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('should accurately calculate Available Stock = On-Hand Stock - Active Reservations', async () => {
    const stockDetails = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );

    expect(stockDetails).toBeDefined();
    expect(stockDetails.stock.onHandStock).toBe(100);
    expect(stockDetails.stock.activeReserved).toBe(0);
    expect(stockDetails.stock.availableStock).toBe(100);
  });

  it('should create project stock reservation and atomically decrement available stock', async () => {
    const reservation = await reservationService.createReservation(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        lines: [
          {
            productVariantId: testVariantId,
            quantity: 35,
          },
        ],
        notes: 'Reservation for 25kW Rooftop Commercial Project',
      },
      tenantOrg.userId,
    );

    expect(reservation).toBeDefined();
    expect(reservation.reservationNumber).toMatch(/^RES-/);
    expect(reservation.status).toBe(StockReservationStatus.RESERVED);
    expect(Number(reservation.lines[0].quantityReserved)).toBe(35);
    expect(Number(reservation.lines[0].quantityOutstanding)).toBe(0);

    // Verify Available Stock reduced by exactly 35
    const stockDetails = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stockDetails.stock.onHandStock).toBe(100);
    expect(stockDetails.stock.activeReserved).toBe(35);
    expect(stockDetails.stock.availableStock).toBe(65);
  });

  it('should track shortage when requested reservation exceeds available stock', async () => {
    // Current available is 65. Requesting 80.
    const reservation = await reservationService.createReservation(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        lines: [
          {
            productVariantId: testVariantId,
            quantityRequested: 80,
          },
        ],
        notes: 'Over-allocation test to verify shortage tracking',
      },
      tenantOrg.userId,
    );

    expect(reservation).toBeDefined();
    expect(reservation.status).toBe(StockReservationStatus.PARTIALLY_RESERVED);
    expect(Number(reservation.lines[0].quantityReserved)).toBe(65);
    expect(Number(reservation.lines[0].quantityOutstanding)).toBe(15);

    // Available stock should now be 0
    const stockDetails = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stockDetails.stock.availableStock).toBe(0);
    expect(stockDetails.stock.activeReserved).toBe(100);
  });

  it('should restore available stock when reservation is released', async () => {
    const resResult = await reservationService.listReservations(tenantOrg.organizationId);
    const partialRes = resResult.items.find((r) => r.status === StockReservationStatus.PARTIALLY_RESERVED);
    expect(partialRes).toBeDefined();

    const released = await reservationService.releaseReservation(
      tenantOrg.organizationId,
      partialRes!.id,
      { reason: 'Customer deferred installation schedule' },
      tenantOrg.userId,
    );

    expect(released.status).toBe(StockReservationStatus.RELEASED);

    // Available stock should be restored by 65
    const stockDetails = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stockDetails.stock.activeReserved).toBe(35);
    expect(stockDetails.stock.availableStock).toBe(65);
  });
});
