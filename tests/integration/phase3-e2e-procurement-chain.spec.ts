import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { SuppliersService } from '../../apps/api/src/modules/suppliers/suppliers.service';
import { ProcurementService } from '../../apps/api/src/modules/procurement/procurement.service';
import { InventoryService } from '../../apps/api/src/modules/inventory/inventory.service';
import {
  SupplierCategory,
  SupplierType,
  RequisitionStatus,
  RFQStatus,
  PurchaseOrderStatus,
  POApprovalStatus,
  GRNStatus,
  InspectionOutcome,
  LineInspectionStatus,
  ProductSerialStatus,
  SupplierReturnType,
  SupplierReturnStatus,
  MovementType,
} from '@solaros/types';

describe('Phase 3 — Master E2E Complete Procurement Lifecycle', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let suppliersService: SuppliersService;
  let procurementService: ProcurementService;
  let inventoryService: InventoryService;

  const tenantOrg = {
    organizationId: '77777777-7777-4777-8777-777777777777',
    organizationSlug: 'phase3-e2e-master-org',
    organizationName: 'SolarOS E2E Master EPC Corp',
    userId: '88888888-8888-4888-8888-888888888888',
  };

  let supplierAId: string;
  let supplierBId: string;
  let panelVariantId: string;
  let inverterVariantId: string;
  let projectInitiationId: string;
  let projectBomId: string;

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
    suppliersService = new SuppliersService(prisma, numberingService);
    procurementService = new ProcurementService(prisma, numberingService);
    inventoryService = new InventoryService(prisma, numberingService);

    // Clean all records for isolation
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quality_inspections" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_delivery_schedules" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfqs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisition_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisitions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirement_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_price_history" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_product_mappings" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bom_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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
          email: 'epc-head@solaros.io',
          firstName: 'EPC',
          lastName: 'Director',
        },
      });

      const catPanel = await tx.productCategory.create({
        data: { organizationId: tenantOrg.organizationId, code: 'CAT-E2E-MOD', name: 'PV Modules' },
      });
      const catInv = await tx.productCategory.create({
        data: { organizationId: tenantOrg.organizationId, code: 'CAT-E2E-INV', name: 'Inverters' },
      });

      const mfrTata = await tx.manufacturer.create({
        data: { organizationId: tenantOrg.organizationId, code: 'MFR-E2E-TATA', name: 'Tata Power Solar' },
      });
      const mfrSungrow = await tx.manufacturer.create({
        data: { organizationId: tenantOrg.organizationId, code: 'MFR-E2E-SUNGROW', name: 'Sungrow Power' },
      });

      const prodPanel = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: catPanel.id,
          manufacturerId: mfrTata.id,
          code: 'PROD-TATA-545',
          name: 'Tata Power 545W Mono PERC',
          modelNumber: 'TP-545',
          type: 'PANEL',
        },
      });
      const varPanel = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prodPanel.id,
          sku: 'VAR-TATA-545W',
          name: 'Tata Power 545W Module',
          costPrice: 11500,
          sellingPrice: 14000,
        },
      });
      panelVariantId = varPanel.id;

      const prodInv = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: catInv.id,
          manufacturerId: mfrSungrow.id,
          code: 'PROD-SG-50KW',
          name: 'Sungrow 50kW On-Grid Inverter',
          modelNumber: 'SG50CX',
          type: 'INVERTER',
        },
      });
      const varInv = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: prodInv.id,
          sku: 'VAR-SG-50KW',
          name: 'Sungrow 50kW 3-Phase Inverter',
          costPrice: 165000,
          sellingPrice: 200000,
        },
      });
      inverterVariantId = varInv.id;

      // Create Customer, Site, Survey, Design, BOM
      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-E2E-001',
          name: 'Mega Agro Industries Ltd',
          customerType: 'COMMERCIAL',
          phone: '+919822001122',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Plant 1 Agro Processing Rooftop',
          addressLine1: 'Plot 44 Industrial Area',
          postalCode: '400001',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-E2E-001',
          status: 'COMPLETED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'ENG-E2E-001',
          title: '50kW Commercial Rooftop System',
          targetCapacityKw: 50.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-E2E-001',
          revisionNumber: 1,
          totalMaterialCost: 1180000,
          status: 'APPROVED',
          items: {
            create: [
              {
                organization: { connect: { id: tenantOrg.organizationId } },
                category: 'SOLAR_GENERATION',
                variant: { connect: { id: panelVariantId } },
                itemCode: 'PANEL-545W',
                description: 'Tata Power 545W Mono PERC Modules',
                quantity: 92,
                effectiveQuantity: 92,
                unitCost: 11500,
                totalCost: 1058000,
              },
              {
                organization: { connect: { id: tenantOrg.organizationId } },
                category: 'POWER_CONVERSION',
                variant: { connect: { id: inverterVariantId } },
                itemCode: 'INV-50KW',
                description: 'Sungrow 50kW On-Grid Inverter',
                quantity: 1,
                effectiveQuantity: 1,
                unitCost: 122000,
                totalCost: 122000,
              },
            ],
          },
        },
      });
      projectBomId = bom.id;

      const quote = await tx.quotation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          quotationNumber: 'QTN-E2E-001',
          totalAmount: 1400000,
          status: 'APPROVED',
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: '50kW Solar EPC Installation',
          paymentTerms: { type: 'MILESTONE' },
        },
      });

      const salesOrder = await tx.salesOrder.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          quotation: { connect: { id: quote.id } },
          customer: { connect: { id: customer.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          orderNumber: 'SO-E2E-001',
          totalAmount: 1400000,
          advanceRequired: 280000,
          advanceReceived: 280000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          salesOrder: { connect: { id: salesOrder.id } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          initiatedBy: { connect: { id: tenantOrg.userId } },
          projectCode: 'PRJ-E2E-2026-001',
          projectName: 'Mega Agro 50kW Solar Rooftop Installation',
          systemCapacityKw: 50.0,
          systemType: 'ON_GRID',
          handoverStatus: 'READY_FOR_PROCUREMENT',
          bomSnapshot: {},
          designSnapshot: {},
        },
      });
      projectInitiationId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_return_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_returns" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_receipt_movements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_serials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quality_inspections" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "goods_receipt_notes" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_delivery_schedules" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_order_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotation_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfq_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "rfqs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisition_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "purchase_requisitions" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirement_lines" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "material_requirements" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_price_history" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_product_mappings" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bom_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
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

  it('Stage 1 — Should onboard qualified suppliers and establish vendor product catalogue mappings', async () => {
    // Supplier A: Tata Direct
    const supA = await suppliersService.createSupplier(tenantOrg.organizationId, {
      legalName: 'Tata Power Solar Systems Ltd',
      tradeName: 'Tata Solar Direct',
      category: SupplierCategory.MANUFACTURER,
      supplierType: SupplierType.SOLAR_PANELS,
      gstin: '27AAACT0001A1Z5',
      pan: 'AAACT0001A',
      contacts: [
        { name: 'Ramesh Sharma', email: 'ramesh.s@tatasolar.com', phone: '+919820011223', isPrimary: true },
      ],
    });
    supplierAId = supA.id;

    // Supplier B: Renown Solar Distributor
    const supB = await suppliersService.createSupplier(tenantOrg.organizationId, {
      legalName: 'Renown Green Energy Distributors LLP',
      category: SupplierCategory.DISTRIBUTOR,
      supplierType: SupplierType.MULTI_CATEGORY,
      gstin: '27AAAFR9999M1Z8',
      pan: 'AAAFR9999M',
    });
    supplierBId = supB.id;

    // Map Panel to Supplier A with standard price
    await suppliersService.createProductMapping(tenantOrg.organizationId, supplierAId, {
      productVariantId: panelVariantId,
      supplierPartCode: 'TATA-545-MONO',
      unitPrice: 11400,
      minimumOrderQuantity: 50,
      leadTimeDays: 14,
      isPreferred: true,
    });

    expect(supplierAId).toBeDefined();
    expect(supplierBId).toBeDefined();
  });

  it('Stage 2 — Should run MRP on Approved Project BOM and generate Purchase Requisition', async () => {
    // 1. Generate Material Requirements from BOM
    const mrp = await procurementService.generateMRPFromProject(
      tenantOrg.organizationId,
      {
        projectInitiationId,
        plannedDate: new Date(),
      },
      tenantOrg.userId,
    );

    expect(mrp).toBeDefined();
    expect(mrp.requirementNumber).toMatch(/^MRP-\d{4}-\d{6}$/);
    expect(mrp.lines.length).toBe(2);

    // 2. Convert MRP to Purchase Requisition
    const pr = await procurementService.convertMRPToRequisition(
      tenantOrg.organizationId,
      mrp.id,
      tenantOrg.userId,
    );

    expect(pr).toBeDefined();
    expect(pr.requisitionNumber).toMatch(/^PR-\d{4}-\d{6}$/);
    expect(pr.lines.length).toBe(2);

    // 3. Submit PR
    await procurementService.submitRequisition(tenantOrg.organizationId, pr.id);

    // 4. Approve PR
    const approvedPr = await procurementService.approveRequisition(
      tenantOrg.organizationId,
      pr.id,
      {
        notes: 'Approved for Mega Agro 50kW project execution',
      },
      tenantOrg.userId,
    );
    expect(approvedPr.status).toBe(RequisitionStatus.APPROVED);
  });

  it('Stage 3 — Should broadcast RFQ to suppliers, record competitive quotes, and award to best bidder', async () => {
    // 1. Create RFQ for PV Modules
    const rfq = await procurementService.createRFQ(
      tenantOrg.organizationId,
      {
        title: 'RFQ for 92 Nos 545W PV Modules - Mega Agro 50kW',
        dueDate: new Date(Date.now() + 3 * 86400000),
        supplierIds: [supplierAId, supplierBId],
        lines: [
          {
            productVariantId: panelVariantId,
            targetQuantity: 92,
            targetUnitPrice: 11500,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(rfq.rfqNumber).toMatch(/^RFQ-\d{4}-\d{6}$/);

    // 2. Record quote from Supplier A (₹11,350)
    const quoteA = await procurementService.submitSupplierQuotation(
      tenantOrg.organizationId,
      {
        rfqId: rfq.id,
        supplierId: supplierAId,
        supplierQuoteReference: 'TP-QUOTE-9912',
        validUntilDate: new Date(Date.now() + 15 * 86400000),
        deliveryLeadTimeDays: 10,
        paymentTerms: 'NET_30',
        lines: [
          {
            productVariantId: panelVariantId,
            quotedQuantity: 92,
            unitPrice: 11350,
            taxRatePercent: 12,
          },
        ],
      },
    );

    // 3. Record quote from Supplier B (₹11,600)
    await procurementService.submitSupplierQuotation(
      tenantOrg.organizationId,
      {
        rfqId: rfq.id,
        supplierId: supplierBId,
        supplierQuoteReference: 'RENOWN-QUOTE-441',
        validUntilDate: new Date(Date.now() + 15 * 86400000),
        deliveryLeadTimeDays: 7,
        paymentTerms: 'ADVANCE_100',
        lines: [
          {
            productVariantId: panelVariantId,
            quotedQuantity: 92,
            unitPrice: 11600,
            taxRatePercent: 12,
          },
        ],
      },
    );

    // 4. Compare Quotes Matrix
    const comparison = await procurementService.compareQuotesForRFQ(tenantOrg.organizationId, rfq.id);
    expect(comparison.comparison.length).toBe(2);
    // Supplier A should be lower total (rank 1)
    expect(comparison.comparison[0].supplierId).toBe(supplierAId);
    expect(comparison.comparison[0].rank).toBe(1);

    // 5. Award RFQ to Supplier A
    const awardResult = await procurementService.awardRFQ(
      tenantOrg.organizationId,
      rfq.id,
      {
        winningSupplierId: supplierAId,
        winningQuotationId: quoteA.id,
        awardJustification: 'Lowest unit cost (₹11,350 vs ₹11,600) with direct OEM warranty backing',
      },
      tenantOrg.userId,
    );
    expect(awardResult.awarded).toBe(true);

    const updatedRfq = await procurementService.getRFQ(tenantOrg.organizationId, rfq.id);
    expect(updatedRfq.status).toBe(RFQStatus.AWARDED);
  });

  it('Stage 4 — Should create, approve PO, schedule deliveries, receive goods, inspect QA, and serialize', async () => {
    // 1. Create Purchase Order for Supplier A
    const po = await procurementService.createPurchaseOrder(
      tenantOrg.organizationId,
      {
        supplierId: supplierAId,
        projectInitiationId,
        expectedDeliveryDate: new Date(Date.now() + 7 * 86400000),
        lines: [
          {
            productVariantId: panelVariantId,
            itemDescription: 'Tata Power 545W Mono PERC Modules',
            orderedQuantity: 92,
            unitPrice: 11350,
            taxRatePercent: 12,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(po.poNumber).toMatch(/^PO-\d{4}-\d{6}$/);

    // 2. Approve PO
    const approvedPo = await procurementService.approvePurchaseOrder(
      tenantOrg.organizationId,
      po.id,
      {
        decision: 'APPROVE',
        notes: 'PO Approved for Solar Project Mega Agro',
      },
      tenantOrg.userId,
    );
    expect(approvedPo.status).toBe(PurchaseOrderStatus.APPROVED);
    expect(approvedPo.approvalStatus).toBe(POApprovalStatus.APPROVED);

    // 3. Create Delivery Schedule
    const sched = await procurementService.createDeliverySchedule(
      tenantOrg.organizationId,
      po.id,
      {
        purchaseOrderLineId: po.lines[0].id,
        scheduledQuantity: 92,
        scheduledDate: new Date(Date.now() + 5 * 86400000),
      },
    );
    expect(Number(sched.scheduledQuantity)).toBe(92);

    // 4. Gate Inward Goods Receipt Note (GRN)
    const grn = await inventoryService.createGoodsReceiptNote(
      tenantOrg.organizationId,
      {
        purchaseOrderId: po.id,
        supplierId: supplierAId,
        supplierInvoiceNumber: 'INV-TATA-2026-0881',
        supplierChallanNumber: 'DC-TATA-4401',
        gatePassNumber: 'GP-2026-901',
        vehicleNumber: 'MH-04-AB-1212',
        transporterName: 'TCI Supply Chain',
        lines: [
          {
            purchaseOrderLineId: po.lines[0].id,
            productVariantId: panelVariantId,
            receivedQuantity: 92,
            acceptedQuantity: 90,
            rejectedQuantity: 2,
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(grn.grnNumber).toMatch(/^GRN-\d{4}-\d{6}$/);
    expect(grn.status).toBe(GRNStatus.INSPECTION_PENDING);

    // 5. Conduct Quality Inspection
    const inspection = await inventoryService.performQualityInspection(
      tenantOrg.organizationId,
      {
        goodsReceiptNoteId: grn.id,
        goodsReceiptLineId: grn.lines[0].id,
        productVariantId: panelVariantId,
        totalInspectedQuantity: 92,
        passedQuantity: 90,
        rejectedQuantity: 2,
        overallOutcome: InspectionOutcome.PASS,
        checklistResults: [
          { item: 'Visual Frame Inspection', result: 'PASS', criteria: '35mm standard' },
          { item: 'Glass Micro-crack Inspection', result: 'FAIL_2_UNITS', criteria: 'Zero cracks' },
        ],
        measurements: {
          sampleVocVolts: 49.8,
          sampleIscAmps: 13.9,
          measuredPmaxWatts: 545.2,
        },
        rejectionReasons: ['2 solar panels showed microcracks and frame denting'],
        actionRecommended: 'ACCEPT_PARTIAL' as any,
        inspectorNotes: '90 passed, 2 transit damaged',
      },
      tenantOrg.userId,
    );

    expect(inspection.inspectionNumber).toMatch(/^QIR-\d{4}-\d{6}$/);
    expect(inspection.overallOutcome).toBe(InspectionOutcome.PASS);

    // 6. Register Serials for accepted 90 panels
    const serials = await inventoryService.registerSerialNumbers(
      tenantOrg.organizationId,
      {
        goodsReceiptNoteId: grn.id,
        goodsReceiptLineId: grn.lines[0].id,
        inspectionId: inspection.id,
        productVariantId: panelVariantId,
        serials: Array.from({ length: 5 }, (_, i) => ({
          manufacturerSerialNumber: `TP545-2026-SN-${String(i + 1).padStart(4, '0')}`,
          batchNumber: 'BATCH-2026-Q4-01',
          electricalSpecs: { voc: 49.8, isc: 13.9, pmax: 545.2 },
          warrantyPeriodMonths: 144,
        })),
      },
      tenantOrg.userId,
    );

    expect(serials.length).toBe(5);
    expect(serials[0].status).toBe(ProductSerialStatus.IN_STOCK);

    // 7. Verify Inventory Movement Ledger
    const movements = await inventoryService.listMovements(tenantOrg.organizationId, {
      productVariantId: panelVariantId,
      movementType: MovementType.GRN_RECEIPT,
    });
    expect(movements.length).toBe(5);
    expect(Number(movements[0].quantity)).toBe(1);

    // 8. Process Supplier Return with Debit Note for 2 rejected units
    const ret = await inventoryService.createSupplierReturn(
      tenantOrg.organizationId,
      {
        supplierId: supplierAId,
        goodsReceiptNoteId: grn.id,
        returnType: SupplierReturnType.DAMAGED_IN_TRANSIT,
        reason: '2 units transit frame dent and cracked glass rejected during QIR inspection',
        debitNoteNumber: 'DN-2026-9001',
        lines: [
          {
            productVariantId: panelVariantId,
            returnedQuantity: 2,
            unitPrice: 11350,
            reason: 'Transit microcracks',
          },
        ],
      },
      tenantOrg.userId,
    );

    expect(ret.returnNumber).toMatch(/^RET-\d{4}-\d{6}$/);
    expect(ret.status).toBe(SupplierReturnStatus.SUBMITTED);
    expect(Number(ret.totalReturnAmount)).toBe(22700);
  });
});
