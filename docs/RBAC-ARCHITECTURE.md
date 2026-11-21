# SolarOS ERP — RBAC Architecture & Evaluation Engine

## 1. Architectural Model
SolarOS RBAC combines role-based authorization with multi-tenant scoping:
`User` $\to$ `OrganizationMembership` $\to$ `MembershipRole` $\to$ `Role` $\to$ `RolePermission` $\to$ `Permission`.

## 2. Guard Pipeline
Every secured HTTP endpoint executes three centralized guards:
1. **`AuthenticationGuard`**:
   - Resolves caller from `solaros_session` cookie or `Authorization: Bearer <token>`.
   - Validates session expiry and account status (`isActive`, `lockedUntil`, `status`).
   - Populates `req.user` and `req.session`.
2. **`TenantContextGuard`**:
   - Resolves target organization from `x-tenant-id` header or session.
   - Enforces membership verification (superadmins bypass).
   - Resolves effective permissions via `AccessControlService`.
   - Populates `req.tenantContext`.
3. **`PermissionsGuard`**:
   - Evaluates handler metadata (`@RequirePermissions(...)`).
   - Verifies caller has all required permissions for the active tenant.
   - Rejects unpermitted requests with `403 Forbidden`.

## 3. Scopes & Record-Level Visibility
Roles declare an access scope:
- `ORGANIZATION`: Unrestricted visibility across all records in the tenant.
- `BRANCH`: Restricted to records associated with the user's assigned branch.
- `ASSIGNED`: Restricted to records where `assignedTechnicianId` or `assignedToId` matches user.
- `OWN`: Restricted to records created by the user.
