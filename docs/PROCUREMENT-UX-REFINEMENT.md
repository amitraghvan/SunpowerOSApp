# SUNPOWEROS — PROCUREMENT COCKPIT UX REFINEMENT

## 1. Overview
The Procurement Cockpit (`http://localhost:3000/procurement`) was refactored to align with Odoo Enterprise operational simplicity, eliminating verbose SaaS marketing cards in favor of a fast, high-density ERP interface.

---

## 2. Redesigned Interface Structure

### 2.1 Header
- **Title**: `Procurement`
- **Subtitle**: `Manage suppliers, purchasing and incoming materials.`
- **Operational Actions**:
  - `Sync Ledger`: Triggers an immediate refresh of procurement KPIs, recent purchase orders, and requisitions.
  - `New Purchase Order`: Direct link to `/procurement/purchase-orders` for issuing formal equipment orders.

### 2.2 4 Compact KPI Cards
1. **Purchase Orders Value**:
   - Total purchase spend committed across approved and issued POs.
   - Live PO Commitments status badge in emerald.
2. **Pending Requisitions**:
   - Number of material requisitions requiring purchasing action.
   - Direct link to requisition review.
3. **Awaiting Approval**:
   - Number of purchase orders in pending approval gate.
   - Management sign-off alert badge.
4. **Orders In Transit**:
   - Active orders with vendor logistics delivery tracking enabled.

### 2.3 6 Compact Module Shortcuts
- **Suppliers** (`/suppliers`): Approved vendor registry, GSTIN, and SKU mappings.
- **Requisitions** (`/procurement/requisitions`): MRP demand lines and internal requests.
- **RFQs** (`/procurement/rfqs`): Bid evaluation matrix and price comparison.
- **Purchase Orders** (`/procurement/purchase-orders`): Multi-round amendment lifecycle.
- **Goods Receipts** (`/procurement/grns`): Inward inspection and QA checklist.
- **Serial Tracking** (`/procurement/serials`): Barcode ledger and warranty traceability.

### 2.4 Operational Tables
- **Recent Purchase Orders**: Displays PO number, supplier, total in ₹, and status badges.
- **Pending Requisitions**: Displays PR number, title, item count, and status badges.
- Clean empty states with prompt buttons (`+ Create Purchase Order`, `+ Create Requisition`).
- Loading skeletons with spinners for seamless asynchronous transitions.
- Z-index isolation at `relative z-10`, preventing collisions with the ERP topbar dropdowns.
