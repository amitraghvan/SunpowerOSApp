# SUNPOWEROS — AUTHENTICATED USER IDENTITY ARCHITECTURE & FIX

## 1. Overview & Problem Definition
Previously, navigating the SunPowerOS ERP (`http://localhost:3000`) caused the top-right user badge to fall back to hardcoded initials `SE` ("Solar Engineer") and a generic greeting ("Welcome back, Solar Professional.").

### Root Causes
1. **Volatile Session Token Storage**: `apps/web/src/lib/api-client.ts` stored `sessionToken` and `organizationId` exclusively in static class fields. On any full page reload or client route refresh, these values were reset to `null` and default fallback strings.
2. **Topbar Display Architecture**: The topbar button rendered only an avatar badge and chevron without rendering the authenticated user's name or secondary role context.
3. **Failure Recovery Fallback**: When `ApiClient.getMe()` failed with 401 Unauthorized, the topbar fell back to a hardcoded demo engineer profile instead of maintaining authenticated state.

---

## 2. Technical Remediation

### 2.1 Persistent Token & Tenant Management
In `apps/web/src/lib/api-client.ts`:
- `setSessionToken(token)` automatically syncs to browser `localStorage` under `solaros_session_token`.
- `getSessionToken()` checks memory first, then reads from `localStorage`.
- `setOrganizationId(orgId)` automatically syncs to `solaros_organization_id`.
- `logout()` sends a revocation request to `POST /api/v1/auth/logout`, then clears `localStorage` tokens and active session contexts.

### 2.2 Topbar User Identity Component
In `apps/web/src/components/erp/erp-topbar.tsx`:
- **Avatar & Initials**:
  - Displays user profile photo if uploaded.
  - Dynamically computes uppercase initials from `{firstName[0]}{lastName[0]}` or the first two letters of the email.
  - Features an animated loading skeleton during profile resolution.
- **Identity Display**:
  - Displays actual user name: `{firstName} {lastName}` or email.
  - Displays user role as secondary info (`ORG_ADMIN`, `SOLAR_ENGINEER`, etc.).
  - Displays active organization context with RLS status indicator.
- **Profile Dropdown Menu**:
  - User identity summary header.
  - Direct navigation to My Profile (`/settings`), Preferences (`/settings/security`), Organization (`/settings/organizations`), Permissions (`/settings/roles`), Customer Support Desk (`SupportTicketModal`), and Sign Out.
  - Accessible via click, outside click listener, and Escape key listener.
- **Dashboard Synchronization**:
  - `apps/web/src/app/(erp)/dashboard/page.tsx` loads the real display name from `ApiClient.getMe()`, eliminating the hardcoded "Solar Professional" greeting.
