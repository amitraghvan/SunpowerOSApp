# SolarOS Phase 3 Database Schema Architecture

## 1. Schema Extensions Summary

Phase 3 introduces 27 new entity models in `database/prisma/schema.prisma` with comprehensive foreign keys, tenant scoping, and PostgreSQL Row-Level Security:

```
1.  Supplier                     (Master vendor registry, statutory GSTIN/PAN, MSME status, rating)
2.  SupplierContact              (Designated vendor contacts, roles, primary flags)
3.  SupplierAddress              (Registered office, billing, factory, dispatch warehouses)
4.  SupplierBankAccount          (Bank IFSC, account numbers, RTGS/NEFT settlement details)
5.  SupplierDocument             (Vendor GST certificates, PAN cards, MSME registrations, warranties)
6.  SupplierProductMapping       (Approved vendor-to-catalog product SKU mappings, unit prices, lead times)
7.  SupplierPriceHistory         (Historical vendor price fluctuations, effective date ranges)
8.  MaterialRequirement          (MRP parent entity aggregated from approved project BOMs)
9.  MaterialRequirementLine      (Net required quantities, inventory allocations, procurement shortfalls)
10. PurchaseRequisition          (Internal department purchase requests with approval gates)
11. PurchaseRequisitionLine      (Itemized requisition lines linked back to project BOM / MRP lines)
12. RequestForQuotation          (Vendor RFQ bidding event with due date and commercial guidelines)
13. RFQLine                      (Itemized hardware specifications sent to suppliers)
14. RFQSupplier                  (Suppliers invited to participate in the RFQ event)
15. SupplierQuotation            (Vendor quotation submissions with payment terms and validity)
16. SupplierQuotationLine        (Vendor bid pricing, discounts, tax rates, and delivery commitments)
17. PurchaseOrder                (Binding legal purchase order with revision tracking and approvals)
18. PurchaseOrderLine            (Ordered quantities, unit prices, taxes, and fulfilled amounts)
19. PurchaseDeliverySchedule     (Tranche/milestone delivery schedules for multi-phase supply)
20. InventoryLocation            (Warehouse zones, receiving docks, quarantine bays, staging bins)
21. GoodsReceiptNote             (Gate entry and physical delivery challan verification)
22. GoodsReceiptLine             (Challan vs received vs accepted vs rejected item counts)
23. QualityInspection            (Electrical, flash test, mechanical, and visual QA check results)
24. ProductSerial                (Individual solar panel, inverter, and battery barcode/serial ledger)
25. InventoryReceiptMovement     (Immutable stock receipt movements into receiving/quarantine locations)
26. SupplierReturn               (Rejected item vendor return notes with debit note linkage)
27. SupplierReturnLine           (Itemized rejection quantities, reason codes, and replacement terms)
```

---

## 2. Relational Integrity & Schema Dictionary

### 2.1 Supplier Management Domain

#### `suppliers`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierCode` (VARCHAR, Unique per org), `name`, `tradeName`, `category` (`SOLAR_MODULES`, `INVERTERS`, `STRUCTURES_MOUNTING`, `ELECTRICAL_BOS`, `BATTERIES`, `CABLES_WIRES`, `SWITCHGEAR`, `SERVICES`), `supplierType` (`MANUFACTURER`, `AUTHORIZED_DISTRIBUTOR`, `DEALER`, `STOCKIST`, `SERVICE_PROVIDER`), `gstin` (VARCHAR, Unique per org), `pan`, `msmeRegistrationNumber`, `rating` (DECIMAL), `status` (`DRAFT`, `ACTIVE`, `BLOCKED`, `INACTIVE`), `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `organizationId` $\to$ `organizations(id)`, `createdById` $\to$ `users(id)`.
- **Indexes**: `(organizationId, supplierCode)`, `(organizationId, gstin)`, `(organizationId, category)`.

#### `supplier_contacts`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierId` (UUID, FK), `name`, `designation`, `department`, `email`, `phone`, `isPrimary` (BOOLEAN), `createdAt`, `updatedAt`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)` ON DELETE CASCADE.

#### `supplier_addresses`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierId` (UUID, FK), `addressType` (`REGISTERED_OFFICE`, `BILLING`, `DISPATCH_WAREHOUSE`, `FACTORY`), `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `isDefault` (BOOLEAN), `createdAt`, `updatedAt`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)` ON DELETE CASCADE.

#### `supplier_bank_accounts`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierId` (UUID, FK), `accountHolderName`, `bankName`, `accountNumber`, `ifscCode`, `branchName`, `isPrimary` (BOOLEAN), `createdAt`, `updatedAt`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)` ON DELETE CASCADE.

#### `supplier_documents`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierId` (UUID, FK), `documentType` (`GST_CERTIFICATE`, `PAN_CARD`, `MSME_CERTIFICATE`, `CANCELLED_CHEQUE`, `DEALERSHIP_CERTIFICATE`, `ISO_CERTIFICATE`), `fileName`, `fileKey` (MinIO S3 key), `fileSize`, `contentType`, `validUntil` (TIMESTAMP), `createdAt`, `updatedAt`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)` ON DELETE CASCADE.

#### `supplier_product_mappings`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierId` (UUID, FK), `productId` (UUID, FK), `supplierSku`, `standardPrice` (DECIMAL), `moq` (DECIMAL), `leadTimeDays` (INT), `isPreferred` (BOOLEAN), `createdAt`, `updatedAt`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)`, `productId` $\to$ `products(id)`.
- **Constraints**: Unique `(supplierId, productId)`.

#### `supplier_price_history`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierProductMappingId` (UUID, FK), `price` (DECIMAL), `validFrom` (TIMESTAMP), `validTo` (TIMESTAMP), `source` (`RFQ`, `MANUAL`, `PURCHASE_ORDER`), `createdAt`.
- **Foreign Keys**: `supplierProductMappingId` $\to$ `supplier_product_mappings(id)` ON DELETE CASCADE.

---

### 2.2 Material Requirements Planning & Requisitions

#### `material_requirements`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `mrpCode` (VARCHAR, Unique per org), `projectInitiationId` (UUID, FK), `bomId` (UUID, FK), `status` (`DRAFT`, `ANALYZED`, `PR_GENERATED`, `COMPLETED`), `notes`, `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `projectInitiationId` $\to$ `project_initiations(id)`, `bomId` $\to$ `bills_of_materials(id)`.

#### `material_requirement_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `materialRequirementId` (UUID, FK), `productId` (UUID, FK), `bomQuantity` (DECIMAL), `allocatedStock` (DECIMAL), `shortfallQuantity` (DECIMAL), `uom` (VARCHAR), `notes`, `createdAt`.
- **Foreign Keys**: `materialRequirementId` $\to$ `material_requirements(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

#### `purchase_requisitions`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `prCode` (VARCHAR, Unique per org), `materialRequirementId` (UUID, FK, Optional), `title`, `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `requiredByDate` (TIMESTAMP), `status` (`DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `CONVERTED_TO_PO`), `approvedById` (UUID, FK), `approvedAt`, `rejectionReason`, `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `materialRequirementId` $\to$ `material_requirements(id)`.

#### `purchase_requisition_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `purchaseRequisitionId` (UUID, FK), `productId` (UUID, FK), `quantity` (DECIMAL), `uom` (VARCHAR), `estimatedUnitPrice` (DECIMAL), `notes`, `createdAt`.
- **Foreign Keys**: `purchaseRequisitionId` $\to$ `purchase_requisitions(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

---

### 2.3 RFQ, Quotations & Vendor Comparison

#### `rfqs`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `rfqCode` (VARCHAR, Unique per org), `title`, `purchaseRequisitionId` (UUID, FK, Optional), `dueDate` (TIMESTAMP), `status` (`DRAFT`, `SENT`, `BIDDING_CLOSED`, `AWARDED`, `CANCELLED`), `paymentTerms`, `deliveryTerms`, `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `purchaseRequisitionId` $\to$ `purchase_requisitions(id)`.

#### `rfq_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `rfqId` (UUID, FK), `productId` (UUID, FK), `quantity` (DECIMAL), `targetPrice` (DECIMAL), `createdAt`.
- **Foreign Keys**: `rfqId` $\to$ `rfqs(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

#### `rfq_suppliers`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `rfqId` (UUID, FK), `supplierId` (UUID, FK), `status` (`INVITED`, `QUOTED`, `DECLINED`, `AWARDED`), `awardedAt` (TIMESTAMP), `createdAt`.
- **Foreign Keys**: `rfqId` $\to$ `rfqs(id)` ON DELETE CASCADE, `supplierId` $\to$ `suppliers(id)`.

#### `supplier_quotations`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `quoteCode` (VARCHAR, Unique per org), `rfqId` (UUID, FK), `supplierId` (UUID, FK), `totalAmount` (DECIMAL), `taxAmount` (DECIMAL), `validUntil` (TIMESTAMP), `paymentTerms`, `deliveryLeadTimeDays` (INT), `status` (`RECEIVED`, `UNDER_REVIEW`, `ACCEPTED`, `REJECTED`), `notes`, `createdAt`, `updatedAt`.
- **Foreign Keys**: `rfqId` $\to$ `rfqs(id)`, `supplierId` $\to$ `suppliers(id)`.

#### `supplier_quotation_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierQuotationId` (UUID, FK), `productId` (UUID, FK), `quotedQuantity` (DECIMAL), `unitPrice` (DECIMAL), `discountPercent` (DECIMAL), `taxRate` (DECIMAL), `lineTotal` (DECIMAL), `createdAt`.
- **Foreign Keys**: `supplierQuotationId` $\to$ `supplier_quotations(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

---

### 2.4 Purchase Orders & Delivery Schedules

#### `purchase_orders`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `poNumber` (VARCHAR, Unique per org), `revisionNumber` (INT, Default 1), `supplierId` (UUID, FK), `purchaseRequisitionId` (UUID, FK, Optional), `rfqId` (UUID, FK, Optional), `subtotal` (DECIMAL), `taxAmount` (DECIMAL), `totalAmount` (DECIMAL), `status` (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `ISSUED`, `PARTIALLY_DELIVERED`, `COMPLETED`, `CANCELLED`), `approvalStatus` (`PENDING`, `APPROVED`, `REJECTED`), `approvedById` (UUID, FK), `approvedAt` (TIMESTAMP), `expectedDeliveryDate` (TIMESTAMP), `paymentTerms`, `notes`, `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `supplierId` $\to$ `suppliers(id)`, `purchaseRequisitionId` $\to$ `purchase_requisitions(id)`, `rfqId` $\to$ `rfqs(id)`.

#### `purchase_order_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `purchaseOrderId` (UUID, FK), `productId` (UUID, FK), `quantity` (DECIMAL), `unitPrice` (DECIMAL), `taxRate` (DECIMAL), `taxAmount` (DECIMAL), `totalAmount` (DECIMAL), `receivedQuantity` (DECIMAL, Default 0), `createdAt`.
- **Foreign Keys**: `purchaseOrderId` $\to$ `purchase_orders(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

#### `purchase_delivery_schedules`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `purchaseOrderId` (UUID, FK), `trancheNumber` (INT), `expectedDate` (TIMESTAMP), `quantity` (DECIMAL), `notes`, `status` (`SCHEDULED`, `DISPATCHED`, `RECEIVED`, `DELAYED`), `createdAt`.
- **Foreign Keys**: `purchaseOrderId` $\to$ `purchase_orders(id)` ON DELETE CASCADE.

---

### 2.5 Goods Receipt, Quality Inspection & Serial Tracking

#### `inventory_locations`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `locationCode` (VARCHAR, Unique per org), `name`, `type` (`RECEIVING_DOCK`, `QUARANTINE_BAY`, `MAIN_WAREHOUSE`, `PROJECT_STAGING`, `DAMAGED_STORAGE`), `address`, `isActive` (BOOLEAN), `createdAt`, `updatedAt`.
- **Foreign Keys**: `organizationId` $\to$ `organizations(id)`.

#### `goods_receipt_notes`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `grnNumber` (VARCHAR, Unique per org), `purchaseOrderId` (UUID, FK), `supplierId` (UUID, FK), `challanNumber` (VARCHAR), `challanDate` (TIMESTAMP), `vehicleNumber` (VARCHAR), `receivedLocationId` (UUID, FK, Optional), `status` (`DRAFT`, `RECEIVED`, `UNDER_INSPECTION`, `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED`), `notes`, `receivedAt` (TIMESTAMP), `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `purchaseOrderId` $\to$ `purchase_orders(id)`, `supplierId` $\to$ `suppliers(id)`, `receivedLocationId` $\to$ `inventory_locations(id)`.

#### `goods_receipt_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `goodsReceiptNoteId` (UUID, FK), `purchaseOrderLineId` (UUID, FK), `productId` (UUID, FK), `challanQuantity` (DECIMAL), `receivedQuantity` (DECIMAL), `acceptedQuantity` (DECIMAL, Default 0), `rejectedQuantity` (DECIMAL, Default 0), `unitCost` (DECIMAL), `rejectionReason`, `createdAt`.
- **Foreign Keys**: `goodsReceiptNoteId` $\to$ `goods_receipt_notes(id)` ON DELETE CASCADE, `purchaseOrderLineId` $\to$ `purchase_order_lines(id)`, `productId` $\to$ `products(id)`.

#### `quality_inspections`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `inspectionNumber` (VARCHAR, Unique per org), `goodsReceiptNoteId` (UUID, FK), `status` (`IN_PROGRESS`, `PASSED`, `FAILED`, `CONDITIONAL_PASS`), `overallResult` (VARCHAR), `flashReportUrl` (MinIO S3 key), `visualDefects` (TEXT), `electricalSafetyPassed` (BOOLEAN), `notes`, `inspectedAt` (TIMESTAMP), `createdAt`, `updatedAt`, `inspectorId` (UUID, FK).
- **Foreign Keys**: `goodsReceiptNoteId` $\to$ `goods_receipt_notes(id)` ON DELETE CASCADE, `inspectorId` $\to$ `users(id)`.

#### `product_serials`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `serialNumber` (VARCHAR, Unique per org), `productId` (UUID, FK), `goodsReceiptNoteId` (UUID, FK), `batchNumber` (VARCHAR), `status` (`IN_STOCK`, `RESERVED_FOR_PROJECT`, `DISPATCHED`, `INSTALLED`, `RETURNED_TO_SUPPLIER`), `assignedProjectInitiationId` (UUID, FK, Optional), `locationId` (UUID, FK, Optional), `warrantyUntil` (TIMESTAMP), `createdAt`, `updatedAt`.
- **Foreign Keys**: `productId` $\to$ `products(id)`, `goodsReceiptNoteId` $\to$ `goods_receipt_notes(id)`, `assignedProjectInitiationId` $\to$ `project_initiations(id)`, `locationId` $\to$ `inventory_locations(id)`.
- **Indexes**: `(organizationId, serialNumber)`, `(organizationId, productId, status)`.

#### `inventory_receipt_movements`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `goodsReceiptNoteId` (UUID, FK), `productId` (UUID, FK), `locationId` (UUID, FK), `quantity` (DECIMAL), `movementType` (`INWARD_RECEIPT`, `QUARANTINE_HOLD`, `SCRAP`, `VENDOR_RETURN`), `referenceNumber` (VARCHAR), `createdAt`.
- **Foreign Keys**: `goodsReceiptNoteId` $\to$ `goods_receipt_notes(id)`, `productId` $\to$ `products(id)`, `locationId` $\to$ `inventory_locations(id)`.

#### `supplier_returns`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `returnNumber` (VARCHAR, Unique per org), `goodsReceiptNoteId` (UUID, FK), `supplierId` (UUID, FK), `status` (`DRAFT`, `APPROVED`, `DISPATCHED_TO_VENDOR`, `CREDIT_NOTE_ISSUED`), `debitNoteNumber` (VARCHAR), `debitNoteAmount` (DECIMAL), `reason`, `notes`, `createdAt`, `updatedAt`, `createdById`.
- **Foreign Keys**: `goodsReceiptNoteId` $\to$ `goods_receipt_notes(id)`, `supplierId` $\to$ `suppliers(id)`.

#### `supplier_return_lines`
- **Columns**: `id` (UUID, PK), `organizationId` (UUID, FK), `supplierReturnId` (UUID, FK), `productId` (UUID, FK), `quantity` (DECIMAL), `unitCost` (DECIMAL), `lineTotal` (DECIMAL), `reason`, `createdAt`.
- **Foreign Keys**: `supplierReturnId` $\to$ `supplier_returns(id)` ON DELETE CASCADE, `productId` $\to$ `products(id)`.

---

## 3. Relational Integrity & RLS Enforcement

- Every organization-owned table includes an `organizationId` column.
- Row-Level Security is strictly enforced using `FORCE ROW LEVEL SECURITY`.
- `solaros_app` role accesses data only through `app.current_organization_id` transaction context.
- Foreign key cascading deletes are applied to dependent child entities (contacts, addresses, line items) while preserving auditability on parent documents.
