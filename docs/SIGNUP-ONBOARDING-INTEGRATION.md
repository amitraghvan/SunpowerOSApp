# SunPowerOS Self-Service Signup & Onboarding Integration

## 1. User Journey Flow

$$\text{Marketing Website / CTA} \xrightarrow{\text{Start Free}} \text{Step 1: Account} \xrightarrow{\text{User Info}} \text{Step 2: Workspace} \xrightarrow{\text{Tenant Creation}} \text{Session Created} \xrightarrow{\text{Redirect}} \text{Operational Dashboard}$$

---

## 2. Backend Registration Logic

Implemented in `apps/api/src/modules/identity/auth.service.ts`:
1. **Validation**: Enforces terms of service and privacy acceptance.
2. **Duplicate Check**: Prevents registering an email that already possesses a password hash.
3. **Workspace Slug Generation**: Normalizes the organization name into an alphanumeric-kebab slug; auto-increments with `-1`, `-2` on collision.
4. **Argon2id Hashing**: Hashes password using `PasswordService`.
5. **Atomic Provisioning**:
   - Creates `User` record (`isActive: true`, `isSuperAdmin: false`).
   - Creates `Organization` (`isActive: true`, legal name).
   - In tenant context (`forTenant(org.id)`), creates default Headquarters branch (`code: 'HQ'`).
   - Creates `OrganizationMembership` linking user and organization.
   - Assigns `ORG_ADMIN` role via `membership_roles`.
   - Logs `REGISTER_ORGANIZATION` event in `audit_logs`.
   - Creates authenticated session via `SessionService`.
6. **Response**: Returns full `AuthResponseDto` with session token, user profile, active organization, and effective permissions.

---

## 3. Security Invariants Verified

- **No Platform Admin Escalation**: Newly registered users receive `ORG_ADMIN` within their organization scope and are never assigned `SYSTEM_ADMIN`.
- **Database Engine RLS**: All subsequent queries executed by the user are strictly isolated via `SET LOCAL app.current_organization_id = '<new_org_uuid>'`.
