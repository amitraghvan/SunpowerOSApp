import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { StockService } from '../../apps/api/src/modules/inventory/stock.service';
import { AdjustmentService } from '../../apps/api/src/modules/inventory/adjustment.service';
import { ReturnsService } from '../../apps/api/src/modules/inventory/returns.service';
import {
  StockAdjustmentStatus,
  StockCountStatus,
  CustomerReturnStatus,
  RestockDecision,
  MovementType,
} from '@solaros/types';

describe('Phase 4 — Stock Adjustments, Segregation of Duties & Customer Returns (RMA)', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let stockService: StockService;
  let adjustmentService: AdjustmentService;
  let returnsService: ReturnsService;

  const tenantOrg = {
    organizationId: '77777777-7777-4777-8777-777777777777',
    organizationSlug: 'phase4-adj-returns-org',
    organizationName: 'Phase 4 Adjustments & Returns Org',
    clerkUserId: '97777777-7777-4777-8777-777777777771',
    supervisorUserId: '97777777-7777-4777-8777-777777777772',
  };

  let testWarehouseId: string;
  let testLocationId: string;
  let testCustomerId: string;
  let testVariantId: string;
  const returnedSerial = 'RET-INV-SN-999';

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
    adjustmentService = new AdjustmentService(prisma, numberingService, stockService);
    returnsService = new ReturnsService(prisma, numberingService, stockService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous runs
      await tx.$executeRawUnsafe(`DELETE FROM "customer_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_adjustments" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_count_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_counts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.clerkUserId}', '${tenantOrg.supervisorUserId}')`);
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
          id: tenantOrg.clerkUserId,
          email: 'clerk@solaros.io',
          firstName: 'Warehouse',
          lastName: 'Clerk',
        },
      });

      await tx.user.create({
        data: {
          id: tenantOrg.supervisorUserId,
          email: 'supervisor@solaros.io',
          firstName: 'Warehouse',
          lastName: 'Supervisor',
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-GREEN-ENERGY',
          name: 'Green Energy Rooftops Ltd',
          email: 'contact@greenenergy.in',
          phone: '+91 91234 56789',
        },
      });
      testCustomerId = customer.id;

      const wh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-KOLKATA',
          name: 'Kolkata Regional Depot',
          address: 'Kolkata, West Bengal',
        },
      });
      testWarehouseId = wh.id;

      const loc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: wh.id,
          code: 'WH-KOLKATA-RECV',
          name: 'Inward Receiving Bay',
          type: 'RECEIVING',
          isDefaultReceiving: true,
        },
      });
      testLocationId = loc.id;

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-ADJ-INV',
          name: 'Inverters',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-GROWATT-ADJ',
          name: 'Growatt Solar',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-GROWATT-MIN',
          name: 'Growatt 5kW Single Phase Inverter',
          modelNumber: 'MIN-5000TL-X',
          type: 'INVERTER',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-GW-5K-MIN',
          name: 'Growatt 5000TL-X 5kW Inverter',
          costPrice: 42000,
          sellingPrice: 53000,
        },
      });
      testVariantId = variant.id;

      // Seed initial stock of 20 units
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-KOL-INIT-001',
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: variant.id,
          toLocationId: loc.id,
          quantity: 20,
          unitCost: 42000,
          totalValue: 840000,
          referenceType: 'INIT_ADJ_TEST',
          referenceId: 'PO-KOL-01',
        },
      });

      // Seed a serial that was previously dispatched/shipped
      await tx.productSerial.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productVariantId: variant.id,
          manufacturerSerialNumber: returnedSerial,
          internalAssetCode: 'AST-' + returnedSerial,
          status: 'DISPATCHED',
          warehouseId: wh.id,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "customer_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_adjustments" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_count_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "stock_counts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.clerkUserId}', '${tenantOrg.supervisorUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should create stock count and compute variance upon count submission', async () => {
    const count = await adjustmentService.createStockCount(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        locationId: testLocationId,
        countType: 'PHYSICAL',
        notes: 'Monthly physical verification audit',
      },
      tenantOrg.clerkUserId,
    );

    expect(count).toBeDefined();
    expect(count.countNumber).toMatch(/^CNT-/);
    expect(count.status).toBe(StockCountStatus.PLANNED);

    // Submit count: physical count found 18 units (system has 20, variance = -2)
    const submitted = await adjustmentService.submitStockCount(
      tenantOrg.organizationId,
      count.id,
      {
        lines: [
          {
            productVariantId: testVariantId,
            countedQuantity: 18,
            notes: 'Physical count verified 2 units damaged/missing',
          },
        ],
      },
      tenantOrg.clerkUserId,
    );

    expect(submitted.status).toBe(StockCountStatus.SUBMITTED);
    expect(Number(submitted.lines[0].systemQuantity)).toBe(20);
    expect(Number(submitted.lines[0].countedQuantity)).toBe(18);
    expect(Number(submitted.lines[0].varianceQuantity)).toBe(-2);
  });

  it('should enforce segregation of duties: creator cannot approve their own stock adjustment', async () => {
    const adjustment = await adjustmentService.createStockAdjustment(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        locationId: testLocationId,
        productVariantId: testVariantId,
        adjustmentType: 'VARIANCE',
        quantity: -2,
        reason: 'Monthly physical count discrepancy',
      },
      tenantOrg.clerkUserId, // Created by Clerk
    );

    expect(adjustment).toBeDefined();
    expect(adjustment.adjustmentNumber).toMatch(/^ADJ-/);
    expect(adjustment.status).toBe(StockAdjustmentStatus.SUBMITTED);

    // Clerk attempts to self-approve -> MUST FAIL
    await expect(
      adjustmentService.approveStockAdjustment(
        tenantOrg.organizationId,
        adjustment.id,
        { notes: 'Self-approval attempt' },
        tenantOrg.clerkUserId,
      ),
    ).rejects.toThrow(/segregation of duties/i);

    // Supervisor approves -> MUST SUCCEED
    const approved = await adjustmentService.approveStockAdjustment(
      tenantOrg.organizationId,
      adjustment.id,
      { notes: 'Audit verified and approved by warehouse supervisor' },
      tenantOrg.supervisorUserId,
    );

    expect(approved.status).toBe(StockAdjustmentStatus.POSTED);

    // Verify stock ledger updated: On Hand should now be 18
    const stock = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stock.stock.onHandStock).toBe(18);
  });

  it('should process customer return (RMA) through receiving, inspection, and restock movement', async () => {
    // 1. Create Customer Return (RMA)
    const customerReturn = await returnsService.createCustomerReturn(
      tenantOrg.organizationId,
      {
        customerId: testCustomerId,
        warehouseId: testWarehouseId,
        returnReason: 'Customer site upgrade from 5kW to 10kW system',
        lines: [
          {
            productVariantId: testVariantId,
            returnedQuantity: 1,
            serialNumbers: [returnedSerial],
            notes: 'Unit returned in original packaging with all accessories',
          },
        ],
      },
      tenantOrg.clerkUserId,
    );

    expect(customerReturn).toBeDefined();
    expect(customerReturn.returnNumber).toMatch(/^CRN-/);
    expect(customerReturn.status).toBe(CustomerReturnStatus.REQUESTED);

    // 2. Mark Return Received at Warehouse
    const received = await returnsService.receiveCustomerReturn(
      tenantOrg.organizationId,
      customerReturn.id,
      tenantOrg.clerkUserId,
    );
    expect(received.status).toBe(CustomerReturnStatus.INSPECTION_PENDING);

    // 3. Inspect Return and Commit RESTOCK Decision
    const inspected = await returnsService.inspectCustomerReturn(
      tenantOrg.organizationId,
      customerReturn.id,
      {
        restockDecision: RestockDecision.RESTOCK,
        acceptedQuantity: 1,
        inspectionNotes: 'Bench tested OK. Firmware updated. Ready for resale.',
      },
      tenantOrg.supervisorUserId,
    );

    expect(inspected.status).toBe(CustomerReturnStatus.RESTOCKED);
    expect(inspected.restockDecision).toBe(RestockDecision.RESTOCK);

    // 4. Verify serial status updated back to IN_STOCK
    const serial = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findFirst({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: returnedSerial,
        },
      }),
    );
    expect(serial?.status).toBe('IN_STOCK');

    // 5. Verify stock ledger incremented: On Hand should now be 18 + 1 = 19
    const finalStock = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(finalStock.stock.onHandStock).toBe(19);
  });
});
