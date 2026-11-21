import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { StockService } from '../../apps/api/src/modules/inventory/stock.service';
import { DispatchService } from '../../apps/api/src/modules/inventory/dispatch.service';
import { DispatchOrderStatus, ProofOfDeliveryStatus, MovementType } from '@solaros/types';

describe('Phase 4 — Dispatch Management, Delivery Challan & Proof of Delivery (POD)', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let stockService: StockService;
  let dispatchService: DispatchService;

  const tenantOrg = {
    organizationId: '76767676-7676-4676-8676-767676767676',
    organizationSlug: 'phase4-dispatch-pod-org',
    organizationName: 'Phase 4 Dispatch POD Org',
    userId: '96767676-7676-4676-8676-767676767676',
  };

  let testWarehouseId: string;
  let testLocationId: string;
  let testCustomerId: string;
  let testVariantId: string;
  const serialNumber = 'MOD-SN-DISP-001';

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
    dispatchService = new DispatchService(prisma, numberingService, stockService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous runs
      await tx.$executeRawUnsafe(`DELETE FROM "proofs_of_delivery" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "delivery_challans" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "dispatch_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "dispatch_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'dispatch-controller@solaros.io',
          firstName: 'Dispatch',
          lastName: 'Controller',
        },
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-APEX-SOLAR',
          name: 'Apex Solar Energy Ltd',
          email: 'purchase@apexsolar.in',
          phone: '+91 99887 76655',
        },
      });
      testCustomerId = customer.id;

      const wh = await tx.warehouse.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'WH-DELHI',
          name: 'Delhi Central Hub',
          address: 'New Delhi, Delhi',
        },
      });
      testWarehouseId = wh.id;

      const loc = await tx.inventoryLocation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          warehouseId: wh.id,
          code: 'WH-DELHI-BAY-1',
          name: 'Dispatch Staging Bay',
          type: 'STORAGE',
        },
      });
      testLocationId = loc.id;

      const cat = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-DISP-MOD',
          name: 'Solar Panels',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFR-TATA-DISP',
          name: 'Tata Power Solar',
        },
      });

      const prod = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: cat.id,
          manufacturerId: mfr.id,
          code: 'PROD-TATA-550',
          name: 'Tata 550W Mono PERC',
          modelNumber: 'TP-550-HC',
          type: 'MODULE',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prod.id,
          sku: 'VAR-TATA-550W-MONO',
          name: 'Tata 550W Mono PERC Half Cut',
          costPrice: 10200,
          sellingPrice: 12900,
        },
      });
      testVariantId = variant.id;

      // Seed 10 panels
      await tx.inventoryReceiptMovement.create({
        data: {
          organizationId: tenantOrg.organizationId,
          movementNumber: 'MOV-DEL-INIT-001',
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: variant.id,
          toLocationId: loc.id,
          quantity: 10,
          unitCost: 10200,
          totalValue: 102000,
          referenceType: 'PO_DISP_INIT',
          referenceId: 'PO-DELHI-01',
        },
      });

      await tx.productSerial.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productVariantId: variant.id,
          manufacturerSerialNumber: serialNumber,
          internalAssetCode: 'AST-' + serialNumber,
          storageLocationId: loc.id,
          warehouseId: wh.id,
          status: 'IN_STOCK',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "proofs_of_delivery" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "delivery_challans" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "dispatch_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "dispatch_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should create dispatch order and approve it', async () => {
    const dispatchOrder = await dispatchService.createDispatchOrder(
      tenantOrg.organizationId,
      {
        warehouseId: testWarehouseId,
        customerId: testCustomerId,
        deliveryAddress: 'Sector 62, Noida, Uttar Pradesh',
        transporterName: 'Gati KWE Logistics',
        vehicleNumber: 'DL-01-AB-1234',
        driverName: 'Ramesh Singh',
        driverPhone: '+91 98111 22233',
        lines: [
          {
            productVariantId: testVariantId,
            dispatchedQuantity: 5,
            serialNumbers: [serialNumber],
          },
        ],
        shippingNotes: 'Fragile solar glass - handle with care',
      },
      tenantOrg.userId,
    );

    expect(dispatchOrder).toBeDefined();
    expect(dispatchOrder.dispatchNumber).toMatch(/^DSP-/);
    expect(dispatchOrder.status).toBe(DispatchOrderStatus.READY_FOR_DISPATCH);

    const approved = await dispatchService.approveDispatchOrder(
      tenantOrg.organizationId,
      dispatchOrder.id,
      tenantOrg.userId,
    );
    expect(approved.status).toBe(DispatchOrderStatus.APPROVED);
  });

  it('should post dispatch order, deduct stock ledger transactionally, and prevent double posting', async () => {
    const orders = await dispatchService.listDispatchOrders(tenantOrg.organizationId);
    const approvedOrder = orders.find((o) => o.status === DispatchOrderStatus.APPROVED);
    expect(approvedOrder).toBeDefined();

    // Initial On Hand is 10
    const stockBefore = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stockBefore.stock.onHandStock).toBe(10);

    // Post dispatch order
    const posted = await dispatchService.postDispatchOrder(
      tenantOrg.organizationId,
      approvedOrder!.id,
      tenantOrg.userId,
    );

    expect(posted.status).toBe(DispatchOrderStatus.DISPATCHED);

    // Stock On Hand should now be 5
    const stockAfter = await stockService.getProductStockDetails(
      tenantOrg.organizationId,
      testVariantId,
    );
    expect(stockAfter.stock.onHandStock).toBe(5);

    // Verify serial number marked as DISPATCHED
    const serial = await prisma.asSuperAdmin(async (tx) =>
      tx.productSerial.findFirst({
        where: {
          organizationId: tenantOrg.organizationId,
          manufacturerSerialNumber: serialNumber,
        },
      }),
    );
    expect(serial?.status).toBe('DISPATCHED');

    // Attempting duplicate post should be rejected with ConflictException
    await expect(
      dispatchService.postDispatchOrder(
        tenantOrg.organizationId,
        approvedOrder!.id,
        tenantOrg.userId,
      ),
    ).rejects.toThrow();
  });

  it('should generate official delivery challan with sequential numbering', async () => {
    const orders = await dispatchService.listDispatchOrders(tenantOrg.organizationId);
    const dispatchedOrder = orders.find((o) => o.status === DispatchOrderStatus.DISPATCHED);

    const challan = await dispatchService.generateDeliveryChallan(
      tenantOrg.organizationId,
      {
        dispatchOrderId: dispatchedOrder!.id,
        deliverySite: 'Sector 62, Noida, Uttar Pradesh',
        receiverName: 'Apex Site Engineer Mr. Sharma',
        receiverPhone: '+91 99887 76655',
      },
      tenantOrg.userId,
    );

    expect(challan).toBeDefined();
    expect(challan.challanNumber).toMatch(/^DCH-/);
    expect(challan.dispatchOrderId).toBe(dispatchedOrder!.id);
    expect(challan.receiverName).toBe('Apex Site Engineer Mr. Sharma');
  });

  it('should confirm Proof of Delivery (POD) and finalize dispatch order status to DELIVERED', async () => {
    const orders = await dispatchService.listDispatchOrders(tenantOrg.organizationId);
    const dispatchedOrder = orders.find((o) => o.status === DispatchOrderStatus.DISPATCHED);

    const pod = await dispatchService.confirmDelivery(
      tenantOrg.organizationId,
      dispatchedOrder!.id,
      {
        receiverName: 'Mr. Sharma (Site Engineer)',
        receiverPhone: '+91 99887 76655',
        isDamaged: false,
        deliveryRemarks: 'All 5 solar panels received in sound condition. Packaging intact.',
      },
      tenantOrg.userId,
    );

    expect(pod).toBeDefined();
    expect(pod.status).toBe(ProofOfDeliveryStatus.DELIVERY_CONFIRMED);
    expect(pod.receiverName).toBe('Mr. Sharma (Site Engineer)');

    // Verify dispatch order status changed to DELIVERED
    const updatedOrder = await dispatchService.getDispatchOrder(
      tenantOrg.organizationId,
      dispatchedOrder!.id,
    );
    expect(updatedOrder.status).toBe(DispatchOrderStatus.DELIVERED);
  });
});
