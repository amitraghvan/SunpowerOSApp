# SunPowerOS — ERP Application Shell Architecture

**Component Directory:** `apps/web/src/components/erp/`  
**Master Layout:** `apps/web/src/app/(erp)/layout.tsx`  
**Master Wrapper:** `apps/web/src/components/erp/erp-shell.tsx`  

---

## 1. Architectural Overview

The SunPowerOS ERP application shell provides the structural foundation for all logged-in users. It adheres to the dense, productive UX popularized by Odoo Enterprise while maintaining responsive adaptiveness for tablets and mobile devices.

```
+-----------------------------------------------------------------------------------+
| ERP TOPBAR (58px) - Plum #714B67                                                  |
| [9-Dot] SunPowerOS / CRM    [Global Search Cmd+K]    [Org: SunPower] [User Avatar]|
+-------------------+---------------------------------------------------------------+
| SIDEBAR (252px)   | MAIN WORKSPACE                                                |
|                   |                                                               |
| OVERVIEW          | [PageHeader: Breadcrumbs + Title + Primary & Secondary Actions]
|  Dashboard        |                                                               |
|                   | [Record Sheet / Data Table / Kanban Board]                    |
| COMMERCIAL        |                                                               |
|  CRM & Leads      |                                                               |
|  Customers 360    |                                                               |
|  Quotations       |                                                               |
|  EPC Contracts    |                                                               |
|  Sales Orders     |                                                               |
|                   |                                                               |
| TECHNICAL         |                                                               |
|  Site Surveys     |                                                               |
|  Product Catalog  |                                                               |
|  Engineering & BOM|                                                               |
|                   |                                                               |
| SUPPLY CHAIN      |                                                               |
|  Suppliers        |                                                               |
|  Requisitions     |                                                               |
|  RFQs & Bids      |                                                               |
|  Purchase Orders  |                                                               |
|  Goods Receipts   |                                                               |
|  Serial Tracking  |                                                               |
|                   |                                                               |
| SETTINGS & IAM    |                                                               |
|  Settings Hub     |                                                               |
|  Users & Team     |                                                               |
|  Roles & RBAC     |                                                               |
|  Audit Trail      |                                                               |
|                   |                                                               |
| [<< Collapse]     |                                                               |
+-------------------+---------------------------------------------------------------+
```

---

## 2. Core Components

### 2.1 Topbar (`erp-topbar.tsx`)
- Height: 58px.
- Background: `#714B67` (Odoo plum).
- Left:
  - Mobile hamburger toggle for sidebar drawer.
  - 9-dot application launcher opening the full 12-icon visual application grid.
  - Brand identifier (`SunPowerOS`) and dynamic active app breadcrumb.
- Center:
  - Global search bar with shortcut indicator.
- Right:
  - Multi-tenant Organization Switcher displaying current tenant name, slug, and active branch with PostgreSQL RLS indicator.
  - User avatar with dropdown containing profile, settings, permissions overview, and sign-out.

### 2.2 Collapsible Sidebar (`erp-sidebar.tsx`)
- Standard width: 252px. Collapsed width: 64px.
- Groups:
  1. `OVERVIEW`: Dashboard.
  2. `COMMERCIAL`: CRM & Leads, Customers 360, Quotations, Contracts, Sales Orders.
  3. `TECHNICAL & DESIGN`: Site Surveys, Equipment Catalog, Engineering & BOM.
  4. `SUPPLY CHAIN`: Suppliers, Requisitions, RFQs, Purchase Orders, Goods Receipts, Serial Tracking.
  5. `SETTINGS & IAM`: Settings Hub, Users & Team, Access Roles, Audit Trail.
- Collapsible groups with persistent memory and active-route highlight styling (`#F1EAF0` plum tint).
- Desktop collapse toggle button and mobile drawer backdrop for touchscreens.

### 2.3 Page Header (`page-header.tsx`)
Standardized header for every ERP view:
- Structured breadcrumbs (`Home > Commercial > CRM`).
- Title with optional status badge.
- View switchers (List view vs. Kanban view).
- Refresh button.
- Primary CTA (`+ New Lead`, `+ New Survey`, `+ Create Quote`) and secondary actions.

### 2.4 Data Table (`data-table.tsx`)
- Dense tabular layout with column-based sorting.
- Multi-field text filtering with search bar.
- Optional row selection checkboxes with batch action support.
- Built-in pagination with total record count and page size controls.
- Integrated empty state handling.

### 2.5 Record Form Layout (`record-form-layout.tsx`)
- Top action ribbon with Save and Discard buttons.
- Odoo-style status pipeline stage ribbon (`Draft → Under Review → Approved → Confirmed`).
- Document reference number and status badges.
- Smart buttons row for linked operational counts (e.g., Surveys, Quotations, Sales Orders).
- Multi-tab navigation for complex records.
- Immutable audit trail footer with creation and update metadata.
