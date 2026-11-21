# SOLAROS ERP — PHASE 0.5 BASELINE AUDIT
## Identity, Authentication, RBAC, Multi-Tenant Access Control & Application Integration Audit

---

## 1. Executive Summary

This audit assesses the state of Identity and Access Management (IAM), Authentication, Role-Based Access Control (RBAC), and Tenant Context enforcement across SolarOS ERP prior to Phase 0.5 execution.

The codebase features established foundational infrastructure (PostgreSQL 14, Redis 7, MinIO, BullMQ) and verified commercial business modules (CRM, Customer 360, Site Survey, Solar Product Catalog). However, authentication is currently unintegrated: the frontend uses a mock static login page and hardcoded demo tenant headers, while backend controllers rely on basic header-based `TenantGuard` rather than authenticated sessions and fine-grained RBAC evaluation.

---

## 2. Component Inventory & Status Classification

Statuses:
- `VERIFIED_WORKING`: Implemented, tested, and actively functioning.
- `IMPLEMENTED_NOT_VERIFIED`: Code exists but lacks comprehensive test coverage.
- `PARTIALLY_IMPLEMENTED`: Architectural structure exists but missing key functional logic.
- `NOT_IMPLEMENTED`: Folder or interface placeholder only.
- `BROKEN`: Code contains runtime errors or invalid configurations.
- `NOT_APPLICABLE`: Out of scope for current phase.

| Component / Layer | Existing File Path | Status | Finding & Required Integration Changes |
| :--- | :--- | :---: | :--- |
| **User Entity** | `database/prisma/schema.prisma` (`model User`) | `PARTIALLY_IMPLEMENTED` | Basic fields exist (`email`, `passwordHash`, `firstName`, `lastName`). Missing: account lifecycle status (`ACTIVE`, `SUSPENDED`, `INVITED`), 2FA secret, failed attempt tracking, lockout timestamps. |
| **Session Entity** | `database/prisma/schema.prisma` (`model Session`) | `PARTIALLY_IMPLEMENTED` | Table exists with `tokenHash`, `expiresAt`, `revokedAt`. Missing: session rotation, refresh tokens, activity tracking, device metadata. |
| **Role & Permission Entities** | `database/prisma/schema.prisma` (`model Role`, `Permission`, `MembershipRole`, `RolePermission`) | `PARTIALLY_IMPLEMENTED` | Basic join tables exist. Missing: record-level scope (`OWN`, `BRANCH`, `ORGANIZATION`), action types, dynamic permission registry, effective permission evaluator. |
| **Authentication APIs** | `apps/api/src/modules/identity/` | `NOT_IMPLEMENTED` | Only scaffolded `identity.module.ts` exists. No login, logout, password reset, or session management controllers exist. |
| **Access Control Engine** | `apps/api/src/modules/access-control/` | `NOT_IMPLEMENTED` | Only scaffolded `access-control.module.ts` exists. No permission evaluation service or decorators exist. |
| **TenantGuard & Middleware** | `apps/api/src/common/guards/tenant.guard.ts`, `middleware/tenant-context.middleware.ts` | `PARTIALLY_IMPLEMENTED` | Simply reads `x-organization-id` header without verifying session tokens or user membership. Vulnerable to header spoofing. Must be replaced with session-backed `AuthenticationGuard` + `TenantContextGuard`. |
| **Permission Decorators** | `apps/api/src/common/decorators/` | `NOT_IMPLEMENTED` | Missing `@RequirePermissions(...)`, `@RequireResourceAccess(...)`. |
| **Frontend Login** | `apps/web/src/app/(auth)/login/page.tsx` | `NOT_IMPLEMENTED` | Static UI form with `e.preventDefault()`. No backend authentication, cookie handling, or error feedback. |
| **Frontend Shell & Nav** | `apps/web/src/components/layout/` (`header.tsx`, `sidebar.tsx`, `tenant-switcher.tsx`, `user-nav.tsx`) | `PARTIALLY_IMPLEMENTED` | Hardcoded mock "Admin User", "Default Organization". Blue SaaS theme conflicts with required Odoo-inspired enterprise visual design. |
| **CRM Integration** | `apps/api/src/modules/crm/` | `VERIFIED_WORKING` | Business logic & RLS verified. Needs `@RequirePermissions(...)` on all 9 endpoints and real user attribution instead of `'anonymous'`. |
| **Customer Integration** | `apps/api/src/modules/customers/` | `VERIFIED_WORKING` | Business logic & RLS verified. Needs `@RequirePermissions(...)` on all 9 endpoints. |
| **Survey Integration** | `apps/api/src/modules/surveys/` | `VERIFIED_WORKING` | Feasibility & MinIO verified. Needs role separation (Engineer submits, Reviewer approves). |
| **Catalog Integration** | `apps/api/src/modules/catalog/` | `VERIFIED_WORKING` | Specs & price history verified. Needs permission check on price adjustment. |
| **Phase 2 Modules** | `apps/api/src/modules/{engineering, quotations, contracts, sales-orders}/` | `NOT_IMPLEMENTED` | Scaffolded `*.module.ts` files only. Prepare IAM permission registry without creating fake Phase 2 business data. |
| **PostgreSQL RLS Policies** | `database/sql/rls-policies/` | `VERIFIED_WORKING` | `FORCE ROW LEVEL SECURITY` enforced on all 17 Phase 1 tables. Must extend to new IAM models. |

---

## 3. Infrastructure & Connection Verification

1. **PostgreSQL 14.20:** Native Homebrew service running on port 5432. Dedicated non-superuser `solaros_app` has verified credentials and schema permissions.
2. **Prisma Connection Warning Root Cause:** `apps/api/src/config/env.validation.ts` previously defaulted `DATABASE_URL` to non-existent `postgres:postgres_local_password`. `PrismaService` will be updated to default to `solaros_app:solaros_secret_app_pw`, eliminating the startup warning.
3. **Redis 7:** Running on `127.0.0.1:6379`. Tested and functional.
4. **MinIO Object Storage:** Running on `127.0.0.1:9000`. Verified buckets: `solaros-documents`, `solaros-surveys`, `solaros-assets`.

---

## 4. Required Phase 0.5 Implementation Plan

1. **Database Schema Enhancements:**
   - Extend `User` with status, 2FA fields, lockout tracking.
   - Add `PasswordResetToken`, `EmailVerificationToken`, `OrganizationInvitation`.
   - Extend `Role` and `Permission` with granular actions and record scopes.
   - Run migration `phase0_5_identity_and_access_control` and apply RLS policies.
2. **Centralized Authentication Service:**
   - Argon2id password hashing.
   - Opaque server-side sessions with SHA-256 token hashing and Redis rate limiting.
   - Secure HTTP-only cookies (`solaros_session`).
   - Login, logout, session verification (`/auth/me`), password recovery, and TOTP 2FA.
3. **Centralized RBAC Engine:**
   - System roles (`PLATFORM_SUPER_ADMIN`, `ORG_OWNER`, `ORG_ADMIN`, `SALES_MANAGER`, `SALES_EXECUTIVE`, `SURVEY_ENGINEER`, `SURVEY_REVIEWER`, `CATALOG_MANAGER`, `SOLAR_ENGINEER`, `PROCUREMENT_OFFICER`).
   - Granular Permission Registry across all domains.
   - `@RequirePermissions(...)` decorator and `PermissionsGuard`.
4. **Controller-Level Security Integration:**
   - Secure all endpoints across CRM, Customers, Surveys, Catalog, Organizations, and Identity with real authentication & permissions.
5. **Odoo 19-Inspired UI Overhaul:**
   - Clean enterprise design tokens (`--odoo-brand-primary: #714B67`, `--odoo-action: #017E84`, `--odoo-background: #F6F6F6`).
   - System typography stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`).
   - Top navigation with App Launcher, Organization & Branch switchers, real User menu.
   - Complete IAM administration screens: Users, Roles, Permissions, Organizations, Branches, Sessions, Security Dashboard, and Audit Logs.
   - Refactor CRM, Customers, Surveys, and Catalog into the unified Odoo design system.
6. **Automated Verification:**
   - Real test suites verifying authentication, token rotation, session expiry, role evaluation, RLS isolation, and protected API endpoints.
