# SolarOS Phase 2 Database Schema Architecture

## 1. Schema Extensions Summary

Phase 2 introduces 16 new entity models in `database/prisma/schema.prisma` with comprehensive foreign keys, tenant scoping, and PostgreSQL Row-Level Security:

```
DocumentSequence              (Tenant scoped atomic sequence counters)
EngineeringStandard           (Statutory compliance standards)
EngineeringDesign             (Top-level engineering design entity)
EngineeringDesignRevision     (Immutable versioned revisions)
CalculationRun                (Audit log of calculation runs & physics metrics)
BillOfMaterials               (Frozen BOM entity)
BOMItem                       (Categorized BOM line items with wastage allowance)
TaxConfiguration              (Indian GST rate configuration)
CostEstimate                  (Componentized cost and margin breakdown)
Quotation                     (Commercial quotation entity)
QuotationVersion              (Version snapshots of quotations)
QuotationItem                 (Quotation bill lines)
Contract                      (Legal EPC contract agreement)
ContractPaymentMilestone      (Milestone release schedule)
SalesOrder                    (Firm sales order with prerequisite tracking)
SalesOrderMilestone           (Order-specific fulfillment milestones)
ProjectInitiation             (Downstream handoff record)
```

## 2. Relational Integrity & RLS Policies

- Every organization-owned table includes an `organizationId` column.
- Row-Level Security is strictly enforced using `FORCE ROW LEVEL SECURITY`.
- `solaros_app` role accesses data only through `app.current_organization_id` transaction context.
- Reverse relations link Designs, Quotes, Contracts, and Sales Orders back to `Organization`, `Customer`, `CustomerSite`, and `User`.
