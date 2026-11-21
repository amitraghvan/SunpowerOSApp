# Phase 4 — REST API Documentation
## SolarOS ERP — Endpoint Specification

All endpoints are authenticated with JWT sessions (`AuthenticationGuard`), scoped to tenant organization context (`TenantContextGuard`), and protected by fine-grained permissions (`PermissionsGuard` with `@RequirePermissions`).

### 1. Warehouse Endpoints
- `GET /api/v1/warehouses`: List all warehouses for tenant organization.
- `POST /api/v1/warehouses`: Provision new warehouse with default receiving & storage locations.
- `GET /api/v1/warehouses/:id`: Get warehouse details.
- `PUT /api/v1/warehouses/:id`: Update warehouse metadata.
- `GET /api/v1/warehouses/:id/locations`: List storage zones, racks, and bins in warehouse.
- `POST /api/v1/warehouses/:id/locations`: Create sub-location or bin.

### 2. Stock Visibility Endpoints
- `GET /api/v1/inventory/stock`: Authoritative stock overview across variants and warehouses.
- `GET /api/v1/inventory/stock/:productVariantId`: Detailed product stock profile with serials, reservations, and movement history.

### 3. Stock Reservation Endpoints
- `GET /api/v1/inventory/reservations`: List reservations with allocation status filter.
- `POST /api/v1/inventory/reservations`: Create project stock reservation (from BOM or explicit items).
- `GET /api/v1/inventory/reservations/:id`: Get reservation details and line breakdown.
- `POST /api/v1/inventory/reservations/:id/release`: Release active reservation back to available stock.

### 4. Warehouse Transfer Endpoints
- `GET /api/v1/inventory/transfers`: List stock transfers.
- `POST /api/v1/inventory/transfers`: Request inter-warehouse or inter-bin transfer.
- `POST /api/v1/inventory/transfers/:id/approve`: Approve transfer.
- `POST /api/v1/inventory/transfers/:id/ship`: Ship transfer (source stock deduction).
- `POST /api/v1/inventory/transfers/:id/receive`: Receive transfer at destination (destination stock increment).

### 5. Stock Counting & Adjustment Endpoints
- `GET /api/v1/inventory/counts`: List stock counts.
- `POST /api/v1/inventory/counts`: Create physical/cycle count ticket.
- `POST /api/v1/inventory/counts/:id/submit`: Submit physical counts with variance computation.
- `GET /api/v1/inventory/adjustments`: List stock adjustments.
- `POST /api/v1/inventory/adjustments`: Propose stock adjustment.
- `POST /api/v1/inventory/adjustments/:id/approve`: Supervisor approval committing movement to ledger.

### 6. Picking & Packing Endpoints
- `GET /api/v1/inventory/picking`: List picking orders.
- `POST /api/v1/inventory/picking`: Generate pick ticket from reservation.
- `POST /api/v1/inventory/picking/:id/confirm`: Confirm pick with scanned serial numbers.
- `GET /api/v1/inventory/packing`: List packing orders.
- `POST /api/v1/inventory/packing`: Create packing workspace order.
- `POST /api/v1/inventory/packing/:id/confirm`: Confirm packing with mandatory 8-point checklist.

### 7. Dispatch & Delivery Endpoints
- `GET /api/v1/dispatch`: List dispatch orders.
- `POST /api/v1/dispatch`: Create dispatch order.
- `POST /api/v1/dispatch/:id/approve`: Approve dispatch order.
- `POST /api/v1/dispatch/:id/post`: Post dispatch order (authoritative stock deduction).
- `POST /api/v1/dispatch/:id/confirm-delivery`: Confirm Proof of Delivery (POD).
- `GET /api/v1/delivery-challans`: List delivery challans.
- `POST /api/v1/delivery-challans`: Generate printable delivery challan (`DCH-YYYY-000001`).

### 8. Customer Returns (RMA) Endpoints
- `GET /api/v1/inventory/returns`: List customer & project returns.
- `POST /api/v1/inventory/returns`: Create customer return (RMA) ticket.
- `POST /api/v1/inventory/returns/:id/receive`: Mark return received at warehouse bay.
- `POST /api/v1/inventory/returns/:id/inspect`: Inward quality inspection with restock decision.
