import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import { RFQStatus, SupplierQuotationStatus } from '@solaros/types';

describe('Phase 3 — RFQ, Supplier Quotation Collection & Bid Evaluation', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let procurementService: ProcurementService;

  const tenantOrg = {
    organizationId: '62626262-6262-4262-8262-626262626262',
    organizationSlug: 'phase3-rfq-test-org',
    organizationName: 'Phase 3 RFQ Test Org',
    userId: '92626262-6262-4262-8262-626262626262',
  };

  let testSupplierAId: string;
  let testSupplierBId: string;
  let testVariantId: string;
  let testRfqId: string;
  let testQuoteAId: string;
  let testQuoteBId: string;

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
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfqs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'rfq-tester@solaros.io',
          firstName: 'RFQ',
          lastName: 'Buyer',
        },
      });

      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-INV-RFQ',
          name: 'Solar Inverters RFQ',
        },
      });

      const mfr = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-GROWATT-RFQ',
          name: 'Growatt New Energy',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: mfr.id,
          code: 'PROD-GROWATT-10KW',
          name: 'Growatt 10kW On-Grid Inverter',
          modelNumber: 'MIN-10000TL-X',
          type: 'INVERTER',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-GROWATT-10KW',
          name: 'Growatt 10kW On-Grid Inverter',
          costPrice: 45000,
          sellingPrice: 58000,
        },
      });
      testVariantId = variant.id;

      // Create 2 competing suppliers
      const supplierA = await tx.supplier.create({
        data: {
          organizationId: tenantOrg.organizationId,
          supplierCode: 'SUP-GROWATT-DIRECT',
          legalName: 'Growatt Distribution India Pvt Ltd',
          category: 'DISTRIBUTOR',
          supplierType: 'INVERTERS',
        },
      });
      testSupplierAId = supplierA.id;

      const supplierB = await tx.supplier.create({
        data: {
          organizationId: tenantOrg.organizationId,
          supplierCode: 'SUP-SOLAR-DEPOT',
          legalName: 'National Solar Equipment Depot LLP',
          category: 'WHOLESALER',
          supplierType: 'INVERTERS',
        },
      });
      testSupplierBId = supplierB.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfqs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('should create an RFQ inviting multiple suppliers with target quantities and due date', async () => {
    const rfq = await procurementService.createRFQ(
      tenantOrg.organizationId,
      {
        title: 'Procurement of 10kW String Inverters for Q4 Installations',
        dueDate: new Date(Date.now() + 7 * 86400000),
        supplierIds: [testSupplierAId, testSupplierBId],
        termsAndConditions: 'Standard warranty 5 years. Payment NET 30 from delivery.',
        lines: [
          {
            productVariantId: testVariantId,
            targetQuantity: 5,
            targetUnitPrice: 45000,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(rfq).toBeDefined();
    expect(rfq.rfqNumber).toMatch(/^RFQ-\d{4}-\d{6}$/);
    expect(rfq.status).toBe(RFQStatus.ISSUED);
    expect(rfq.suppliers.length).toBe(2);
    expect(rfq.lines.length).toBe(1);
    testRfqId = rfq.id;
  });

  it('should record quotations submitted from both competing suppliers', async () => {
    // Supplier A bids Rs 44,000 per unit, 5 days lead time
    const quoteA = await procurementService.submitSupplierQuotation(
      tenantOrg.organizationId,
      {
        rfqId: testRfqId,
        supplierId: testSupplierAId,
        supplierQuoteReference: 'GROWATT-QUOTE-991',
        validUntilDate: new Date(Date.now() + 15 * 86400000),
        deliveryLeadTimeDays: 5,
        paymentTerms: 'NET_30',
        lines: [
          {
            productVariantId: testVariantId,
            quotedQuantity: 5,
            unitPrice: 44000,
            taxRatePercent: 12,
          },
        ],
      },
    );
    expect(quoteA).toBeDefined();
    expect(Number(quoteA.subtotalAmount)).toBe(220000);
    testQuoteAId = quoteA.id;

    // Supplier B bids Rs 42,500 per unit, 10 days lead time
    const quoteB = await procurementService.submitSupplierQuotation(
      tenantOrg.organizationId,
      {
        rfqId: testRfqId,
        supplierId: testSupplierBId,
        supplierQuoteReference: 'SOLAR-DEPOT-Q-402',
        validUntilDate: new Date(Date.now() + 15 * 86400000),
        deliveryLeadTimeDays: 10,
        paymentTerms: 'NET_15',
        lines: [
          {
            productVariantId: testVariantId,
            quotedQuantity: 5,
            unitPrice: 42500,
            taxRatePercent: 12,
          },
        ],
      },
    );
    expect(quoteB).toBeDefined();
    expect(Number(quoteB.subtotalAmount)).toBe(212500);
    testQuoteBId = quoteB.id;
  });

  it('should compare quotations side-by-side and rank Supplier B as lowest bidder', async () => {
    const comparison = await procurementService.compareQuotesForRFQ(
      tenantOrg.organizationId,
      testRfqId,
    );

    expect(comparison).toBeDefined();
    expect(comparison.totalQuotes).toBe(2);
    expect(comparison.comparison.length).toBe(2);

    // Supplier B is lowest total amount (rank 1)
    expect(comparison.comparison[0].supplierId).toBe(testSupplierBId);
    expect(comparison.comparison[0].rank).toBe(1);
    expect(comparison.comparison[0].isLowestBid).toBe(true);

    // Supplier A is rank 2
    expect(comparison.comparison[1].supplierId).toBe(testSupplierAId);
    expect(comparison.comparison[1].rank).toBe(2);
  });

  it('should award RFQ to winning bidder and update status of quotes', async () => {
    const awardResult = await procurementService.awardRFQ(
      tenantOrg.organizationId,
      testRfqId,
      {
        winningSupplierId: testSupplierBId,
        winningQuotationId: testQuoteBId,
        awardJustification: 'Lowest evaluated commercial bid meeting all technical requirements',
      },
      tenantOrg.userId,
    );

    expect(awardResult.awarded).toBe(true);

    const rfq = await procurementService.getRFQ(tenantOrg.organizationId, testRfqId);
    expect(rfq.status).toBe(RFQStatus.AWARDED);
    expect(rfq.awardedSupplierId).toBe(testSupplierBId);

    const winningQuote = rfq.quotations.find((q) => q.id === testQuoteBId);
    expect(winningQuote?.isWinning).toBe(true);
    expect(winningQuote?.status).toBe(SupplierQuotationStatus.ACCEPTED);

    const losingQuote = rfq.quotations.find((q) => q.id === testQuoteAId);
    expect(losingQuote?.isWinning).toBe(false);
    expect(losingQuote?.status).toBe(SupplierQuotationStatus.REJECTED);
  });
});
