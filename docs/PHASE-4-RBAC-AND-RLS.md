# Phase 4 — RBAC Permissions & PostgreSQL RLS Coverage
## SolarOS ERP — Security Specification

### 1. Granular Phase 4 Permission Matrix
The following 20 permissions were registered in `apps/api/src/modules/access-control/permissions.registry.ts`:

| Permission Code | Description | Module |
| :--- | :--- | :--- |
| `inventory:warehouse:read` | View warehouses and locations | Warehouse |
| `inventory:warehouse:create` | Create warehouses and locations | Warehouse |
| `inventory:warehouse:update` | Update warehouse details | Warehouse |
| `inventory:stock:read` | View stock overview and movement ledger | Stock Ledger |
| `inventory:reservation:read` | View project stock reservations | Reservations |
| `inventory:reservation:create` | Create project stock reservations | Reservations |
| `inventory:reservation:release` | Release stock reservations | Reservations |
| `inventory:transfers:read` | View stock transfers | Transfers |
| `inventory:transfers:create` | Request stock transfers | Transfers |
| `inventory:transfers:approve` | Approve stock transfers | Transfers |
| `inventory:transfers:ship` | Ship stock transfers | Transfers |
| `inventory:transfers:receive` | Receive stock transfers | Transfers |
| `inventory:picking:manage` | Create, pick, and confirm pick lists | Picking |
| `inventory:packing:manage` | Create packing orders & verify checklists | Packing |
| `inventory:dispatch:read` | View dispatch orders & challans | Dispatch |
| `inventory:dispatch:create` | Create dispatch orders | Dispatch |
| `inventory:dispatch:approve` | Approve dispatch orders | Dispatch |
| `inventory:dispatch:post` | Post dispatch orders (stock reduction) | Dispatch |
| `inventory:counts:manage` | Create and submit physical stock counts | Adjustments |
| `inventory:adjustments:create` | Create stock adjustment requests | Adjustments |
| `inventory:adjustments:approve` | Approve stock adjustments (Supervisor) | Adjustments |
| `inventory:returns:manage` | Create, receive, and inspect returns (RMA) | Returns |

### 2. Standard Role Templates
- `WAREHOUSE_MANAGER`: Full permissions across warehouses, stock ledger, transfers, counts, picking, packing, and returns.
- `DISPATCH_MANAGER`: Dispatch orders, delivery challans, and proof of delivery confirmation.

### 3. PostgreSQL Row-Level Security (RLS)
Defined in `database/sql/rls-policies/006_phase4_tenant_isolation.sql`:
- All 18 Phase 4 tables (`warehouses`, `stock_reservations`, `stock_reservation_lines`, `stock_transfers`, `stock_transfer_lines`, `stock_counts`, `stock_count_lines`, `stock_adjustments`, `picking_orders`, `picking_order_lines`, `packing_orders`, `packing_order_lines`, `dispatch_orders`, `dispatch_order_lines`, `delivery_challans`, `proofs_of_delivery`, `customer_returns`, `customer_return_lines`) have:
  - `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;`
  - Policy: `CREATE POLICY <table_name>_tenant_isolation ON <table_name> USING ("organizationId" = NULLIF(current_setting('app.current_organization_id', true), '')::text);`
  - Table grants to application user: `GRANT SELECT, INSERT, UPDATE, DELETE ON <table_name> TO solaros_app;`
