# SOLAROS ERP — MULTI-TENANCY ARCHITECTURE

---

## 1. Multi-Tenancy Strategy

SolarOS employs a **Shared Database, Shared Schema with Logical Isolation and Row-Level Security** model.

### Key Justifications:
- **Operational Cost & Maintenance:** Running 40+ solar EPC tenants on independent databases would require massive operational overhead, complex migrations, and excessive connection pool exhaustion.
- **Tenant Isolation:** Enforced via dual-layer protection:
  1. **Application Layer:** NestJS `TenantContextMiddleware` and `TenantGuard` resolve tenant context strictly from verified session tokens, preventing arbitrary header spoofing.
  2. **Database Engine Layer:** PostgreSQL Row-Level Security (RLS) policies enforce isolation at the SQL query execution level.

---

## 2. Request Resolution Lifecycle

```text
HTTP Request
     |
     v
[CorrelationIdMiddleware] -> Assigns unique x-correlation-id
     |
     v
[TenantContextMiddleware] -> Reads authenticated JWT/Session
                          -> Extracts userId & verified organizationId
                          -> Attaches TenantContext to request object
     |
     v
[TenantGuard]             -> Asserts valid active organizationId
     |
     v
[Prisma / Service Layer]  -> Sets PostgreSQL session variable:
                             SET LOCAL app.current_organization_id = :orgId;
                          -> Injects organizationId filter into query
     |
     v
PostgreSQL RLS Engine     -> Evaluates policy: "organizationId" = current_setting('app.current_organization_id')
     |
     v
Response Returned
```

---

## 3. Security Rules for Multi-Tenancy

1. **No Client-Dictated Isolation:** The frontend cannot select an arbitrary organization without having a valid, active `OrganizationMembership` record for that organization.
2. **Branch Scoping:** Within a tenant, users can be assigned to a specific `OrganizationBranch` (e.g. North Warehouse, South Installation Hub).
3. **Cross-Tenant Data Leakage Prevention:** Integration tests verify negative scenarios: attempting to fetch or mutate Organization B's data while authenticated as Organization A yields a 403 Forbidden or 404 Not Found.
