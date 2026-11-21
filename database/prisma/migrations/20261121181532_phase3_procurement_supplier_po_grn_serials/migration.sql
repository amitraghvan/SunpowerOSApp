-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "category" TEXT NOT NULL DEFAULT 'DISTRIBUTOR',
    "supplierType" TEXT NOT NULL DEFAULT 'SOLAR_PANELS',
    "gstin" TEXT,
    "pan" TEXT,
    "msmeNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "paymentTerms" TEXT NOT NULL DEFAULT 'NET_30',
    "creditPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "creditLimit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "rating" DECIMAL(3,2),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_contacts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_addresses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BILLING',
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_bank_accounts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "branchName" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'CURRENT',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER,
    "mimeType" TEXT,
    "expiryDate" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_product_mappings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "supplierPartCode" TEXT,
    "supplierPartName" TEXT,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "minimumOrderQuantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_product_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_price_history" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierProductMappingId" TEXT,
    "supplierId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "oldPrice" DECIMAL(12,2) NOT NULL,
    "newPrice" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requirements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requirementNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectInitiationId" TEXT,
    "salesOrderId" TEXT,
    "bomId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "estimatedTotalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "plannedDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_requirement_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "materialRequirementId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "category" TEXT,
    "requiredQuantity" DECIMAL(10,2) NOT NULL,
    "existingStockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "allocatedStockQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netProcurementQuantity" DECIMAL(10,2) NOT NULL,
    "estimatedUnitCost" DECIMAL(12,2) NOT NULL,
    "estimatedTotalCost" DECIMAL(12,2) NOT NULL,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'PCS',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_requirement_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisitions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "requisitionNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'PROJECT_SPECIFIC',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "requiredByDate" TIMESTAMP(3),
    "projectInitiationId" TEXT,
    "salesOrderId" TEXT,
    "materialRequirementId" TEXT,
    "requestedById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "totalEstimatedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisition_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "purchaseRequisitionId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "requestedQuantity" DECIMAL(10,2) NOT NULL,
    "approvedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "orderedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "estimatedUnitCost" DECIMAL(12,2) NOT NULL,
    "estimatedTotalCost" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requisition_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rfqNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requisitionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "awardedSupplierId" TEXT,
    "termsAndConditions" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "targetQuantity" DECIMAL(10,2) NOT NULL,
    "targetUnitPrice" DECIMAL(12,2),
    "targetDeliveryDate" TIMESTAMP(3),
    "specifications" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfq_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_suppliers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "invitationStatus" TEXT NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "rfqId" TEXT,
    "supplierId" TEXT NOT NULL,
    "supplierQuoteReference" TEXT,
    "quotationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntilDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotalAmount" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL,
    "freightCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "otherCharges" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "deliveryLeadTimeDays" INTEGER NOT NULL DEFAULT 7,
    "paymentTerms" TEXT NOT NULL DEFAULT 'NET_30',
    "warrantyTerms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "comparisonRank" INTEGER,
    "isWinning" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotation_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierQuotationId" TEXT NOT NULL,
    "rfqLineId" TEXT,
    "productVariantId" TEXT NOT NULL,
    "quotedQuantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "taxRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "deliveryLeadTimeDays" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_quotation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalPoId" TEXT,
    "requisitionId" TEXT,
    "quotationId" TEXT,
    "supplierId" TEXT NOT NULL,
    "projectInitiationId" TEXT,
    "salesOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "billingAddress" JSONB,
    "shippingAddress" JSONB,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotalAmount" DECIMAL(14,2) NOT NULL,
    "taxAmount" DECIMAL(14,2) NOT NULL,
    "freightAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "roundOff" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "paymentTerms" TEXT NOT NULL DEFAULT 'NET_30',
    "termsAndConditions" TEXT,
    "notes" TEXT,
    "versionComments" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "itemDescription" TEXT,
    "hsnCode" TEXT,
    "orderedQuantity" DECIMAL(10,2) NOT NULL,
    "receivedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "acceptedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rejectedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "taxRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "isFullyReceived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_delivery_schedules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "scheduledQuantity" DECIMAL(10,2) NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "receivedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "trackingReference" TEXT,
    "courierTransporter" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_delivery_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_locations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MAIN_WAREHOUSE',
    "address" TEXT,
    "isDefaultReceiving" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_notes" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grnNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierInvoiceNumber" TEXT,
    "supplierInvoiceDate" TIMESTAMP(3),
    "supplierChallanNumber" TEXT,
    "supplierChallanDate" TIMESTAMP(3),
    "gatePassNumber" TEXT,
    "vehicleNumber" TEXT,
    "transporterName" TEXT,
    "lrNumber" TEXT,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "receivedById" TEXT,
    "receivedLocationId" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipt_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT NOT NULL,
    "purchaseOrderLineId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "challanQuantity" DECIMAL(10,2) NOT NULL,
    "receivedQuantity" DECIMAL(10,2) NOT NULL,
    "acceptedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rejectedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "shortageQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "damagedQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "excessQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "inspectionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_inspections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "inspectionNumber" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT NOT NULL,
    "goodsReceiptLineId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "inspectionType" TEXT NOT NULL DEFAULT 'COMPLETE',
    "totalInspectedQuantity" DECIMAL(10,2) NOT NULL,
    "passedQuantity" DECIMAL(10,2) NOT NULL,
    "rejectedQuantity" DECIMAL(10,2) NOT NULL,
    "conditionalQuantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overallOutcome" TEXT NOT NULL DEFAULT 'PASS',
    "checklistResults" JSONB NOT NULL,
    "measurements" JSONB,
    "photoEvidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rejectionReasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actionRecommended" TEXT NOT NULL DEFAULT 'ACCEPT',
    "inspectedById" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_serials" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT NOT NULL,
    "goodsReceiptLineId" TEXT,
    "inspectionId" TEXT,
    "manufacturerSerialNumber" TEXT NOT NULL,
    "internalAssetCode" TEXT NOT NULL,
    "barcode" TEXT,
    "qrCode" TEXT,
    "batchNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "storageLocationId" TEXT,
    "electricalSpecs" JSONB,
    "warrantyPeriodMonths" INTEGER NOT NULL DEFAULT 60,
    "warrantyExpiresAt" TIMESTAMP(3),
    "commissionedAt" TIMESTAMP(3),
    "registeredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_receipt_movements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "movementNumber" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "totalValue" DECIMAL(14,2) NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_receipt_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_returns" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "returnNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "goodsReceiptNoteId" TEXT,
    "purchaseOrderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "returnType" TEXT NOT NULL DEFAULT 'DEFECTIVE_REJECTION',
    "totalReturnAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "dispatchDate" TIMESTAMP(3),
    "transporterDetails" JSONB,
    "debitNoteNumber" TEXT,
    "creditNoteNumber" TEXT,
    "reason" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_return_lines" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "supplierReturnId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "goodsReceiptLineId" TEXT,
    "returnedQuantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "serialNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_return_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suppliers_organizationId_idx" ON "suppliers"("organizationId");

-- CreateIndex
CREATE INDEX "suppliers_category_idx" ON "suppliers"("category");

-- CreateIndex
CREATE INDEX "suppliers_supplierType_idx" ON "suppliers"("supplierType");

-- CreateIndex
CREATE INDEX "suppliers_status_idx" ON "suppliers"("status");

-- CreateIndex
CREATE INDEX "suppliers_gstin_idx" ON "suppliers"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_organizationId_supplierCode_key" ON "suppliers"("organizationId", "supplierCode");

-- CreateIndex
CREATE INDEX "supplier_contacts_organizationId_idx" ON "supplier_contacts"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_contacts_supplierId_idx" ON "supplier_contacts"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_addresses_organizationId_idx" ON "supplier_addresses"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_addresses_supplierId_idx" ON "supplier_addresses"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_bank_accounts_organizationId_idx" ON "supplier_bank_accounts"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_bank_accounts_supplierId_idx" ON "supplier_bank_accounts"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_documents_organizationId_idx" ON "supplier_documents"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_documents_supplierId_idx" ON "supplier_documents"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_documents_documentType_idx" ON "supplier_documents"("documentType");

-- CreateIndex
CREATE INDEX "supplier_product_mappings_organizationId_idx" ON "supplier_product_mappings"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_product_mappings_supplierId_idx" ON "supplier_product_mappings"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_product_mappings_productVariantId_idx" ON "supplier_product_mappings"("productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_product_mappings_organizationId_supplierId_product_key" ON "supplier_product_mappings"("organizationId", "supplierId", "productVariantId");

-- CreateIndex
CREATE INDEX "supplier_price_history_organizationId_idx" ON "supplier_price_history"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_price_history_supplierId_idx" ON "supplier_price_history"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_price_history_productVariantId_idx" ON "supplier_price_history"("productVariantId");

-- CreateIndex
CREATE INDEX "material_requirements_organizationId_idx" ON "material_requirements"("organizationId");

-- CreateIndex
CREATE INDEX "material_requirements_projectInitiationId_idx" ON "material_requirements"("projectInitiationId");

-- CreateIndex
CREATE INDEX "material_requirements_salesOrderId_idx" ON "material_requirements"("salesOrderId");

-- CreateIndex
CREATE INDEX "material_requirements_status_idx" ON "material_requirements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "material_requirements_organizationId_requirementNumber_key" ON "material_requirements"("organizationId", "requirementNumber");

-- CreateIndex
CREATE INDEX "material_requirement_lines_organizationId_idx" ON "material_requirement_lines"("organizationId");

-- CreateIndex
CREATE INDEX "material_requirement_lines_materialRequirementId_idx" ON "material_requirement_lines"("materialRequirementId");

-- CreateIndex
CREATE INDEX "material_requirement_lines_productVariantId_idx" ON "material_requirement_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "purchase_requisitions_organizationId_idx" ON "purchase_requisitions"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_requisitions_projectInitiationId_idx" ON "purchase_requisitions"("projectInitiationId");

-- CreateIndex
CREATE INDEX "purchase_requisitions_salesOrderId_idx" ON "purchase_requisitions"("salesOrderId");

-- CreateIndex
CREATE INDEX "purchase_requisitions_status_idx" ON "purchase_requisitions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requisitions_organizationId_requisitionNumber_key" ON "purchase_requisitions"("organizationId", "requisitionNumber");

-- CreateIndex
CREATE INDEX "purchase_requisition_lines_organizationId_idx" ON "purchase_requisition_lines"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_requisition_lines_purchaseRequisitionId_idx" ON "purchase_requisition_lines"("purchaseRequisitionId");

-- CreateIndex
CREATE INDEX "purchase_requisition_lines_productVariantId_idx" ON "purchase_requisition_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "rfqs_organizationId_idx" ON "rfqs"("organizationId");

-- CreateIndex
CREATE INDEX "rfqs_requisitionId_idx" ON "rfqs"("requisitionId");

-- CreateIndex
CREATE INDEX "rfqs_status_idx" ON "rfqs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_organizationId_rfqNumber_key" ON "rfqs"("organizationId", "rfqNumber");

-- CreateIndex
CREATE INDEX "rfq_lines_organizationId_idx" ON "rfq_lines"("organizationId");

-- CreateIndex
CREATE INDEX "rfq_lines_rfqId_idx" ON "rfq_lines"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_lines_productVariantId_idx" ON "rfq_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "rfq_suppliers_organizationId_idx" ON "rfq_suppliers"("organizationId");

-- CreateIndex
CREATE INDEX "rfq_suppliers_rfqId_idx" ON "rfq_suppliers"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_suppliers_supplierId_idx" ON "rfq_suppliers"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "rfq_suppliers_organizationId_rfqId_supplierId_key" ON "rfq_suppliers"("organizationId", "rfqId", "supplierId");

-- CreateIndex
CREATE INDEX "supplier_quotations_organizationId_idx" ON "supplier_quotations"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_quotations_rfqId_idx" ON "supplier_quotations"("rfqId");

-- CreateIndex
CREATE INDEX "supplier_quotations_supplierId_idx" ON "supplier_quotations"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_quotations_status_idx" ON "supplier_quotations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_quotations_organizationId_quotationNumber_key" ON "supplier_quotations"("organizationId", "quotationNumber");

-- CreateIndex
CREATE INDEX "supplier_quotation_lines_organizationId_idx" ON "supplier_quotation_lines"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_quotation_lines_supplierQuotationId_idx" ON "supplier_quotation_lines"("supplierQuotationId");

-- CreateIndex
CREATE INDEX "supplier_quotation_lines_productVariantId_idx" ON "supplier_quotation_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "purchase_orders_organizationId_idx" ON "purchase_orders"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");

-- CreateIndex
CREATE INDEX "purchase_orders_projectInitiationId_idx" ON "purchase_orders"("projectInitiationId");

-- CreateIndex
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_organizationId_poNumber_version_key" ON "purchase_orders"("organizationId", "poNumber", "version");

-- CreateIndex
CREATE INDEX "purchase_order_lines_organizationId_idx" ON "purchase_order_lines"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_order_lines_purchaseOrderId_idx" ON "purchase_order_lines"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_order_lines_productVariantId_idx" ON "purchase_order_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "purchase_delivery_schedules_organizationId_idx" ON "purchase_delivery_schedules"("organizationId");

-- CreateIndex
CREATE INDEX "purchase_delivery_schedules_purchaseOrderId_idx" ON "purchase_delivery_schedules"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "purchase_delivery_schedules_purchaseOrderLineId_idx" ON "purchase_delivery_schedules"("purchaseOrderLineId");

-- CreateIndex
CREATE INDEX "inventory_locations_organizationId_idx" ON "inventory_locations"("organizationId");

-- CreateIndex
CREATE INDEX "inventory_locations_type_idx" ON "inventory_locations"("type");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_locations_organizationId_code_key" ON "inventory_locations"("organizationId", "code");

-- CreateIndex
CREATE INDEX "goods_receipt_notes_organizationId_idx" ON "goods_receipt_notes"("organizationId");

-- CreateIndex
CREATE INDEX "goods_receipt_notes_purchaseOrderId_idx" ON "goods_receipt_notes"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "goods_receipt_notes_supplierId_idx" ON "goods_receipt_notes"("supplierId");

-- CreateIndex
CREATE INDEX "goods_receipt_notes_status_idx" ON "goods_receipt_notes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipt_notes_organizationId_grnNumber_key" ON "goods_receipt_notes"("organizationId", "grnNumber");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_organizationId_idx" ON "goods_receipt_lines"("organizationId");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_goodsReceiptNoteId_idx" ON "goods_receipt_lines"("goodsReceiptNoteId");

-- CreateIndex
CREATE INDEX "goods_receipt_lines_productVariantId_idx" ON "goods_receipt_lines"("productVariantId");

-- CreateIndex
CREATE INDEX "quality_inspections_organizationId_idx" ON "quality_inspections"("organizationId");

-- CreateIndex
CREATE INDEX "quality_inspections_goodsReceiptNoteId_idx" ON "quality_inspections"("goodsReceiptNoteId");

-- CreateIndex
CREATE INDEX "quality_inspections_productVariantId_idx" ON "quality_inspections"("productVariantId");

-- CreateIndex
CREATE INDEX "quality_inspections_overallOutcome_idx" ON "quality_inspections"("overallOutcome");

-- CreateIndex
CREATE UNIQUE INDEX "quality_inspections_organizationId_inspectionNumber_key" ON "quality_inspections"("organizationId", "inspectionNumber");

-- CreateIndex
CREATE INDEX "product_serials_organizationId_idx" ON "product_serials"("organizationId");

-- CreateIndex
CREATE INDEX "product_serials_productVariantId_idx" ON "product_serials"("productVariantId");

-- CreateIndex
CREATE INDEX "product_serials_goodsReceiptNoteId_idx" ON "product_serials"("goodsReceiptNoteId");

-- CreateIndex
CREATE INDEX "product_serials_status_idx" ON "product_serials"("status");

-- CreateIndex
CREATE INDEX "product_serials_batchNumber_idx" ON "product_serials"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "product_serials_organizationId_manufacturerSerialNumber_pro_key" ON "product_serials"("organizationId", "manufacturerSerialNumber", "productVariantId");

-- CreateIndex
CREATE UNIQUE INDEX "product_serials_organizationId_internalAssetCode_key" ON "product_serials"("organizationId", "internalAssetCode");

-- CreateIndex
CREATE INDEX "inventory_receipt_movements_organizationId_idx" ON "inventory_receipt_movements"("organizationId");

-- CreateIndex
CREATE INDEX "inventory_receipt_movements_productVariantId_idx" ON "inventory_receipt_movements"("productVariantId");

-- CreateIndex
CREATE INDEX "inventory_receipt_movements_movementType_idx" ON "inventory_receipt_movements"("movementType");

-- CreateIndex
CREATE INDEX "inventory_receipt_movements_referenceType_referenceId_idx" ON "inventory_receipt_movements"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_receipt_movements_organizationId_movementNumber_key" ON "inventory_receipt_movements"("organizationId", "movementNumber");

-- CreateIndex
CREATE INDEX "supplier_returns_organizationId_idx" ON "supplier_returns"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_returns_supplierId_idx" ON "supplier_returns"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_returns_status_idx" ON "supplier_returns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_returns_organizationId_returnNumber_key" ON "supplier_returns"("organizationId", "returnNumber");

-- CreateIndex
CREATE INDEX "supplier_return_lines_organizationId_idx" ON "supplier_return_lines"("organizationId");

-- CreateIndex
CREATE INDEX "supplier_return_lines_supplierReturnId_idx" ON "supplier_return_lines"("supplierReturnId");

-- CreateIndex
CREATE INDEX "supplier_return_lines_productVariantId_idx" ON "supplier_return_lines"("productVariantId");

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_bank_accounts" ADD CONSTRAINT "supplier_bank_accounts_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_product_mappings" ADD CONSTRAINT "supplier_product_mappings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_product_mappings" ADD CONSTRAINT "supplier_product_mappings_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_product_mappings" ADD CONSTRAINT "supplier_product_mappings_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_supplierProductMappingId_fkey" FOREIGN KEY ("supplierProductMappingId") REFERENCES "supplier_product_mappings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_price_history" ADD CONSTRAINT "supplier_price_history_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_projectInitiationId_fkey" FOREIGN KEY ("projectInitiationId") REFERENCES "project_initiations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bills_of_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirements" ADD CONSTRAINT "material_requirements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirement_lines" ADD CONSTRAINT "material_requirement_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirement_lines" ADD CONSTRAINT "material_requirement_lines_materialRequirementId_fkey" FOREIGN KEY ("materialRequirementId") REFERENCES "material_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_requirement_lines" ADD CONSTRAINT "material_requirement_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_projectInitiationId_fkey" FOREIGN KEY ("projectInitiationId") REFERENCES "project_initiations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_materialRequirementId_fkey" FOREIGN KEY ("materialRequirementId") REFERENCES "material_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisitions" ADD CONSTRAINT "purchase_requisitions_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_lines" ADD CONSTRAINT "purchase_requisition_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_lines" ADD CONSTRAINT "purchase_requisition_lines_purchaseRequisitionId_fkey" FOREIGN KEY ("purchaseRequisitionId") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_lines" ADD CONSTRAINT "purchase_requisition_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_lines" ADD CONSTRAINT "rfq_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_lines" ADD CONSTRAINT "rfq_lines_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_lines" ADD CONSTRAINT "rfq_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_suppliers" ADD CONSTRAINT "rfq_suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_suppliers" ADD CONSTRAINT "rfq_suppliers_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_suppliers" ADD CONSTRAINT "rfq_suppliers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_lines" ADD CONSTRAINT "supplier_quotation_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_lines" ADD CONSTRAINT "supplier_quotation_lines_supplierQuotationId_fkey" FOREIGN KEY ("supplierQuotationId") REFERENCES "supplier_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_lines" ADD CONSTRAINT "supplier_quotation_lines_rfqLineId_fkey" FOREIGN KEY ("rfqLineId") REFERENCES "rfq_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_lines" ADD CONSTRAINT "supplier_quotation_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_originalPoId_fkey" FOREIGN KEY ("originalPoId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "purchase_requisitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "supplier_quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_projectInitiationId_fkey" FOREIGN KEY ("projectInitiationId") REFERENCES "project_initiations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_delivery_schedules" ADD CONSTRAINT "purchase_delivery_schedules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_delivery_schedules" ADD CONSTRAINT "purchase_delivery_schedules_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_delivery_schedules" ADD CONSTRAINT "purchase_delivery_schedules_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "purchase_order_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_locations" ADD CONSTRAINT "inventory_locations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_notes" ADD CONSTRAINT "goods_receipt_notes_receivedLocationId_fkey" FOREIGN KEY ("receivedLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "goods_receipt_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "purchase_order_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "goods_receipt_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_goodsReceiptLineId_fkey" FOREIGN KEY ("goodsReceiptLineId") REFERENCES "goods_receipt_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "goods_receipt_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_goodsReceiptLineId_fkey" FOREIGN KEY ("goodsReceiptLineId") REFERENCES "goods_receipt_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "quality_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_storageLocationId_fkey" FOREIGN KEY ("storageLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_serials" ADD CONSTRAINT "product_serials_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_receipt_movements" ADD CONSTRAINT "inventory_receipt_movements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_receipt_movements" ADD CONSTRAINT "inventory_receipt_movements_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_receipt_movements" ADD CONSTRAINT "inventory_receipt_movements_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_receipt_movements" ADD CONSTRAINT "inventory_receipt_movements_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "inventory_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_receipt_movements" ADD CONSTRAINT "inventory_receipt_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_goodsReceiptNoteId_fkey" FOREIGN KEY ("goodsReceiptNoteId") REFERENCES "goods_receipt_notes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_returns" ADD CONSTRAINT "supplier_returns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_return_lines" ADD CONSTRAINT "supplier_return_lines_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_return_lines" ADD CONSTRAINT "supplier_return_lines_supplierReturnId_fkey" FOREIGN KEY ("supplierReturnId") REFERENCES "supplier_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_return_lines" ADD CONSTRAINT "supplier_return_lines_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_return_lines" ADD CONSTRAINT "supplier_return_lines_goodsReceiptLineId_fkey" FOREIGN KEY ("goodsReceiptLineId") REFERENCES "goods_receipt_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
