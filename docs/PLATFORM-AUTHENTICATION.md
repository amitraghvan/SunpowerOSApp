# SunPowerOS — Platform Authentication & Access Control

## 1. Authentication Separation

SunPowerOS enforces a strict boundary between customer tenant authentication (Port 3000) and platform administration authentication (Port 3001):

| Dimension | Customer ERP (Port 3000) | Platform Admin (Port 3001) |
| :--- | :--- | :--- |
| **Login Path** | `http://localhost:3000/login` | `http://localhost:3001/login` |
| **Auth Endpoint** | `POST /api/v1/auth/login` | `POST /api/v1/platform-admin/auth/login` |
| **Token Storage** | `solaros_access_token` in localStorage/Cookie | `solaros_platform_token` in localStorage |
| **User Profile Key** | `solaros_user` in localStorage | `solaros_platform_admin` in localStorage |
| **Required Role** | `ORG_ADMIN`, `ENGINEER`, `TECHNICIAN`, etc. | `isSuperAdmin = true` (`PLATFORM_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT`) |
| **Tenant Context** | Required (`X-Tenant-ID` header, RLS bound) | Bypass RLS (`prisma.asSuperAdmin`) with strict audit logging |

---

## 2. Superadmin Guard Enforcement

In `apps/api/src/modules/platform-admin/controllers/platform-admin.controller.ts`:

```typescript
@UseGuards(SuperAdminGuard)
@Controller('platform-admin')
export class PlatformAdminController {
  // All endpoints require verified SuperAdmin JWT token
}
```

If a standard tenant user attempts to invoke `/api/v1/platform-admin/*`, the guard returns `403 Forbidden` (`Access denied: Super Admin privileges required.`).

---

## 3. Session Revocation on Organization Suspension

When an organization is suspended via `POST /api/v1/platform-admin/organizations/:id/suspend`:
1. The organization status is changed to `SUSPENDED`.
2. All active sessions in the `sessions` table matching `organizationId` are immediately deleted:
   ```typescript
   await this.prisma.session.deleteMany({
     where: { organizationId: orgId },
   });
   ```
3. Any subsequent requests from tenant users on Port 3000 are rejected immediately with `401 Unauthorized` or `403 Forbidden`.
