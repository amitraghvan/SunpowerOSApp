# Stock Reservation & BOM Allocation
## SolarOS ERP — Module Specification

### 1. Business Purpose
When a commercial solar EPC contract is finalized and a Sales Order is confirmed, equipment required by the approved Bill of Materials (BOM) must be immediately ring-fenced to prevent multiple project managers from committing the same physical solar modules, batteries, or inverters.

### 2. Automated BOM Item Extraction
When creating a reservation with a `salesOrderId` or `projectInitiationId`:
- The engine fetches the Sales Order and its approved BOM.
- Automatically resolves all active BOM items with valid `variantId` and `effectiveQuantity`.
- Automatically populates the reservation lines without manual data re-entry.

### 3. Concurrency Protection & Atomic Locking
```typescript
await tx.$executeRawUnsafe(
  `SELECT "id" FROM "product_variants" WHERE "id" = '${item.productVariantId}' AND "organizationId" = '${organizationId}' FOR UPDATE`
);
```
- Row-level lock `FOR UPDATE` prevents race conditions between concurrent project allocations.
- Computes available balance within the transaction.
- Allocates up to available stock:
  - If `canReserve === reqQty`: Line status is `ACTIVE`.
  - If `canReserve < reqQty`: Line records `quantityOutstanding = reqQty - canReserve` (Shortage).
- Serial numbers in `IN_STOCK` status are atomically updated to `ALLOCATED` and linked to `activeReservationId`.

### 4. Reservation Status Lifecycle
```text
DRAFT ➔ RESERVED / PARTIALLY_RESERVED ➔ (CONSUMED upon Dispatch OR RELEASED by Planner)
```
- `READY_FOR_PICKING`: 100% of required BOM items are ring-fenced.
- `PARTIALLY_ALLOCATED`: Partial stock allocated; remaining items flagged for procurement MRP.
- `SHORTAGE`: Zero stock was available at time of reservation.
- `RELEASED`: If a project is cancelled or deferred, releasing the reservation restores stock to `Available` instantly.
