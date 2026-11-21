# Phase 3 to Phase 4 Integration & Handoff Contract

## 1. Domain Scope & Separation

- **Phase 3 Scope (Procurement & Inbound Operations)**:
  - Supplier onboarding and product mapping.
  - MRP requirement explosion from Project BOMs.
  - Purchase Requisitions (PR) and RFQs.
  - Purchase Orders (PO) and vendor revisions.
  - Gate pass entry, Goods Receipt Notes (GRN).
  - Inward Quality Inspection (QIR: visual, flash test, electrical safety).
  - Serial number capture and batch registration.
  - Inbound receiving ledger movements into Receiving Dock / Quarantine Bay.
  - Supplier returns and debit notes.

- **Phase 4 Scope (Warehouse Inventory, Project Allocation & Dispatch)**:
  - Multi-warehouse inventory balances and bin-level storage locations.
  - Putaway rules (from Receiving Dock / Inspection Bay to Storage Bins).
  - Hard project reservation (binding serial numbers to specific `ProjectInitiation`).
  - Pick-and-pack fulfillment for solar installation kits.
  - Outward gate pass and dispatch logistics to customer sites.
  - Field installation consumption and warranty activation.

---

## 2. Technical Integration Interface

### 2.1 Inventory Location Handoff
Phase 3 creates locations with types:
- `RECEIVING_DOCK`: Where goods initially arrive and wait for GRN creation.
- `QUARANTINE_BAY`: Where goods sit during Quality Inspection.
- `MAIN_WAREHOUSE`: Where accepted items move once inspected.

Phase 4 extends `inventory_locations` with aisle, rack, and bin sub-locations.

### 2.2 Product Serial State Machine Handoff
Phase 3 registers serials in state:
- `IN_STOCK`: Material accepted and available for project reservation.

Phase 4 transitions serials through:
$$\text{IN\_STOCK} \xrightarrow{\text{Phase 4 Reserve}} \text{RESERVED\_FOR\_PROJECT} \xrightarrow{\text{Phase 4 Pick \& Pack}} \text{DISPATCHED} \xrightarrow{\text{Phase 5 Install}} \text{INSTALLED}$$

### 2.3 Serial Number Schema Fields for Phase 4
```prisma
model ProductSerial {
  id                          String             @id @default(uuid())
  organizationId              String
  serialNumber                String
  productId                   String
  goodsReceiptNoteId          String
  batchNumber                 String?
  status                      ProductSerialStatus // IN_STOCK -> RESERVED_FOR_PROJECT -> DISPATCHED -> INSTALLED
  assignedProjectInitiationId String?            // Phase 4 populates this on kit reservation
  locationId                  String?            // Phase 4 updates this on putaway
  warrantyUntil               DateTime?
  createdAt                   DateTime           @default(now())
  updatedAt                   DateTime           @updatedAt
}
```

### 2.4 Movement Ledger Interface
Phase 3 records inward movements:
```prisma
model InventoryReceiptMovement {
  id                 String               @id @default(uuid())
  organizationId     String
  goodsReceiptNoteId String
  productId          String
  locationId         String
  quantity           Decimal
  movementType       ReceiptMovementType  // INWARD_RECEIPT, QUARANTINE_HOLD, SCRAP, VENDOR_RETURN
  referenceNumber    String
  createdAt          DateTime             @default(now())
}
```
Phase 4 will consume these movements as initial receipts, establishing the opening balance for warehouse ledger reconciliation.
