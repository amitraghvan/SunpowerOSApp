# SolarOS ERP — Multi-Tenancy Security & Isolation Model

## 1. Zero-Leakage Architecture
In a multi-tenant Solar EPC SaaS, data isolation between competing solar installation companies must be guaranteed at the database engine level. SolarOS eliminates cross-tenant data leakage by enforcing:
1. **PostgreSQL Row-Level Security (RLS)**: Enforced via `ALTER TABLE ... FORCE ROW LEVEL SECURITY`.
2. **Dedicated App Role**: Application operates as non-superuser role `solaros_app` (no `SUPERUSER` or `BYPASSRLS` privileges).
3. **Session Variable Context**: Every transactional database query sets `SET LOCAL app.current_organization_id = '<uuid>'`.
4. **Interactive Transactions**: Using `prisma.forTenant(orgId, tx => ...)`, the variable is strictly scoped to the transaction lifetime and reset on connection return to the pool.

## 2. Attack Vectors & Defenses
- **Cross-Tenant ID Tampering**: If a client sends an `id` belonging to another organization in `PATCH /api/v1/crm/leads/:id`, the query returns `404 Not Found` because PostgreSQL RLS renders other tenant records invisible.
- **Header Spoofing**: If a user tampers with `x-tenant-id` header to claim another organization, `TenantContextGuard` verifies membership in PostgreSQL before processing the request; non-members receive `403 Forbidden`.
- **SQL Injection Defense**: All queries run through Prisma parameterized SQL or sanitized `$executeRawUnsafe` parameters.
