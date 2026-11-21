# Authoritative Inventory Stock Ledger
## SolarOS ERP — Module Specification

### 1. Mathematical Balance Formula
To prevent ledger drift and guarantee complete transactional auditability, SolarOS ERP does not maintain a mutable counter on the product variant table. Instead, stock balances are computed dynamically from immutable ledger entries in `inventory_receipt_movements`:

$$\text{On-Hand Stock} = \sum (\text{PURCHASE\_RECEIPT} + \text{CUSTOMER\_RETURN} + \text{POSITIVE\_ADJUSTMENTS}) - \sum (\text{DISPATCH\_ISSUE} + \text{SUPPLIER\_RETURN} + \text{NEGATIVE\_ADJUSTMENTS})$$

$$\text{Active Reserved Stock} = \sum (\text{quantityReserved} - \text{quantityPicked}) \quad \forall \text{ reservations in } [\text{RESERVED}, \text{PARTIALLY\_RESERVED}]$$

$$\text{Available Stock} = \max(0, \text{On-Hand Stock} - \text{Active Reserved Stock})$$

### 2. Supported Movement Types
- `PURCHASE_RECEIPT`: Inward accepted goods from posted Goods Receipt Notes (GRN).
- `CUSTOMER_RETURN`: Restocked equipment returned from customer sites / RMA.
- `STOCK_ADJUSTMENT`: Cycle count or physical audit reconciliations authorized by a supervisor.
- `DISPATCH_ISSUE`: Outbound material deductions upon dispatch order release.
- `SUPPLIER_RETURN`: Defective goods returned to vendor under Phase 3 RMA.
- `INTERNAL_TRANSFER`: Stock moved between warehouses or storage bins.

### 3. Visibility Cockpit
- **Product Stock Details (`/api/v1/inventory/stock/:productVariantId`):**
  - Item details: SKU, name, product model, category, manufacturer, pricing, unit of measure (e.g. `METERS` for cables, `NOS` for inverters/modules).
  - Stock summary: `totalReceived`, `onHandStock`, `activeReserved`, `availableStock`, and `quarantinedStock`.
  - Serial registry with current status (`IN_STOCK`, `ALLOCATED`, `PICKED`, `DISPATCHED`, `QUARANTINE`).
  - Active project reservations breakdown.
  - Complete immutable movement history ledger.
