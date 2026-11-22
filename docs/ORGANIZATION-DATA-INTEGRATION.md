# SUNPOWEROS — MULTI-TENANT ORGANIZATION DATA INTEGRATION

## 1. Flow of Tenant Onboarding
SunPowerOS supports self-service signup on the public web platform (`http://localhost:3000/signup`).

### End-to-End Registration Pipeline:
1. **Public Web Form Submission**: User submits personal credentials and workspace details to `POST /api/v1/auth/register`.
2. **User & Workspace Provisioning**:
   - Creates `User` with Argon2id password hash.
   - Creates `Organization` with unique slug and legal metadata.
   - Invokes `prisma.forTenant(organization.id, ...)` to create the headquarter `OrganizationBranch` and default `OrganizationMembership`.
   - Links the `ORG_ADMIN` role via `membership_roles`.
   - Generates session token and returns authentication payload.
3. **Database Canon**:
   - The PostgreSQL `organizations` table is the single source of truth.
   - All tenant records are immediately committed to `solaros_dev`.
4. **Platform Admin Discovery**:
   - On the Platform Admin Control Center (`http://localhost:3001/organizations`), the newly created organization immediately appears in the directory with its branch count, membership count, status, and subscription tier.

---

## 2. Cross-Tenant Query Resolution
Because PostgreSQL enforces Row-Level Security (`FORCE ROW LEVEL SECURITY`), cross-tenant queries executed by Platform Admin services (`PlatformOrganizationsService`, `PlatformOverviewService`, `PlatformAnalyticsService`) execute within:
```typescript
await this.prisma.asSuperAdmin(async (tx) => {
  return tx.organization.findMany({ ... });
});
```
This sets `SET LOCAL app.is_super_admin = 'true'`, satisfying the database policy without compromising tenant isolation for customer ERP sessions.
