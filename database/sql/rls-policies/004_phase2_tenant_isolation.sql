-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 2 EXTENSION
-- ==============================================================================
-- Tables: Document Sequences, Engineering Designs, Revisions, Calculation Runs,
--         BOM, BOM Items, Tax Configurations, Cost Estimates, Quotations,
--         Quotation Versions, Quotation Items, Contracts, Contract Milestones,
--         Sales Orders, Sales Order Milestones, Project Initiations.
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY (applies to owner & app user alike)
-- ==============================================================================

-- 1. Document Sequences
ALTER TABLE IF EXISTS "document_sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "document_sequences" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_document_sequences ON "document_sequences";
CREATE POLICY tenant_isolation_document_sequences ON "document_sequences"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Engineering Designs
ALTER TABLE IF EXISTS "engineering_designs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "engineering_designs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_engineering_designs ON "engineering_designs";
CREATE POLICY tenant_isolation_engineering_designs ON "engineering_designs"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Engineering Design Revisions
ALTER TABLE IF EXISTS "engineering_design_revisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "engineering_design_revisions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_engineering_design_revisions ON "engineering_design_revisions";
CREATE POLICY tenant_isolation_engineering_design_revisions ON "engineering_design_revisions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Calculation Runs
ALTER TABLE IF EXISTS "calculation_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "calculation_runs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_calculation_runs ON "calculation_runs";
CREATE POLICY tenant_isolation_calculation_runs ON "calculation_runs"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 5. Bills of Materials
ALTER TABLE IF EXISTS "bills_of_materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "bills_of_materials" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bills_of_materials ON "bills_of_materials";
CREATE POLICY tenant_isolation_bills_of_materials ON "bills_of_materials"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 6. BOM Items
ALTER TABLE IF EXISTS "bom_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "bom_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_bom_items ON "bom_items";
CREATE POLICY tenant_isolation_bom_items ON "bom_items"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 7. Tax Configurations
ALTER TABLE IF EXISTS "tax_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "tax_configurations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_tax_configurations ON "tax_configurations";
CREATE POLICY tenant_isolation_tax_configurations ON "tax_configurations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 8. Cost Estimates
ALTER TABLE IF EXISTS "cost_estimates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "cost_estimates" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_cost_estimates ON "cost_estimates";
CREATE POLICY tenant_isolation_cost_estimates ON "cost_estimates"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 9. Quotations
ALTER TABLE IF EXISTS "quotations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quotations ON "quotations";
CREATE POLICY tenant_isolation_quotations ON "quotations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 10. Quotation Versions
ALTER TABLE IF EXISTS "quotation_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotation_versions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quotation_versions ON "quotation_versions";
CREATE POLICY tenant_isolation_quotation_versions ON "quotation_versions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 11. Quotation Items
ALTER TABLE IF EXISTS "quotation_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quotation_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quotation_items ON "quotation_items";
CREATE POLICY tenant_isolation_quotation_items ON "quotation_items"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 12. Contracts
ALTER TABLE IF EXISTS "contracts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contracts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_contracts ON "contracts";
CREATE POLICY tenant_isolation_contracts ON "contracts"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 13. Contract Payment Milestones
ALTER TABLE IF EXISTS "contract_payment_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "contract_payment_milestones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_contract_payment_milestones ON "contract_payment_milestones";
CREATE POLICY tenant_isolation_contract_payment_milestones ON "contract_payment_milestones"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 14. Sales Orders
ALTER TABLE IF EXISTS "sales_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "sales_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sales_orders ON "sales_orders";
CREATE POLICY tenant_isolation_sales_orders ON "sales_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 15. Sales Order Milestones
ALTER TABLE IF EXISTS "sales_order_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "sales_order_milestones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_sales_order_milestones ON "sales_order_milestones";
CREATE POLICY tenant_isolation_sales_order_milestones ON "sales_order_milestones"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 16. Project Initiations
ALTER TABLE IF EXISTS "project_initiations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "project_initiations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_project_initiations ON "project_initiations";
CREATE POLICY tenant_isolation_project_initiations ON "project_initiations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- GRANTS FOR solaros_app
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  "document_sequences",
  "engineering_standards",
  "engineering_designs",
  "engineering_design_revisions",
  "calculation_runs",
  "bills_of_materials",
  "bom_items",
  "tax_configurations",
  "cost_estimates",
  "quotations",
  "quotation_versions",
  "quotation_items",
  "contracts",
  "contract_payment_milestones",
  "sales_orders",
  "sales_order_milestones",
  "project_initiations"
TO solaros_app;
