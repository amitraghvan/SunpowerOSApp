# SunPowerOS Public Website Route Architecture

## 1. Route Map

The web application exposes both public marketing and authenticated enterprise ERP routes:

| Route | Access | Layout Group | Description |
| :--- | :--- | :--- | :--- |
| `/` | Public | Root | Complete 16-section Odoo-inspired marketing homepage |
| `/login` | Public | `(auth)` | Enterprise sign-in page with Argon2id session authentication |
| `/signup` | Public | `(auth)` | 2-step self-service workspace registration |
| `/forgot-password` | Public | `(auth)` | Password reset request |
| `/reset-password` | Public | `(auth)` | Password reset completion with token |
| `/dashboard` | Authenticated | `(erp)` | Real operational dashboard with 6 KPIs and work queue |
| `/crm` | Authenticated | `(erp)` | CRM leads and opportunity sales pipeline |
| `/customers` | Authenticated | `(erp)` | Customer directory and multi-site records |
| `/customers/[id]` | Authenticated | `(erp)` | Customer 360 workspace |
| `/surveys` | Authenticated | `(erp)` | Technical site survey and audit workspace |
| `/catalog` | Authenticated | `(erp)` | Solar modules, inverters, batteries, and hardware |
| `/engineering` | Authenticated | `(erp)` | Solar engineering designs and BOM |
| `/engineering/[id]`| Authenticated | `(erp)` | Master 13-tab engineering technical workspace |
| `/quotations` | Authenticated | `(erp)` | Quotation list and pricing management |
| `/quotations/[id]` | Authenticated | `(erp)` | Quotation pricing cockpit with 13.8% GST schedule |
| `/contracts` | Authenticated | `(erp)` | Legal EPC agreements and milestone tracking |
| `/contracts/[id]` | Authenticated | `(erp)` | Contract signing and milestone verification |
| `/sales-orders` | Authenticated | `(erp)` | Sales orders with 4-gate prerequisite checking |
| `/sales-orders/[id]`| Authenticated | `(erp)` | Sales order confirmation and project handoff |
| `/suppliers` | Authenticated | `(erp)` | Master vendor registry and product mappings |
| `/suppliers/[id]` | Authenticated | `(erp)` | Supplier 360 workspace |
| `/procurement` | Authenticated | `(erp)` | Procurement operations cockpit |
| `/procurement/requirements` | Authenticated | `(erp)` | MRP net requirement calculations |
| `/procurement/requisitions` | Authenticated | `(erp)` | Purchase requisitions & approval gates |
| `/procurement/rfqs` | Authenticated | `(erp)` | RFQ bidding & vendor quotation comparison |
| `/procurement/purchase-orders` | Authenticated | `(erp)` | PO lifecycle & multi-revision versioning |
| `/procurement/grns` | Authenticated | `(erp)` | Inward gate entry & quality inspections |
| `/procurement/serials` | Authenticated | `(erp)` | Module & inverter barcode serial tracking |
| `/procurement/returns` | Authenticated | `(erp)` | Supplier returns & debit notes |
| `/settings/*` | Authenticated | `(erp)` | IAM, users, roles, organizations, and audit logs |

---

## 2. Invariant & Redirection Safety

- Root `/` renders the marketing website.
- Authenticated visitors can navigate directly to `/dashboard`.
- Unauthenticated visitors clicking ERP links are guided through `/login` or `/signup`.
