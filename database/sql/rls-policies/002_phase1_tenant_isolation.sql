-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 1 EXTENSION
-- ==============================================================================
-- Tables: CRM, Customer 360, Site Surveys, Solar Product Catalog
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY (applies to owner & app user alike)
-- ==============================================================================

-- 1. CRM & Lead Management
ALTER TABLE IF EXISTS "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "leads" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_leads ON "leads";
CREATE POLICY tenant_isolation_leads ON "leads"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "lead_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "lead_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lead_activities ON "lead_activities";
CREATE POLICY tenant_isolation_lead_activities ON "lead_activities"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "lead_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "lead_status_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_lead_status_history ON "lead_status_history";
CREATE POLICY tenant_isolation_lead_status_history ON "lead_status_history"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Customer Management & Customer 360
ALTER TABLE IF EXISTS "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customers ON "customers";
CREATE POLICY tenant_isolation_customers ON "customers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "customer_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_contacts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_contacts ON "customer_contacts";
CREATE POLICY tenant_isolation_customer_contacts ON "customer_contacts"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "customer_addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_addresses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_addresses ON "customer_addresses";
CREATE POLICY tenant_isolation_customer_addresses ON "customer_addresses"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "customer_sites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_sites" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_sites ON "customer_sites";
CREATE POLICY tenant_isolation_customer_sites ON "customer_sites"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Site Surveys & Assessments
ALTER TABLE IF EXISTS "surveys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "surveys" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_surveys ON "surveys";
CREATE POLICY tenant_isolation_surveys ON "surveys"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "survey_revisions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "survey_revisions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_survey_revisions ON "survey_revisions";
CREATE POLICY tenant_isolation_survey_revisions ON "survey_revisions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "survey_photos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "survey_photos" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_survey_photos ON "survey_photos";
CREATE POLICY tenant_isolation_survey_photos ON "survey_photos"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Solar Product Catalog
ALTER TABLE IF EXISTS "product_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_categories" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_categories ON "product_categories";
CREATE POLICY tenant_isolation_product_categories ON "product_categories"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "manufacturers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "manufacturers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_manufacturers ON "manufacturers";
CREATE POLICY tenant_isolation_manufacturers ON "manufacturers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "products" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_products ON "products";
CREATE POLICY tenant_isolation_products ON "products"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_variants" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_variants ON "product_variants";
CREATE POLICY tenant_isolation_product_variants ON "product_variants"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "product_attribute_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_attribute_definitions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_attr_defs ON "product_attribute_definitions";
CREATE POLICY tenant_isolation_product_attr_defs ON "product_attribute_definitions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "product_attribute_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_attribute_values" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_attr_vals ON "product_attribute_values";
CREATE POLICY tenant_isolation_product_attr_vals ON "product_attribute_values"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

ALTER TABLE IF EXISTS "product_price_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_price_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_price_hist ON "product_price_history";
CREATE POLICY tenant_isolation_product_price_hist ON "product_price_history"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
