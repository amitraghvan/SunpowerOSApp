# SOLAROS ERP — DATABASE PHASE 1 SPECIFICATION
## Extended Schema, Table Definitions, Indexes & Migration Details

---

## 1. Migration History

- Migration Name: `20261121100322_phase1_crm_customer_survey_catalog`
- Database: PostgreSQL 14 (Development), PostgreSQL 16 (Target)
- Schema: `public`

---

## 2. Table Catalog (17 Tables)

| Table Name | Primary Purpose | Foreign Keys | Tenant Scoped |
| :--- | :--- | :--- | :---: |
| `leads` | Solar sales prospects & inquiries | `organizationId`, `branchId`, `assignedToId`, `convertedCustomerId` | YES |
| `lead_activities` | Timeline activity notes & calls | `organizationId`, `leadId`, `userId` | YES |
| `lead_status_history` | State transition audit log | `organizationId`, `leadId` | YES |
| `customers` | Master commercial accounts | `organizationId` | YES |
| `customer_contacts` | Authorized contact persons | `organizationId`, `customerId` | YES |
| `customer_addresses` | Billing & site addresses | `organizationId`, `customerId` | YES |
| `customer_sites` | Installation rooftops & properties | `organizationId`, `customerId` | YES |
| `surveys` | Technical feasibility assessments | `organizationId`, `customerId`, `siteId`, `leadId`, `assignedTechnicianId` | YES |
| `survey_revisions` | Versioned assessment snapshots | `organizationId`, `surveyId`, `createdById` | YES |
| `survey_photos` | Field photo metadata | `organizationId`, `surveyId`, `uploadedById` | YES |
| `product_categories` | Solar equipment taxonomy | `organizationId` | YES |
| `manufacturers` | OEMs & hardware suppliers | `organizationId` | YES |
| `products` | Base solar models & specs | `organizationId`, `categoryId`, `manufacturerId` | YES |
| `product_variants` | Sellable SKUs & capacities | `organizationId`, `productId` | YES |
| `product_attribute_definitions` | Dynamic spec parameter rules | `organizationId`, `categoryId` | YES |
| `product_attribute_values` | Assigned spec values per model | `organizationId`, `productId`, `attributeDefinitionId` | YES |
| `product_price_history` | Temporal cost/selling price log | `organizationId`, `variantId`, `changedById` | YES |

---

## 3. Database Indexes

Every tenant-scoped table features a B-Tree index on `organizationId` to ensure optimal performance when queries evaluate RLS policies:
- `@@index([organizationId])` on all 17 tables.
- Compound unique constraints enforcing tenant uniqueness:
  - `leads`: `@@unique([organizationId, leadNumber])`
  - `customers`: `@@unique([organizationId, customerNumber])`
  - `surveys`: `@@unique([organizationId, surveyNumber])`
  - `product_categories`: `@@unique([organizationId, code])`
  - `manufacturers`: `@@unique([organizationId, code])`
  - `products`: `@@unique([organizationId, code])`
  - `product_variants`: `@@unique([organizationId, sku])`
  - `product_attribute_definitions`: `@@unique([organizationId, categoryId, code])`
