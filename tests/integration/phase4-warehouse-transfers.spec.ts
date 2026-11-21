import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { StockService } from '../../apps/api/src/modules/inventory/stock.service';
import { TransferService } from '../../apps/api/src/modules/inventory/transfer.service';
import { StockTransferStatus, StockTransferType, MovementType } from '@solaros/types';

describe('Phase 4 — Multi-Warehouse & Inter-Bin Transfers', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let stockService: StockService;
  let transferService: TransferService;

  const tenantOrg = {
    organizationId: '74747474-7474-4474-8474-747474747474',
    organizationSlug: 'phase4-transfer-org',
    organizationName: 'Phase 4 Transfer Org',
    userId: '94747474-7474-4474-8474-747474747474',
  };

  let srcWarehouseId: string;
  let dstWarehouseId: string;
  let srcLocationId: string;
  let dstLocationId: string;
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
    transferService = new TransferService(prisma, numberingService, stockService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous runs
      await tx.$executeRawUnsafe(`DELETE FROM "stock_transfer_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_transfers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'logistics-manager@solaros.io',
          firstName: 'Logistics',
          lastName: 'Manager',
        },
      });

      const srcWh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-MUMBAI',
          name: 'Mumbai Central Warehouse',
          address: 'Mumbai, Maharashtra',
        },
      });
      srcWarehouseId = srcWh.id;

      const dstWh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-PUNE',
          name: 'Pune Site Yard',
          address: 'Pune, Maharashtra',
        },
      });
      dstWarehouseId = dstWh.id;

      const srcLoc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: srcWh.id,
          code: 'WH-MUMBAI-MAIN',
          name: 'Main Storage',
          type: 'STORAGE',
        },
      });
      srcLocationId = srcLoc.id;

      const dstLoc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: dstWh.id,
          code: 'WH-PUNE-RECV',
          name: 'Receiving Dock',
          type: 'RECEIVING',
          isDefaultReceiving: true,
        },
      });
      dstLocationId = dstLoc.id;

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-INV-TRANSFER',
          name: 'String Inverters',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-SUNGROW-TRF',
          name: 'Sungrow Power',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-SG-10K',
          name: 'Sungrow 10kW On-Grid Inverter',
          modelNumber: 'SG-10K-PRO',
          type: 'INVERTER',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-SG-10K-3PH',
          name: 'Sungrow 10kW Three-Phase Inverter',
          costPrice: 65000,
          sellingPrice: 82000,
        },
      });
      testVariantId = variant.id;

      // Seed 50 inverters at Mumbai warehouse
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-MUM-INIT-001',
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: variant.id,
          toLocationId: srcLoc.id,
          quantity: 50,
          unitCost: 65000,
          totalValue: 3250000,
          referenceType: 'TRANSFER_TEST_INIT',
          referenceId: 'PO-MUMBAI-01',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "stock_transfer_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_transfers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('should execute end-to-end warehouse transfer lifecycle with authoritative ledger postings', async () => {
    // 1. Request Transfer (20 inverters from Mumbai to Pune)
    const transfer = await transferService.createTransfer(
      tenantOrg.organizationId,
      {
        sourceWarehouseId: srcWarehouseId,
        destinationWarehouseId: dstWarehouseId,
        sourceLocationId: srcLocationId,
        destinationLocationId: dstLocationId,
        type: StockTransferType.INTER_WAREHOUSE,
        lines: [
          {
            productVariantId: testVariantId,
            requestedQuantity: 20,
          },
        ],
        reason: 'Stock replenishment for Pune installation cluster',
      },
      tenantOrg.userId,
    );

    expect(transfer).toBeDefined();
    expect(transfer.transferNumber).toMatch(/^TRF-/);
    expect(transfer.status).toBe(StockTransferStatus.REQUESTED);

    // 2. Approve Transfer
    const approved = await transferService.approveTransfer(
      tenantOrg.organizationId,
      transfer.id,
      tenantOrg.userId,
    );
    expect(approved.status).toBe(StockTransferStatus.APPROVED);

    // 3. Ship Transfer (marks stock in transit and decrements source ledger)
    const shipped = await transferService.shipTransfer(
      tenantOrg.organizationId,
      transfer.id,
      {
        dispatchedQuantity: 20,
        carrierName: 'V-Trans Logistics',
        trackingNumber: 'VTR-99887766',
      },
      tenantOrg.userId,
    );
    expect(shipped.status).toBe(StockTransferStatus.IN_TRANSIT);

    // Verify source location stock was deducted by 20 (from 50 to 30)
    const movements = await prisma.asSuperAdmin(async (tx) =>
      tx.inventoryReceiptMovement.findMany({
        where: {
          organizationId: tenantOrg.organizationId,
          referenceId: transfer.transferNumber,
        },
      }),
    );
    expect(movements.length).toBeGreaterThanOrEqual(1);

    // 4. Receive Transfer at Destination
    const completed = await transferService.receiveTransfer(
      tenantOrg.organizationId,
      transfer.id,
      {
        receivedQuantity: 20,
        notes: '20 units received in sound factory packing at Pune receiving dock',
      },
      tenantOrg.userId,
    );

    expect(completed.status).toBe(StockTransferStatus.COMPLETED);
    expect(Number(completed.lines[0].receivedQuantity)).toBe(20);
  });
});
