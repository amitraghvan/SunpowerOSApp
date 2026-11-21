# SunPowerOS Operational Dashboard Redesign

## 1. Overview

The previous development dashboard displayed static phase-scaffolding cards (Phase 1, Phase 2, Phase 3).
This has been replaced with a real, operational business cockpit in `apps/web/src/app/(erp)/dashboard/page.tsx`.

---

## 2. Operational Components

### 2.1 Personalized Header
- "Welcome back, [User Name]."
- Workspace indicator badge with active organization name.
- Real-time refresh button.
- "+ New Lead" primary action button.

### 2.2 Quick Actions Bar
One-click access to core operational workflows:
- `+ Lead` $\to$ `/crm`
- `+ Customer` $\to$ `/customers`
- `Schedule Survey` $\to$ `/surveys`
- `New Design` $\to$ `/engineering`
- `Create Quote` $\to$ `/quotations`

### 2.3 Real Metric KPI Cards
Connected to live backend endpoints:
1. **Active Leads**: Count of leads excluding `WON` and `LOST`.
2. **Pending Surveys**: Count of surveys in `SCHEDULED`, `DRAFT`, or `UNDER_REVIEW`.
3. **Designs**: Total engineering designs sized for the tenant.
4. **Active Quotes**: Quotations in `DRAFT` or `SUBMITTED`.
5. **Accepted Quotes**: Quotations accepted by customer.
6. **Sales Orders**: Confirmed sales orders ready for project execution.

### 2.4 Operational Work Queue
Tabbed queue allowing users to view and act upon pending records:
- **Surveys Requiring Review**: Quick link to open and audit site measurements.
- **Pending Quotations**: Proposals awaiting internal commercial review.
- **Confirmed Sales Orders**: Orders awaiting procurement and dispatch execution.
- Includes polished empty states when no records are pending.
