# SOLAROS ERP — SECURITY FOUNDATION SPECIFICATION

---

## 1. Security Architecture Pillars

SolarOS is designed under the **Zero Trust & Secure by Design** principles.

### 1. Authentication & Session Security
- **Argon2id:** Password hashing standard for first-party authentication credentials.
- **HTTP-Only Cookies:** Auth tokens stored in Secure, SameSite=Strict, HTTP-only cookies to eliminate XSS token theft.
- **Session Revocation:** Centralized `sessions` table allows immediate server-side revocation of compromised sessions.

### 2. Multi-Tenant Authorization (RBAC)
- **Role Scoping:** System roles (`SUPER_ADMIN`, `ORG_ADMIN`, `PROJECT_MANAGER`, `SOLAR_ENGINEER`, `TECHNICIAN`) and tenant-defined custom roles.
- **Granular Permissions:** Every endpoint checks permissions (e.g. `crm:read`, `inventory:write`) via `@solaros/api/src/common/guards/tenant.guard.ts`.
- **Database RLS:** PostgreSQL Row-Level Security ensures that even if an application SQL bug occurs, cross-tenant data leakage is prevented at the database kernel level.

### 3. API Hardening
- **Helmet:** Enforces CSP, HSTS, X-Content-Type-Options, Frameguard.
- **CORS:** Strict origin whitelisting matching `CORS_ORIGIN`.
- **Correlation IDs:** Every request tagged with `x-correlation-id` for security auditing and forensic analysis.
- **DTO Whitelisting:** `ValidationPipe` with `forbidNonWhitelisted: true` prevents mass assignment vulnerabilities.

### 4. Storage Security
- **Private S3 / MinIO Buckets:** All uploaded customer documents and survey photos are strictly private by default.
- **Presigned URLs:** Time-limited presigned URLs (expiring in 15 minutes) are generated for authorized file access.
