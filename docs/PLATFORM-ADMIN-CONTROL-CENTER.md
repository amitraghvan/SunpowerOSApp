# SunPowerOS Master Platform Administration Control Center
## Super Admin Portal · Organization Management · Centralized Enquiries · Support · Platform Analytics · Resource Monitoring

---

## 1. Executive Summary

**SunPowerOS** is an enterprise-grade multi-tenant SaaS ERP engineered specifically for solar EPC operations. While individual solar contractors and EPC companies manage their respective business journeys within the tenant-isolated `/dashboard` application, **SunPower Solutions** operates a centralized **Master Platform Administration Control Center** located at `/platform-admin`.

This control center provides SunPower Solutions platform executives, support engineers, and SaaS infrastructure teams with end-to-end operational authority to:
1. Supervise all registered tenant organizations, their active branches, teams, and subscription lifecycles.
2. Control tenant organization states (`ACTIVE`, `TRIAL`, `SUSPENDED`, `CLOSED`) with mandatory descriptive reasons, automatic user session invalidation, and immutable audit logging.
3. Manage the centralized Public Website Enquiries Inbox (`/contact`), auto-generating gap-free reference identifiers (`ENQ-YYYY-000001`), routing leads to platform administrators, and maintaining internal collaboration notes.
4. Run the Master Customer Support Center, triaging tenant-submitted tickets (`TCK-YYYY-000001`), conducting threaded conversations, and enforcing strict privacy separation between public replies and internal platform notes.
5. Monitor SaaS growth analytics, subscription plan distributions (Starter, Growth, Enterprise), and top tenants by projects and team sizes.
6. Observe live cloud resources, MinIO object storage consumption across tenants, BullMQ job queues, and PostgreSQL query latency, with full platform incident alert resolution (`ALT-YYYY-000001`).

---

## 2. Architecture & Security Isolation

### 2.1 Route & Layout Separation
The application is strictly partitioned into three independent product surfaces:
- **Public Marketing Website (`/`)**: Anonymous visitors, solar solutions, features, security overview, self-service signup, and public inquiry submission (`/contact`).
- **Customer ERP Portal (`/dashboard`)**: Tenant-isolated ERP workspaces enforcing PostgreSQL Row-Level Security (RLS) on `app.current_organization_id`.
- **Platform Admin Control Center (`/platform-admin`)**: Secured route group `(platform-admin)` with dedicated layout, dark plum navigation (`#714B67` / `#5A3750`), production environment badges, and platform role guards. Normal tenant owners and ERP users are strictly prohibited from accessing this surface.

### 2.2 Access Control & Platform Roles
Platform identities are governed by the `PlatformAdministrator` model and `PlatformAdminGuard`:
- `PLATFORM_OWNER`: Full unrestricted access to all platform administrative capabilities, administrator provisioning, and plan configuration.
- `PLATFORM_ADMIN`: Manages organizations, enquiries, support tickets, alerts, and subscriptions.
- `PLATFORM_SUPPORT`: Manages customer support tickets, replies, and lead enquiries.
- `PLATFORM_ANALYST`: Read-only access to platform metrics, SaaS analytics, and resource dashboards.
- `PLATFORM_READ_ONLY`: Audit view privileges.

### 2.3 PostgreSQL Row-Level Security Integrity
Tenant business tables (`customers`, `leads`, `engineering_designs`, `bills_of_materials`, `sales_orders`, etc.) remain strictly guarded by PostgreSQL FORCE RLS policies. The platform administration endpoints never bypass RLS haphazardly; all administrative queries run through explicitly audited platform endpoints (`prisma.asSuperAdmin(...)` and `prisma.forTenant(...)`), leaving a comprehensive trail in `platform_audit_events`.

---

## 3. Database Schema Models

The PostgreSQL schema (`database/prisma/schema.prisma`) introduces the following production models:

| Model | Table Name | Purpose |
|---|---|---|
| `PlatformSequence` | `platform_sequences` | Concurrency-safe, gap-free unique document numbering for platform-wide entities (`ENQ`, `TCK`, `ALT`). |
| `PlatformAdministrator` | `platform_administrators` | Links a core `User` to a platform role (`PLATFORM_OWNER`, `PLATFORM_ADMIN`, etc.) with granular permissions. |
| `PlatformEnquiry` | `platform_enquiries` | Captures public website inquiries (`ENQ-YYYY-000001`), lead category, capacity, status, and assigned admin. |
| `PlatformEnquiryActivity` | `platform_enquiry_activities` | Records lifecycle transitions, admin assignments, and internal follow-up notes. |
| `SupportTicket` | `support_tickets` | Manages tenant-raised operational tickets (`TCK-YYYY-000001`), organization link, priority, category, and status. |
| `SupportTicketMessage` | `support_ticket_messages` | Threaded conversation messages, supporting tenant user messages, platform replies, and `isInternalOnly` notes. |
| `PlatformAlert` | `platform_alerts` | Automated system incident notifications (`ALT-YYYY-000001`), severity (`CRITICAL`, `WARNING`, `INFO`), and resolution logs. |
| `PlatformAuditEvent` | `platform_audit_events` | Immutable security log tracking all administrative interventions, actor ID, action, target, reason, and IP. |
| `SaaSPlan` | `saas_plans` | Standardized solar EPC tiers (`STARTER`, `GROWTH`, `ENTERPRISE`), pricing, seat quotas, and storage limits. |
| `OrganizationSubscription` | `organization_subscriptions` | Binds each tenant organization to its active SaaS plan, seat allocation, and MinIO storage quota. |

---

## 4. REST API Endpoint Reference

### Public Website
- `POST /api/v1/enquiries`: Public endpoint for website contact submissions; validates payload, generates sequential reference number, and stores inquiry.

### Platform Administrator Auth
- `POST /api/v1/platform-admin/auth/login`: Authenticates platform administrators, verifies account lockout, and issues session tokens.
- `GET /api/v1/platform-admin/auth/me`: Retrieves current administrator profile, role, and active permissions.

### Platform Operations & Management
- `GET /api/v1/platform-admin/overview`: Cross-tenant KPI metrics, 6-month onboarding trajectory, and recent activity streams.
- `GET /api/v1/platform-admin/organizations`: Paginated directory of organizations with search and status filtering.
- `GET /api/v1/platform-admin/organizations/:id`: 360 Workspace details including users, branches, storage usage, and audit history.
- `POST /api/v1/platform-admin/organizations/:id/suspend`: Suspends organization with mandatory reason, revokes all user sessions, and logs audit event.
- `POST /api/v1/platform-admin/organizations/:id/reactivate`: Restores organization status to active.
- `PUT /api/v1/platform-admin/organizations/:id/subscription`: Updates tenant plan tier and resource quotas.
- `GET /api/v1/platform-admin/enquiries`: Lists public enquiries with category and status filters.
- `GET /api/v1/platform-admin/enquiries/:id`: Detailed inquiry view with complete activity history.
- `PATCH /api/v1/platform-admin/enquiries/:id/status`: Updates enquiry status (`NEW`, `IN_REVIEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `CLOSED`).
- `PATCH /api/v1/platform-admin/enquiries/:id/assign`: Assigns inquiry to a platform administrator.
- `POST /api/v1/platform-admin/enquiries/:id/notes`: Adds internal follow-up note to inquiry.
- `GET /api/v1/platform-admin/support/tickets`: Centralized support ticket directory.
- `GET /api/v1/platform-admin/support/tickets/:id`: Support ticket conversation thread.
- `POST /api/v1/platform-admin/support/tickets/:id/reply`: Posts reply (supports public reply or internal team note).
- `PATCH /api/v1/platform-admin/support/tickets/:id/status`: Updates ticket resolution status.
- `PATCH /api/v1/platform-admin/support/tickets/:id/assign`: Reassigns support agent.
- `GET /api/v1/platform-admin/analytics`: Aggregated SaaS metrics, plan breakdown, and top tenants.
- `GET /api/v1/platform-admin/health`: Live health inspection of PostgreSQL, Redis, MinIO, BullMQ, and API Gateway.
- `GET /api/v1/platform-admin/alerts`: Active system alerts.
- `POST /api/v1/platform-admin/alerts/:id/acknowledge`: Acknowledges alert.
- `POST /api/v1/platform-admin/alerts/:id/resolve`: Resolves alert with resolution notes.
- `GET /api/v1/platform-admin/audit-logs`: Searchable platform security audit event explorer.
- `GET/POST /api/v1/platform-admin/administrators`: Lists and provisions platform administrators.
- `GET/POST/PATCH /api/v1/platform-admin/plans`: Manages SaaS subscription tiers.

### Tenant ERP Support
- `POST /api/v1/support/tickets`: Allows authenticated ERP users to raise tickets for their organization.
- `GET /api/v1/support/tickets`: Lists tickets belonging to current tenant.
- `GET /api/v1/support/tickets/:id`: Retrieves ticket details (automatically filtering out internal-only platform notes).
- `POST /api/v1/support/tickets/:id/messages`: Posts tenant reply message.

---

## 5. Verification & Test Suite Results

The platform implementation has been verified with comprehensive integration test suites:
- `tests/integration/platform-admin-core.spec.ts`: Tests overview KPIs, public website enquiry submission, reference numbering, enquiry assignment, organization suspension with reason, reactivation, health check latency, and alert resolution.
- `tests/integration/platform-admin-support.spec.ts`: Tests tenant ticket generation, sequential numbering, message thread exchange, strict isolation of internal-only messages from tenant views, and ticket resolution.

**Monorepo Test Suite Result:**
- **47 Test Suites Passed (47 total)**
- **187 Tests Passed (187 total)**
- **Zero Failures across all domains**
