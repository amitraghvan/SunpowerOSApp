-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PLATFORM ADMIN & TENANT SUPPORT EXTENSION
-- ==============================================================================
-- Tables:
--   1. support_tickets
--   2. organization_subscriptions
--
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY
-- ==============================================================================

-- 1. Support Tickets
ALTER TABLE IF EXISTS "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "support_tickets" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_support_tickets ON "support_tickets";
CREATE POLICY tenant_isolation_support_tickets ON "support_tickets"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Organization Subscriptions
ALTER TABLE IF EXISTS "organization_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "organization_subscriptions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_organization_subscriptions ON "organization_subscriptions";
CREATE POLICY tenant_isolation_organization_subscriptions ON "organization_subscriptions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
