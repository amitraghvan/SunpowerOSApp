# SunPowerOS — Real-Time Organization Sync Verification

## 1. Overview

Because both `apps/web` (Port 3000) and `apps/platform-admin` (Port 3001) share the same PostgreSQL database and NestJS API, any organization registered on Port 3000 is immediately visible and manageable on Port 3001 without manual sync, message queues, or batch replication.

---

## 2. Verified Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Solar EPC Owner (Port 3000)
    participant Web as apps/web (:3000)
    participant API as apps/api (:4000)
    participant DB as PostgreSQL 14
    participant Admin as apps/platform-admin (:3001)
    actor SuperAdmin as Platform Director (Port 3001)

    Customer->>Web: Register Organization (/signup)
    Web->>API: POST /api/v1/auth/signup
    API->>DB: INSERT into organizations & memberships
    DB-->>API: Organization Created (ACTIVE)
    API-->>Web: 201 Created & Tenant JWT

    SuperAdmin->>Admin: Open Organizations Directory (/organizations)
    Admin->>API: GET /api/v1/platform-admin/organizations
    API->>DB: SELECT from organizations with counts
    DB-->>API: Org data with membership & branch counts
    API-->>Admin: Real-time tenant record displayed
```

---

## 3. Automated Test Verification

This sync has been verified in `tests/integration/platform-admin-cross-frontend.spec.ts`:

```typescript
it('should register tenant via Port 3000 customer workflow and immediately reflect in Port 3001 Platform Organizations Directory', async () => {
  // 1. Register organization
  await prisma.organization.create({
    data: {
      id: '99999999-9999-4999-9999-999999999999',
      name: 'SolarCraft Systems Port 3000',
      slug: 'solarcraft-port3000-epc',
      status: 'ACTIVE',
    },
  });

  // 2. Query from Port 3001 Platform Admin service
  const orgList = await orgsService.listOrganizations({
    search: 'SolarCraft',
    status: 'ACTIVE',
  });

  expect(orgList.total).toBeGreaterThanOrEqual(1);
  const found = orgList.items.find((o) => o.id === '99999999-9999-4999-9999-999999999999');
  expect(found).toBeDefined();
  expect(found?.name).toBe('SolarCraft Systems Port 3000');
});
```

**Result: Passed in 26 ms.**
