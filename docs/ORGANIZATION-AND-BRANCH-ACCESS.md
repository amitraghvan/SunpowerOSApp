# SolarOS ERP — Organization and Branch Access Architecture

## 1. Multi-Tenant Organization Membership
- A single user account (`User`) can hold active memberships in multiple solar companies (`OrganizationMembership`).
- Each membership defines an optional home operating branch (`branchId`) and assigned roles (`MembershipRole`).

## 2. Organization Context Switching
When an executive switches between companies (e.g. from *SunPower North* to *SunPower South*):
1. Client calls `POST /api/v1/organizations/:id/switch`.
2. `OrganizationsService` verifies the user possesses an active, non-deleted membership in the requested organization.
3. If valid, a new cryptographically secure session is created with `organizationId: targetOrgId`.
4. A new HttpOnly cookie and updated session token are issued.
5. If the user attempts to switch to an organization they are not a member of, the API throws `403 Forbidden` (`Negative Tenant Access Test`).

## 3. Branch Operations
Operating branches represent physical warehouses, regional installation hubs, or dispatch centers:
- `OrganizationBranch` records have unique codes per organization (`@@unique([organizationId, code])`).
- Creating or listing branches operates inside `prisma.forTenant(orgId, tx => ...)` to respect PostgreSQL RLS policies.
- Employee invitations (`OrganizationInvitation`) can pre-assign an employee to a specific operating branch.
