# SolarOS ERP — PostgreSQL Row-Level Security Coverage

## 1. Database Table RLS Audit
Below is the verification audit of PostgreSQL public tables in database `solaros_dev`:

| Table Name | RLS Enabled | FORCE RLS | Isolation Policy Name | Condition |
| :--- | :---: | :---: | :--- | :--- |
| `organization_branches` | YES | YES | `tenant_isolation_branches` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `organization_memberships`| YES | YES | `tenant_isolation_memberships`| `organizationId = app.current_organization_id OR app.current_organization_id IS NULL` |
| `organization_invitations`| YES | YES | `tenant_isolation_organization_invitations` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `leads` | YES | YES | `tenant_isolation_leads` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `lead_activities` | YES | YES | `tenant_isolation_lead_activities`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `lead_status_history` | YES | YES | `tenant_isolation_lead_status_history`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `customers` | YES | YES | `tenant_isolation_customers` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `customer_contacts` | YES | YES | `tenant_isolation_customer_contacts` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `customer_addresses` | YES | YES | `tenant_isolation_customer_addresses`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `customer_sites` | YES | YES | `tenant_isolation_customer_sites` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `surveys` | YES | YES | `tenant_isolation_surveys` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `survey_revisions` | YES | YES | `tenant_isolation_survey_revisions` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `survey_photos` | YES | YES | `tenant_isolation_survey_photos` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `products` | YES | YES | `tenant_isolation_products` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_variants` | YES | YES | `tenant_isolation_product_variants` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_categories` | YES | YES | `tenant_isolation_product_categories`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `manufacturers` | YES | YES | `tenant_isolation_manufacturers` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_price_history` | YES | YES | `tenant_isolation_product_price_history`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_attribute_definitions`| YES | YES | `tenant_isolation_product_attribute_definitions`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `product_attribute_values`| YES | YES | `tenant_isolation_product_attribute_values`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `outbox_events` | YES | YES | `tenant_isolation_outbox` | `"organizationId" = current_setting('app.current_organization_id', true)` |
| `idempotency_records` | YES | YES | `tenant_isolation_idempotency`| `"organizationId" = current_setting('app.current_organization_id', true)` |
| `audit_logs` | YES | YES | `tenant_isolation_audit_logs` | `"organizationId" = current_setting('app.current_organization_id', true)` |

*Note: Global platform tables `users`, `roles`, `permissions`, `sessions`, `password_reset_tokens`, and `organizations` are managed globally with strict application-level tenant context and user-ownership queries.*
