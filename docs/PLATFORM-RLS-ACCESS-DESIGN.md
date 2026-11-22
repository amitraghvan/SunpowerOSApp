# SUNPOWEROS — PLATFORM ROW-LEVEL SECURITY (RLS) ACCESS DESIGN

## 1. Multi-Tenant RLS Foundation
In SunPowerOS, tenant isolation is enforced at the database engine level using PostgreSQL 14 Row-Level Security:
- Tables are secured using:
  ```sql
  ALTER TABLE "table_name" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "table_name" FORCE ROW LEVEL SECURITY;
  ```
- Active tenant isolation policy:
  ```sql
  CREATE POLICY tenant_isolation_policy ON "table_name"
    FOR ALL
    USING (
      "organizationId" = current_setting('app.current_organization_id', true)
      OR current_setting('app.is_super_admin', true) = 'true'
    )
    WITH CHECK (
      "organizationId" = current_setting('app.current_organization_id', true)
      OR current_setting('app.is_super_admin', true) = 'true'
    );
  ```

---

## 2. Platform Admin Authorization Context
When platform administrators access cross-tenant SaaS metrics, organization lists, or global user directories from `http://localhost:3001`, their requests pass through:
1. `PlatformAdminGuard`: Validates session token, checks that user has `isSuperAdmin = true`, and verifies `PlatformAdministrator` record.
2. `this.prisma.asSuperAdmin(async (tx) => { ... })`:
   - Runs inside a database transaction.
   - Executes: `SET LOCAL app.is_super_admin = 'true'`.
   - Satisfies `current_setting('app.is_super_admin', true) = 'true'`.
   - Allows safe, authorized inspection of tenant counts, memberships, branches, and storage consumption.
3. Connection Pool Cleanliness:
   - Because `SET LOCAL` is scoped strictly to the active transaction, the setting is immediately discarded when the transaction ends, preventing context leakage to subsequent queries.
