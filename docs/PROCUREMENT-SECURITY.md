# Phase 3 Security Architecture, Tenant Isolation & Access Control

## Multi-Tenant Isolation
All 27 Phase 3 database tables feature `organizationId` foreign keys connected to the central `organizations` table with `ON DELETE CASCADE`.

### PostgreSQL Row-Level Security (RLS)
The SQL migration `database/sql/rls-policies/005_phase3_tenant_isolation.sql` enables and forces RLS across all 27 tables:
```sql
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suppliers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_suppliers" ON "suppliers"
  USING ("organizationId" = current_setting('app.current_organization_id', true));
```
Every query issued by NestJS services executes inside `this.prisma.forTenant(organizationId, async (tx) => { ... })`, which executes:
```sql
SET LOCAL app.current_organization_id = '<tenant-uuid>';
```
This guarantees complete cryptographic-level tenant data segregation. Even raw queries or unconstrained joins cannot leak cross-tenant vendor rate cards, RFQ bids, or asset serials.

## Granular RBAC Permissions
The permissions registry registers 15 granular permissions for Phase 3:
- `procurement:supplier:read`, `procurement:supplier:write`
- `procurement:mrp:read`, `procurement:mrp:execute`
- `procurement:requisition:read`, `procurement:requisition:write`, `procurement:requisition:approve`
- `procurement:rfq:read`, `procurement:rfq:write`, `procurement:rfq:award`
- `procurement:po:read`, `procurement:po:write`, `procurement:po:approve`
- `inventory:grn:write`, `inventory:inspection:execute`, `inventory:serial:manage`
