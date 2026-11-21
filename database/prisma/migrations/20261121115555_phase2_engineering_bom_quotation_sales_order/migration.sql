-- CreateTable
CREATE TABLE "document_sequences" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_standards" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "minDcAcRatio" DECIMAL(4,2),
    "maxDcAcRatio" DECIMAL(4,2),
    "maxDcVoltageSinglePhase" DECIMAL(6,2),
    "maxDcVoltageThreePhase" DECIMAL(6,2),
    "voltageDropLimitPercent" DECIMAL(4,2),
    "specifications" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineering_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_designs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "designNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "systemType" TEXT NOT NULL DEFAULT 'ON_GRID',
    "connectionType" TEXT NOT NULL DEFAULT 'THREE_PHASE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "activeRevisionNumber" INTEGER NOT NULL DEFAULT 1,
    "sanctionedLoadKw" DECIMAL(8,2),
    "targetCapacityKw" DECIMAL(8,2) NOT NULL,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "engineering_designs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_design_revisions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "panelVariantId" TEXT,
    "moduleQuantity" INTEGER NOT NULL DEFAULT 0,
    "moduleRatedPowerWatts" DECIMAL(8,2),
    "totalDcCapacityKw" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "inverterVariantId" TEXT,
    "inverterQuantity" INTEGER NOT NULL DEFAULT 1,
    "inverterRatedPowerKw" DECIMAL(8,2),
    "totalAcCapacityKw" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "batteryVariantId" TEXT,
    "batteryQuantity" INTEGER DEFAULT 0,
    "batteryCapacityKwh" DECIMAL(8,2),
    "backupDurationHours" DECIMAL(5,2),
    "batterySystemVoltage" DECIMAL(6,2),
    "structureVariantId" TEXT,
    "tiltDegrees" DECIMAL(5,2),
    "azimuthDegrees" DECIMAL(5,2),
    "groundClearanceMeters" DECIMAL(5,2),
    "stringCount" INTEGER NOT NULL DEFAULT 1,
    "modulesPerString" INTEGER NOT NULL DEFAULT 1,
    "mpptCount" INTEGER NOT NULL DEFAULT 1,
    "mpptAllocations" JSONB,
    "dcAcRatio" DECIMAL(5,3),
    "estDailyGenerationKwh" DECIMAL(8,2),
    "estAnnualGenerationKwh" DECIMAL(10,2),
    "specificYieldKwhPerKwp" DECIMAL(8,2),
    "performanceRatioPercent" DECIMAL(5,2),
    "co2SavedTonsAnnual" DECIMAL(6,2),
    "dcCableSizeSqMm" DECIMAL(6,2),
    "acCableSizeSqMm" DECIMAL(6,2),
    "dcDropPercent" DECIMAL(4,2),
    "acDropPercent" DECIMAL(4,2),
    "mainMcbRatingAmps" DECIMAL(6,2),
    "spdRating" TEXT,
    "fuseRatingAmps" DECIMAL(6,2),
    "earthingRodCount" INTEGER DEFAULT 2,
    "compatibilityStatus" TEXT NOT NULL DEFAULT 'CONDITIONAL',
    "complianceStatus" TEXT NOT NULL DEFAULT 'PASSED',
    "validationReport" JSONB,
    "bomGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "engineering_design_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_runs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "engineVersion" TEXT NOT NULL DEFAULT '2.0.0',
    "rulesetVersion" TEXT NOT NULL DEFAULT 'MNRE_CEA_2026',
    "inputSnapshot" JSONB NOT NULL,
    "outputSnapshot" JSONB NOT NULL,
    "warnings" JSONB,
    "violations" JSONB,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "executedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills_of_materials" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bomNumber" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalMaterialCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "notes" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_of_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bomId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "variantId" TEXT,
    "itemCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'NOS',
    "wastageAllowancePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "effectiveQuantity" DECIMAL(10,2) NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "specifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bom_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_configurations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "solarEquipmentGstPercent" DECIMAL(5,2) NOT NULL DEFAULT 12.0,
    "servicesGstPercent" DECIMAL(5,2) NOT NULL DEFAULT 18.0,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_estimates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "quotationId" TEXT,
    "bomId" TEXT,
    "materialCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "laborCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "transportCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "engineeringServicesCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "statutoryFees" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subtotalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overheadMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "profitMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    "baseSellingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalSellingPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isSubsidyEligible" BOOLEAN NOT NULL DEFAULT true,
    "estSubsidyAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPayableByCustomer" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "quotationNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "bomId" TEXT NOT NULL,
    "activeVersionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "subsidyAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netCustomerPayable" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "scopeOfWork" TEXT NOT NULL,
    "paymentTerms" JSONB NOT NULL,
    "warrantyTerms" TEXT,
    "acceptanceDate" TIMESTAMP(3),
    "acceptanceMethod" TEXT,
    "acceptanceEvidenceUrl" TEXT,
    "acceptedById" TEXT,
    "createdById" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_versions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "reasonForRevision" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "itemCategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'NOS',
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxPercent" DECIMAL(5,2) NOT NULL DEFAULT 13.8,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "contractDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systemCapacityKw" DECIMAL(8,2) NOT NULL,
    "contractAmount" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "totalContractValue" DECIMAL(12,2) NOT NULL,
    "paymentScheduleType" TEXT NOT NULL DEFAULT 'MILESTONE_BASED',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "termsAndConditions" TEXT NOT NULL,
    "signedByCustomerName" TEXT,
    "signedDate" TIMESTAMP(3),
    "contractDocumentUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_payment_milestones" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "milestoneType" TEXT NOT NULL,
    "milestoneName" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "referenceNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_payment_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contractId" TEXT,
    "quotationId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "bomId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "advanceRequired" DECIMAL(12,2) NOT NULL,
    "advanceReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "fulfillmentStatus" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "prerequisitesMet" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_milestones" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "milestoneType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_order_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_initiations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "systemCapacityKw" DECIMAL(8,2) NOT NULL,
    "systemType" TEXT NOT NULL DEFAULT 'ON_GRID',
    "bomSnapshot" JSONB NOT NULL,
    "designSnapshot" JSONB NOT NULL,
    "handoverStatus" TEXT NOT NULL DEFAULT 'READY_FOR_PROCUREMENT',
    "handedOverAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_initiations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_sequences_organizationId_idx" ON "document_sequences"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "document_sequences_organizationId_entityType_prefix_year_key" ON "document_sequences"("organizationId", "entityType", "prefix", "year");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_standards_code_key" ON "engineering_standards"("code");

-- CreateIndex
CREATE INDEX "engineering_designs_organizationId_idx" ON "engineering_designs"("organizationId");

-- CreateIndex
CREATE INDEX "engineering_designs_customerId_idx" ON "engineering_designs"("customerId");

-- CreateIndex
CREATE INDEX "engineering_designs_siteId_idx" ON "engineering_designs"("siteId");

-- CreateIndex
CREATE INDEX "engineering_designs_surveyId_idx" ON "engineering_designs"("surveyId");

-- CreateIndex
CREATE INDEX "engineering_designs_status_idx" ON "engineering_designs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_designs_organizationId_designNumber_key" ON "engineering_designs"("organizationId", "designNumber");

-- CreateIndex
CREATE INDEX "engineering_design_revisions_organizationId_idx" ON "engineering_design_revisions"("organizationId");

-- CreateIndex
CREATE INDEX "engineering_design_revisions_designId_idx" ON "engineering_design_revisions"("designId");

-- CreateIndex
CREATE UNIQUE INDEX "engineering_design_revisions_designId_revisionNumber_key" ON "engineering_design_revisions"("designId", "revisionNumber");

-- CreateIndex
CREATE INDEX "calculation_runs_organizationId_idx" ON "calculation_runs"("organizationId");

-- CreateIndex
CREATE INDEX "calculation_runs_designId_idx" ON "calculation_runs"("designId");

-- CreateIndex
CREATE INDEX "bills_of_materials_organizationId_idx" ON "bills_of_materials"("organizationId");

-- CreateIndex
CREATE INDEX "bills_of_materials_designId_idx" ON "bills_of_materials"("designId");

-- CreateIndex
CREATE INDEX "bills_of_materials_status_idx" ON "bills_of_materials"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bills_of_materials_organizationId_bomNumber_key" ON "bills_of_materials"("organizationId", "bomNumber");

-- CreateIndex
CREATE INDEX "bom_items_organizationId_idx" ON "bom_items"("organizationId");

-- CreateIndex
CREATE INDEX "bom_items_bomId_idx" ON "bom_items"("bomId");

-- CreateIndex
CREATE INDEX "bom_items_category_idx" ON "bom_items"("category");

-- CreateIndex
CREATE INDEX "tax_configurations_organizationId_idx" ON "tax_configurations"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_configurations_organizationId_stateCode_key" ON "tax_configurations"("organizationId", "stateCode");

-- CreateIndex
CREATE UNIQUE INDEX "cost_estimates_quotationId_key" ON "cost_estimates"("quotationId");

-- CreateIndex
CREATE INDEX "cost_estimates_organizationId_idx" ON "cost_estimates"("organizationId");

-- CreateIndex
CREATE INDEX "cost_estimates_bomId_idx" ON "cost_estimates"("bomId");

-- CreateIndex
CREATE INDEX "quotations_organizationId_idx" ON "quotations"("organizationId");

-- CreateIndex
CREATE INDEX "quotations_customerId_idx" ON "quotations"("customerId");

-- CreateIndex
CREATE INDEX "quotations_siteId_idx" ON "quotations"("siteId");

-- CreateIndex
CREATE INDEX "quotations_designId_idx" ON "quotations"("designId");

-- CreateIndex
CREATE INDEX "quotations_bomId_idx" ON "quotations"("bomId");

-- CreateIndex
CREATE INDEX "quotations_status_idx" ON "quotations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_organizationId_quotationNumber_key" ON "quotations"("organizationId", "quotationNumber");

-- CreateIndex
CREATE INDEX "quotation_versions_organizationId_idx" ON "quotation_versions"("organizationId");

-- CreateIndex
CREATE INDEX "quotation_versions_quotationId_idx" ON "quotation_versions"("quotationId");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_versions_quotationId_versionNumber_key" ON "quotation_versions"("quotationId", "versionNumber");

-- CreateIndex
CREATE INDEX "quotation_items_organizationId_idx" ON "quotation_items"("organizationId");

-- CreateIndex
CREATE INDEX "quotation_items_quotationId_idx" ON "quotation_items"("quotationId");

-- CreateIndex
CREATE INDEX "contracts_organizationId_idx" ON "contracts"("organizationId");

-- CreateIndex
CREATE INDEX "contracts_customerId_idx" ON "contracts"("customerId");

-- CreateIndex
CREATE INDEX "contracts_quotationId_idx" ON "contracts"("quotationId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_organizationId_contractNumber_key" ON "contracts"("organizationId", "contractNumber");

-- CreateIndex
CREATE INDEX "contract_payment_milestones_organizationId_idx" ON "contract_payment_milestones"("organizationId");

-- CreateIndex
CREATE INDEX "contract_payment_milestones_contractId_idx" ON "contract_payment_milestones"("contractId");

-- CreateIndex
CREATE INDEX "sales_orders_organizationId_idx" ON "sales_orders"("organizationId");

-- CreateIndex
CREATE INDEX "sales_orders_customerId_idx" ON "sales_orders"("customerId");

-- CreateIndex
CREATE INDEX "sales_orders_contractId_idx" ON "sales_orders"("contractId");

-- CreateIndex
CREATE INDEX "sales_orders_quotationId_idx" ON "sales_orders"("quotationId");

-- CreateIndex
CREATE INDEX "sales_orders_designId_idx" ON "sales_orders"("designId");

-- CreateIndex
CREATE INDEX "sales_orders_bomId_idx" ON "sales_orders"("bomId");

-- CreateIndex
CREATE INDEX "sales_orders_status_idx" ON "sales_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_organizationId_orderNumber_key" ON "sales_orders"("organizationId", "orderNumber");

-- CreateIndex
CREATE INDEX "sales_order_milestones_organizationId_idx" ON "sales_order_milestones"("organizationId");

-- CreateIndex
CREATE INDEX "sales_order_milestones_salesOrderId_idx" ON "sales_order_milestones"("salesOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "project_initiations_salesOrderId_key" ON "project_initiations"("salesOrderId");

-- CreateIndex
CREATE INDEX "project_initiations_organizationId_idx" ON "project_initiations"("organizationId");

-- CreateIndex
CREATE INDEX "project_initiations_salesOrderId_idx" ON "project_initiations"("salesOrderId");

-- CreateIndex
CREATE INDEX "project_initiations_customerId_idx" ON "project_initiations"("customerId");

-- CreateIndex
CREATE INDEX "project_initiations_siteId_idx" ON "project_initiations"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "project_initiations_organizationId_projectCode_key" ON "project_initiations"("organizationId", "projectCode");

-- AddForeignKey
ALTER TABLE "document_sequences" ADD CONSTRAINT "document_sequences_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "customer_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_designs" ADD CONSTRAINT "engineering_designs_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_designId_fkey" FOREIGN KEY ("designId") REFERENCES "engineering_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_panelVariantId_fkey" FOREIGN KEY ("panelVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_inverterVariantId_fkey" FOREIGN KEY ("inverterVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_batteryVariantId_fkey" FOREIGN KEY ("batteryVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_structureVariantId_fkey" FOREIGN KEY ("structureVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_design_revisions" ADD CONSTRAINT "engineering_design_revisions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_runs" ADD CONSTRAINT "calculation_runs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_runs" ADD CONSTRAINT "calculation_runs_designId_fkey" FOREIGN KEY ("designId") REFERENCES "engineering_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_runs" ADD CONSTRAINT "calculation_runs_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills_of_materials" ADD CONSTRAINT "bills_of_materials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills_of_materials" ADD CONSTRAINT "bills_of_materials_designId_fkey" FOREIGN KEY ("designId") REFERENCES "engineering_designs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills_of_materials" ADD CONSTRAINT "bills_of_materials_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills_of_materials" ADD CONSTRAINT "bills_of_materials_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bills_of_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_configurations" ADD CONSTRAINT "tax_configurations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_estimates" ADD CONSTRAINT "cost_estimates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_estimates" ADD CONSTRAINT "cost_estimates_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_estimates" ADD CONSTRAINT "cost_estimates_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bills_of_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "customer_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_designId_fkey" FOREIGN KEY ("designId") REFERENCES "engineering_designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bills_of_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_versions" ADD CONSTRAINT "quotation_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_payment_milestones" ADD CONSTRAINT "contract_payment_milestones_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_payment_milestones" ADD CONSTRAINT "contract_payment_milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "quotations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_designId_fkey" FOREIGN KEY ("designId") REFERENCES "engineering_designs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "bills_of_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_milestones" ADD CONSTRAINT "sales_order_milestones_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_order_milestones" ADD CONSTRAINT "sales_order_milestones_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_initiations" ADD CONSTRAINT "project_initiations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_initiations" ADD CONSTRAINT "project_initiations_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_initiations" ADD CONSTRAINT "project_initiations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_initiations" ADD CONSTRAINT "project_initiations_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "customer_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_initiations" ADD CONSTRAINT "project_initiations_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
