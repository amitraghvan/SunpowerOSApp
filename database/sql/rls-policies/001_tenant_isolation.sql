-- ==============================================================================
-- SOLAROS MULTI-TENANCY ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- These policies enforce tenant isolation directly at the database engine level.
-- In session-pooled architectures, the application sets the active tenant context
-- using: SET LOCAL app.current_organization_id = '<uuid>';
-- FORCE ROW LEVEL SECURITY ensures that even table owners and application
-- connections are strictly constrained by tenant isolation rules.
-- ==============================================================================

-- 1. Enable & Force RLS on Tenant-Scoped Tables
ALTER TABLE IF EXISTS "organization_branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "organization_branches" FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "organization_memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "organization_memberships" FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "audit_logs" FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "outbox_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "outbox_events" FORCE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS "idempotency_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "idempotency_records" FORCE ROW LEVEL SECURITY;

-- 2. Tenant Context Access Rule: Organization Branches
DROP POLICY IF EXISTS tenant_isolation_branches ON "organization_branches";
CREATE POLICY tenant_isolation_branches ON "organization_branches"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Tenant Context Access Rule: Outbox Events
DROP POLICY IF EXISTS tenant_isolation_outbox ON "outbox_events";
CREATE POLICY tenant_isolation_outbox ON "outbox_events"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Tenant Context Access Rule: Idempotency Records
DROP POLICY IF EXISTS tenant_isolation_idempotency ON "idempotency_records";
CREATE POLICY tenant_isolation_idempotency ON "idempotency_records"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
