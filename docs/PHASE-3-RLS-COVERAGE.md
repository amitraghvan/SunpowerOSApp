# SolarOS Phase 3 PostgreSQL Row-Level Security Coverage

## 1. Overview

Multi-tenant isolation for all Phase 3 tables is enforced at the database engine level via PostgreSQL Row-Level Security (RLS) policies defined in `database/sql/rls-policies/005_phase3_tenant_isolation.sql`.

Every query executed by the backend application sets the PostgreSQL session context:
```sql
SET LOCAL app.current_organization_id = '<current_tenant_uuid>';
```
Any attempt to query, insert, update, or delete records belonging to another tenant is blocked by the database engine, returning an empty result set or raising a constraint violation.

---

## 2. Verification Audit of Phase 3 Tables

| Table Name | RLS Enabled | FORCE RLS | Isolation Policy Name | Condition Enforced |
| :--- | :---: | :---: | :--- | :--- |
| `suppliers` | YES | YES | `tenant_isolation_suppliers` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_contacts` | YES | YES | `tenant_isolation_supplier_contacts` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_addresses` | YES | YES | `tenant_isolation_supplier_addresses` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_bank_accounts` | YES | YES | `tenant_isolation_supplier_bank_accounts` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_documents` | YES | YES | `tenant_isolation_supplier_documents` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_product_mappings` | YES | YES | `tenant_isolation_supplier_product_mappings` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_price_history` | YES | YES | `tenant_isolation_supplier_price_history` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `material_requirements` | YES | YES | `tenant_isolation_material_requirements` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `material_requirement_lines` | YES | YES | `tenant_isolation_material_requirement_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `purchase_requisitions` | YES | YES | `tenant_isolation_purchase_requisitions` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `purchase_requisition_lines` | YES | YES | `tenant_isolation_purchase_requisition_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `rfqs` | YES | YES | `tenant_isolation_rfqs` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `rfq_lines` | YES | YES | `tenant_isolation_rfq_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `rfq_suppliers` | YES | YES | `tenant_isolation_rfq_suppliers` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_quotations` | YES | YES | `tenant_isolation_supplier_quotations` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_quotation_lines` | YES | YES | `tenant_isolation_supplier_quotation_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `purchase_orders` | YES | YES | `tenant_isolation_purchase_orders` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `purchase_order_lines` | YES | YES | `tenant_isolation_purchase_order_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `purchase_delivery_schedules` | YES | YES | `tenant_isolation_purchase_delivery_schedules` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `inventory_locations` | YES | YES | `tenant_isolation_inventory_locations` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `goods_receipt_notes` | YES | YES | `tenant_isolation_goods_receipt_notes` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `goods_receipt_lines` | YES | YES | `tenant_isolation_goods_receipt_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `quality_inspections` | YES | YES | `tenant_isolation_quality_inspections` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_serials` | YES | YES | `tenant_isolation_product_serials` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `inventory_receipt_movements` | YES | YES | `tenant_isolation_inventory_receipt_movements` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_returns` | YES | YES | `tenant_isolation_supplier_returns` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `supplier_return_lines` | YES | YES | `tenant_isolation_supplier_return_lines` | `"organizationId" = current_setting('app.current_organization_id', true)` |

---

## 3. Super-Admin Bypass Condition

Each policy includes a secure bypass condition reserved exclusively for platform operations:
```sql
OR current_setting('app.is_super_admin', true) = 'true'
```
This is only active when explicitly enabled in system worker contexts (e.g. background data maintenance or platform migrations) and cannot be triggered by normal web API sessions.
