# SUNPOWEROS — PLATFORM ANALYTICS VALIDATION REPORT

## 1. Overview
The Platform Admin analytics system provides real-time SaaS intelligence across all registered tenant organizations without injecting mock data.

---

## 2. Metrics Architecture

1. **Overview KPIs** (`/api/v1/platform-admin/overview`):
   - `totalOrganizations`: Exact count of tenant organizations in PostgreSQL.
   - `activeOrganizations`: Count of organizations where `status = 'ACTIVE' AND isActive = true`.
   - `trialOrganizations`: Count of organizations in trial evaluation.
   - `suspendedOrganizations`: Count of organizations currently suspended.
   - `totalUsers`: Total registered platform user accounts across all workspaces.
   - `totalProjects`: Count of active solar project initiations.
   - `totalStorageMb`: Combined size of supplier and customer handover documents stored in MinIO S3.
   - `newEnquiriesCount`: Inbound public website contact leads awaiting review.
   - `openTicketsCount`: Active customer support tickets in `OPEN` or `IN_PROGRESS` status.
   - `monthlyGrowth`: Real 6-month historical trajectory of organization registrations.
2. **SaaS Analytics Engine** (`/api/v1/platform-admin/analytics`):
   - `planDistribution`: Aggregates active subscriptions by `SaaSPlan` tier.
   - `topOrganizationsByProjects`: Ranked by project volume.
   - `topOrganizationsByUsers`: Ranked by active user memberships.
   - `enquiriesByCategory`: Grouped by commercial intent.
   - `ticketsByCategory`: Grouped by operational issue type.
3. **Validation Outcome**:
   - Zero-data state correctly displays clean Odoo-inspired empty illustrations when no tickets or alerts exist.
   - Real organizations (16 in dev database) render with accurate branch and user counts.
