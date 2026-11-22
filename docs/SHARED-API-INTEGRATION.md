# SunPowerOS — Shared API Integration Specification

## 1. Architecture

SunPowerOS uses a single, centralized NestJS backend (`apps/api`) running on **Port 4000**. Both frontends communicate directly with this API:
- `http://localhost:3000` (Customer ERP & Marketing Web)
- `http://localhost:3001` (Platform Admin Control Center)

---

## 2. Dynamic CORS Whitelisting

In `apps/api/src/main.ts`:

```typescript
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:(3000|3001)$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    API_CONSTANTS.CORRELATION_ID_HEADER,
    API_CONSTANTS.TENANT_ID_HEADER,
    API_CONSTANTS.BRANCH_ID_HEADER,
  ],
});
```

---

## 3. Platform Admin REST API Surface

All platform admin routes are grouped under `/api/v1/platform-admin`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/platform-admin/auth/login` | Authenticates superadmin and returns JWT session |
| `GET` | `/api/v1/platform-admin/overview` | Platform KPI metrics, growth trajectory, and recent activities |
| `GET` | `/api/v1/platform-admin/organizations` | Paginated organization list with status and name filters |
| `GET` | `/api/v1/platform-admin/organizations/:id` | Organization 360 view with memberships, branches, and storage |
| `POST` | `/api/v1/platform-admin/organizations/:id/suspend` | Suspends organization, revoking all active sessions |
| `POST` | `/api/v1/platform-admin/organizations/:id/reactivate` | Reactivates organization and restores portal access |
| `PUT` | `/api/v1/platform-admin/organizations/:id/subscription` | Updates SaaS tier and resource quotas |
| `GET` | `/api/v1/platform-admin/users` | Global User Directory across all tenants |
| `GET` | `/api/v1/platform-admin/enquiries` | Website lead captures and inquiries |
| `GET` | `/api/v1/platform-admin/enquiries/:id` | Enquiry details and communication log |
| `PATCH` | `/api/v1/platform-admin/enquiries/:id/status` | Updates enquiry progression status |
| `PATCH` | `/api/v1/platform-admin/enquiries/:id/assign` | Assigns enquiry to a platform administrator |
| `POST` | `/api/v1/platform-admin/enquiries/:id/notes` | Appends internal follow-up notes |
| `GET` | `/api/v1/platform-admin/support/tickets` | Tenant support ticket registry |
| `GET` | `/api/v1/platform-admin/support/tickets/:id` | Support conversation thread and ticket details |
| `POST` | `/api/v1/platform-admin/support/tickets/:id/reply` | Sends customer reply or posts internal note |
| `PATCH` | `/api/v1/platform-admin/support/tickets/:id/status` | Updates support ticket resolution status |
| `GET` | `/api/v1/platform-admin/analytics` | Subscription distributions and customer engagement stats |
| `GET` | `/api/v1/platform-admin/health` | PostgreSQL latency, BullMQ concurrency, and MinIO storage |
| `GET` | `/api/v1/platform-admin/alerts` | Active infrastructure and security alerts |
| `POST` | `/api/v1/platform-admin/alerts/:id/acknowledge` | Acknowledges alert |
| `POST` | `/api/v1/platform-admin/alerts/:id/resolve` | Resolves alert with closing notes |
| `GET` | `/api/v1/platform-admin/audit-logs` | Immutable audit trail query explorer |
| `GET` | `/api/v1/platform-admin/administrators` | Platform administrator roster |
| `POST` | `/api/v1/platform-admin/administrators` | Creates platform administrator account |
| `GET` | `/api/v1/platform-admin/plans` | SaaS tier definitions, quotas, and pricing |
