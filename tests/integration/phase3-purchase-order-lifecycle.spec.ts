import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import { PurchaseOrderStatus, POApprovalStatus, DeliveryScheduleStatus } from '@solaros/types';

describe('Phase 3 — Purchase Order Lifecycle, Versioning & Delivery Schedules', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let procurementService: ProcurementService;

  const tenantOrg = {
    organizationId: '63636363-6363-4363-8363-636363636363',
    organizationSlug: 'phase3-po-test-org',
    organizationName: 'Phase 3 PO Test Org',
    userId: '93636363-6363-4363-8363-636363636363',
  };

  let testSupplierId: string;
  let testVariantId: string;
  let testPoId: string;
  let testPoLineId: string;

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

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_delivery_schedules" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'po-tester@solaros.io',
          firstName: 'PO',
          lastName: 'Manager',
        },
      });

      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-CABLE-PO',
          name: 'Solar DC Cables PO',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-POLYCAB-PO',
          name: 'Polycab Wires Ltd',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: mfr.id,
          code: 'PROD-POLYCAB-4SQMM',
          name: 'Polycab 4 sq mm DC Solar Cable Red',
          modelNumber: 'SOLAR-DC-4R',
          type: 'CABLE',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-POLYCAB-4R-100M',
          name: 'Polycab 4 sq mm Solar Cable 100m Drum',
          costPrice: 4200,
          sellingPrice: 5500,
        },
      });
      testVariantId = variant.id;

      const supplier = await tx.supplier.create({
        data: {
          organizationId: tenantOrg.organizationId,
          supplierCode: 'SUP-POLYCAB-AUTH',
          legalName: 'Polycab Electrical Distributors Ltd',
          category: 'DISTRIBUTOR',
          supplierType: 'ELECTRICAL',
          gstin: '27AABCP1234D1Z2',
        },
      });
      testSupplierId = supplier.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_delivery_schedules" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('should generate a formal Purchase Order with line taxes and rounding', async () => {
    const po = await procurementService.createPurchaseOrder(
      tenantOrg.organizationId,
      {
        supplierId: testSupplierId,
        expectedDeliveryDate: new Date(Date.now() + 10 * 86400000),
        freightAmount: 1500,
        paymentTerms: 'NET_30',
        termsAndConditions: 'Material must be ISI / TUV certified with batch test reports.',
        lines: [
          {
            productVariantId: testVariantId,
            itemDescription: 'Polycab 4 sq mm DC Solar Cable Red 100m Drums',
            hsnCode: '8544',
            orderedQuantity: 10,
            unitPrice: 4200,
            discountPercent: 5, // 4200 * 0.95 = 3990
            taxRatePercent: 18, // 3990 * 18% = 718.2
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(po).toBeDefined();
    expect(po.poNumber).toMatch(/^PO-\d{4}-\d{6}$/);
    expect(po.version).toBe(1);
    expect(po.status).toBe(PurchaseOrderStatus.PENDING_APPROVAL);
    expect(po.approvalStatus).toBe(POApprovalStatus.PENDING);
    expect(po.lines.length).toBe(1);

    // Subtotal: 10 * 3990 = 39,900
    expect(Number(po.subtotalAmount)).toBe(39900);
    // Tax: 39,900 * 18% = 7,182
    expect(Number(po.taxAmount)).toBe(7182);
    // Total: 39,900 + 7,182 + 1,500 = 48,582
    expect(Number(po.totalAmount)).toBe(48582);

    testPoId = po.id;
    testPoLineId = po.lines[0].id;
  });

  it('should approve the purchase order through managerial authorization', async () => {
    const approved = await procurementService.approvePurchaseOrder(
      tenantOrg.organizationId,
      testPoId,
      {
        decision: 'APPROVE',
        notes: 'Price matches master supply agreement',
      },
      tenantOrg.userId,
    );

    expect(approved.status).toBe(PurchaseOrderStatus.APPROVED);
    expect(approved.approvalStatus).toBe(POApprovalStatus.APPROVED);
    expect(approved.approvedById).toBe(tenantOrg.userId);
  });

  it('should create phased delivery schedules for split shipment milestones', async () => {
    const schedule1 = await procurementService.createDeliverySchedule(
      tenantOrg.organizationId,
      testPoId,
      {
        purchaseOrderLineId: testPoLineId,
        scheduledQuantity: 5,
        scheduledDate: new Date(Date.now() + 4 * 86400000),
        courierTransporter: 'VRL Logistics',
        trackingReference: 'VRL-PUNE-8871',
        notes: 'Batch 1 of 2',
      },
    );

    const schedule2 = await procurementService.createDeliverySchedule(
      tenantOrg.organizationId,
      testPoId,
      {
        purchaseOrderLineId: testPoLineId,
        scheduledQuantity: 5,
        scheduledDate: new Date(Date.now() + 8 * 86400000),
        courierTransporter: 'VRL Logistics',
        trackingReference: 'VRL-PUNE-8872',
        notes: 'Batch 2 of 2',
      },
    );

    expect(schedule1.status).toBe(DeliveryScheduleStatus.PENDING);
    expect(Number(schedule1.scheduledQuantity)).toBe(5);
    expect(Number(schedule2.scheduledQuantity)).toBe(5);
  });

  it('should generate a concurrency-safe PO revision (Version 2) with change history', async () => {
    const revisedPo = await procurementService.createPORevision(
      tenantOrg.organizationId,
      testPoId,
      {
        versionComments: 'Increased order volume from 10 to 15 drums due to project scope expansion',
        lines: [
          {
            productVariantId: testVariantId,
            itemDescription: 'Polycab 4 sq mm DC Solar Cable Red 100m Drums',
            orderedQuantity: 15,
            unitPrice: 4100, // Volume discount
            discountPercent: 0,
            taxRatePercent: 18,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(revisedPo).toBeDefined();
    expect(revisedPo.version).toBe(2);
    expect(revisedPo.originalPoId).toBe(testPoId);
    expect(revisedPo.versionComments).toBe(
      'Increased order volume from 10 to 15 drums due to project scope expansion',
    );
    expect(Number(revisedPo.lines[0].orderedQuantity)).toBe(15);
  });

  it('should record supplier PO acknowledgment', async () => {
    const ack = await procurementService.acknowledgePO(tenantOrg.organizationId, testPoId);
    expect(ack.status).toBe(PurchaseOrderStatus.ACKNOWLEDGED);
  });
});
