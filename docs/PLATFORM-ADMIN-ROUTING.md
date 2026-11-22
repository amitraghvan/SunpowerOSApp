# SunPowerOS — Platform Admin Routing Specification

## 1. Overview

The dedicated Platform Admin frontend on **Port 3001** maintains an intuitive, clean URL hierarchy without unnecessary prefix nesting.

---

## 2. Route Inventory

| Route Path | Layout / Type | Access Control | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| `/` | Root router | Public | Inspects session token; redirects to `/overview` if logged in, or `/login` if unauthenticated. |
| `/login` | Standalone view | Public | Superadmin credentials sign-in, JWT token capture, links to Customer ERP on Port 3000. |
| `/overview` | Admin Master Shell | Superadmin | Core KPI counters, 6-month growth trajectory chart (with zero-data fallback), recent tenants, audit feed. |
| `/organizations` | Admin Master Shell | Superadmin | Searchable tenant directory, status filtering (Active, Trial, Suspended), suspension and reactivation modals. |
| `/organizations/[id]` | Admin Master Shell | Superadmin | Organization 360: Subscription & Limits, Team Users, Branches, Support Tickets, Audit Log History. |
| `/users` | Admin Master Shell | Superadmin | Global User Directory spanning all registered tenant organizations with search, branch, and role displays. |
| `/enquiries` | Admin Master Shell | Superadmin | Public Website Enquiries Inbox, reference numbers (`ENQ-YYYY-XXXXXX`), status pipeline, team notes. |
| `/support` | Admin Master Shell | Superadmin | Split-pane Customer Support Center, ticket status management, public replies and internal notes toggle. |
| `/analytics` | Admin Master Shell | Superadmin | SaaS tier distribution, category analytics, tenant leaderboards by projects and users. |
| `/resources` | Admin Master Shell | Superadmin | MinIO S3 storage consumption, BullMQ background queues, PostgreSQL latency, API gateway memory. |
| `/health` | Admin Master Shell | Superadmin | Real-time infrastructure health matrix and active incident previews. |
| `/alerts` | Admin Master Shell | Superadmin | Infrastructure alert desk with acknowledge and resolution workflows. |
| `/audit-logs` | Admin Master Shell | Superadmin | Immutable platform security audit log explorer with action code filtering. |
| `/administrators` | Admin Master Shell | Superadmin | Administrator roster, role assignments (`PLATFORM_OWNER`, `PLATFORM_ADMIN`, `PLATFORM_SUPPORT`), activation toggle. |
| `/settings` | Admin Master Shell | Superadmin | SaaS plan management (Starter, Growth, Enterprise), seat limits, storage quotas, and feature flags. |

---

## 3. Backward Compatibility & Redirection (Port 3000)

Any user or bookmark attempting to reach `http://localhost:3000/platform-admin/*` is immediately redirected:

1. `apps/web/src/app/platform-admin/page.tsx`:
   - Auto-redirects client to `http://localhost:3001/overview`.
   - Offers fallback manual button: `"Open Platform Admin Control Center (:3001)"`.
2. `apps/web/src/app/platform-admin/[...slug]/page.tsx`:
   - Wildcard handler capturing any subpath (e.g. `/platform-admin/organizations/abc-123`) and forwarding immediately to `http://localhost:3001/organizations/abc-123`.
