-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 0.5 IAM & INVITATIONS
-- ==============================================================================

-- 1. Grant permissions on new tables to non-superuser solaros_app
GRANT ALL PRIVILEGES ON TABLE "password_reset_tokens" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "email_verification_tokens" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "organization_invitations" TO solaros_app;

-- 2. Organization Memberships RLS Policy
DROP POLICY IF EXISTS tenant_isolation_memberships ON "organization_memberships";
CREATE POLICY tenant_isolation_memberships ON "organization_memberships"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Audit Logs RLS Policy
DROP POLICY IF EXISTS tenant_isolation_audit_logs ON "audit_logs";
CREATE POLICY tenant_isolation_audit_logs ON "audit_logs"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Organization Invitations RLS Policy
ALTER TABLE IF EXISTS "organization_invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "organization_invitations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_organization_invitations ON "organization_invitations";
CREATE POLICY tenant_isolation_organization_invitations ON "organization_invitations"
  FOR ALL
  USING (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    NULLIF(current_setting('app.current_organization_id', true), '') IS NULL
    OR "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
