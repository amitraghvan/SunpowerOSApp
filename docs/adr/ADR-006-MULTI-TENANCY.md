# ADR-006: Multi-Tenancy Architecture (Shared Database with RLS)

## Status
Accepted

## Context
SolarOS must support multiple solar installation companies as a SaaS platform while keeping infrastructure costs sustainable and preventing cross-tenant data leakage.

## Decision
We adopt a **Shared Database, Shared Schema with Logical Multi-Tenancy backed by PostgreSQL Row-Level Security (RLS)**:
1. Every tenant-owned table contains `organizationId UUID NOT NULL`.
2. Tenant context is authenticated via session tokens/JWTs in `TenantContextMiddleware`.
3. Client-provided tenant headers are never trusted blindly; they are verified against the user's `organization_memberships`.
4. PostgreSQL RLS policies enforce isolation directly at the database engine.

## Consequences
- **Positive:** Cost-effective infrastructure scaling, simple centralized database maintenance, dual-layer security protection.
- **Negative:** Application connection pools must properly reset or manage local session variables (`SET LOCAL app.current_organization_id`).
