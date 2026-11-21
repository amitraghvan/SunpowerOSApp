# Warehouse Transfers & Inter-Bin Movements
## SolarOS ERP — Module Specification

### 1. Overview
Solar contractors maintain central distribution hubs (e.g. state warehouses) alongside regional staging yards and installation site storage. The Warehouse Transfer module manages inventory movement across facilities and internal bin movements.

### 2. Multi-Stage Transfer Lifecycle
```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  REQUESTED   │ ──> │   APPROVED   │ ──> │  IN_TRANSIT  │ ──> │  COMPLETED   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
    Planner             Warehouse             Source Hub           Destination Hub
  Submits TRF-       Manager Approves     Ships & Decrements    Receives & Increments
```

1. **Request (`REQUESTED`):**
   - Source warehouse & location, destination warehouse & location specified.
   - Line items with requested quantities and optional batch/serial constraints.
2. **Approval (`APPROVED`):**
   - Facility manager verifies source stock availability and validates transfer justification.
3. **Shipping (`IN_TRANSIT`):**
   - Source location stock is deducted via `MovementType.INTERNAL_TRANSFER` with `fromLocationId = sourceLocationId`.
   - Transporter details, tracking/waybill number recorded.
   - Serial numbers updated to `status = 'IN_TRANSIT'`.
4. **Destination Receiving (`COMPLETED`):**
   - Destination receiving dock inspects arrived physical cargo.
   - Destination stock is incremented via `MovementType.INTERNAL_TRANSFER` with `toLocationId = destinationLocationId`.
   - Serial numbers updated to `status = 'IN_STOCK'` and mapped to the destination warehouse.
