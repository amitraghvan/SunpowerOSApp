# SUNPOWEROS — CUSTOMER SUPPORT INTEGRATION & TENANT TICKET DESK

## 1. Overview
SunPowerOS provides a seamless support channel between customer ERP tenants (`http://localhost:3000`) and the centralized Platform Admin Support Center (`http://localhost:3001/support`).

---

## 2. Customer ERP Support Experience

1. **Access Point**:
   - ERP Topbar contains a dedicated "Support" trigger and a profile dropdown entry for "Customer Support Desk".
   - Opens `SupportTicketModal` (`apps/web/src/components/erp/support-ticket-modal.tsx`).
2. **Ticket Creation**:
   - Form fields:
     - `subject`: Summary of issue
     - `category`: `TECHNICAL`, `BILLING`, `FEATURE_REQUEST`, `GENERAL`
     - `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
     - `message`: Detailed description of behavior and reproduction steps
3. **Session Enforcement**:
   - Calls `POST /api/v1/support/tickets`.
   - The NestJS API extracts the `organizationId` from the authenticated session context via `@CurrentTenant('organizationId')`. The tenant cannot tamper with or spoof the organization ID.
   - Generates document number: `TCK-YYYY-XXXXXX`.
4. **Tenant Ticket View**:
   - The modal includes a "My Open Tickets" tab where users can view their filed tickets, status badges (`OPEN`, `IN_PROGRESS`, `RESOLVED`), and responses.
5. **Internal Notes Confidentiality**:
   - Platform Administrators can add internal notes (`isInternalOnly = true`) for private cross-agent collaboration.
   - `PlatformSupportService.getTicketDetail` strictly filters out internal notes when `isPlatformAdmin = false`, ensuring private operational discussions are never exposed to tenant users.
