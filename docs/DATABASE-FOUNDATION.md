# SOLAROS ERP — DATABASE FOUNDATION SPECIFICATION

---

## 1. Overview & Strategy

The SolarOS database layer is powered by **PostgreSQL 16** (in Docker Compose and Production) and supports **PostgreSQL 14+** (in local native Homebrew development, currently running PostgreSQL 14.20) with **Prisma ORM 6.19+**. It is designed for multi-tenant enterprise reliability, audit traceability, and zero data loss.

---

## 2. Core Foundation Entities (Phase 0)

| Table | Entity Description | Primary Key | Tenant Isolation |
| :--- | :--- | :--- | :--- |
| `organizations` | Tenant accounts (Solar EPC installation companies) | UUID v4 | Root Tenant Entity |
| `organization_branches`| Regional branches, physical offices, or warehouses | UUID v4 | Scoped to `organizationId` |
| `users` | Global user profiles (staff, technicians, customers) | UUID v4 | Shared identity layer |
| `organization_memberships`| Tenant membership linking user to organization & branch | UUID v4 | Scoped to `organizationId` |
| `roles` | System roles & tenant-specific custom roles | UUID v4 | Nullable `organizationId` (NULL = System) |
| `permissions` | Granular permission capabilities (`crm:read`, etc.) | UUID v4 | Global catalog |
| `membership_roles` | Join table binding membership to roles | UUID v4 | Indirectly tenant-scoped |
| `role_permissions` | Join table binding roles to permissions | UUID v4 | Indirectly tenant-scoped |
| `sessions` | Active user login sessions & tokens | UUID v4 | Scoped to `organizationId` |
| `audit_logs` | Immutable audit trail for all business actions | UUID v4 | Scoped to `organizationId` |
| `outbox_events` | Transactional outbox table for reliable async events | UUID v4 | Scoped to `organizationId` |
| `idempotency_records` | Enforces request idempotency on mutating operations | UUID v4 | Scoped to `organizationId` |

---

## 3. Database Conventions

1. **Primary Keys:** Strictly UUID v4 (`@default(uuid())`). No auto-incrementing serial IDs to prevent enumeration attacks across tenants.
2. **Financial Precision:** Future monetary fields must strictly use PostgreSQL `DECIMAL(15, 2)` or `DECIMAL(18, 4)` for currency calculations.
3. **Timestamps:** UTC `TIMESTAMP WITH TIME ZONE` via `@default(now())` and `@updatedAt`.
4. **Soft Deletion:** Business entities support soft deletion using nullable `deletedAt DateTime?`.
5. **Foreign Keys:** Explicit relational integrity with cascading rules (`onDelete: Cascade` for child records, `onDelete: SetNull` for audits).

---

## 4. Multi-Tenancy Row-Level Security (RLS)

In addition to Prisma application-layer filtering, PostgreSQL RLS policies in `database/sql/rls-policies/001_tenant_isolation.sql` protect data at the storage engine level.
Connections set the current tenant context using:
```sql
SET LOCAL app.current_organization_id = '<organization_uuid>';
```
Any query attempting to read or mutate records outside this context is rejected by PostgreSQL.
