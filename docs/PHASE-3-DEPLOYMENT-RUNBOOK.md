# SolarOS Phase 3 Production Deployment Runbook

## 1. Prerequisites

- **Node.js**: v22.18.0+
- **pnpm**: v9.15.4+
- **PostgreSQL**: v14+ with pgcrypto extension enabled
- **Redis**: v7+ (for BullMQ queues and caching)
- **MinIO / AWS S3**: S3-compatible storage with buckets:
  - `solaros-documents`
  - `solaros-surveys`
  - `solaros-inspections`

---

## 2. Deployment Steps

### Step 1: Database Schema Migration
Apply the Phase 3 database migration to the PostgreSQL database:
```bash
# Run Prisma migration deploy
pnpm --filter @solaros/database prisma migrate deploy
```
Migration file applied: `20261121181532_phase3_procurement_supplier_po_grn_serials`.

### Step 2: Row-Level Security Policies
Apply Phase 3 RLS policies to enforce tenant isolation:
```bash
psql -U solaros_app -d solaros_dev -f database/sql/rls-policies/005_phase3_tenant_isolation.sql
```

### Step 3: Permissions Registry & Sequence Verification
Verify that document sequences and Phase 3 permissions are seeded:
- Document sequences: `SUP`, `MRP`, `PR`, `RFQ`, `PO`, `GRN`, `QIR`, `RET`
- Enterprise Roles: `PROCUREMENT_MANAGER`, `WAREHOUSE_RECEIVING_CLERK`, `QUALITY_INSPECTOR`

### Step 4: Monorepo Build
Compile all workspace packages and apps:
```bash
pnpm build
```
Verify that:
- `@solaros/types` compiles cleanly.
- `@solaros/contracts` compiles cleanly.
- `@solaros/database` compiles cleanly.
- `@solaros/api` compiles NestJS production bundles cleanly.
- `@solaros/web` compiles Next.js 15 SSR & static routes cleanly (38 routes).

---

## 3. Post-Deployment Verification

1. **API Health Check**:
   ```bash
   curl -s http://localhost:4000/api/v1/health
   ```
2. **Database Health Check**:
   ```bash
   curl -s http://localhost:4000/api/v1/health/db
   ```
3. **Execute Integration Test Suite**:
   ```bash
   pnpm test
   ```
   Ensure all 32 suites and 123 tests pass.

---

## 4. Rollback Strategy

If rollback is required:
1. Revert web and API deployments to Phase 2 container images.
2. If database rollback is necessary, execute downward migration script or restore from pre-migration PostgreSQL WAL snapshot.
3. Remove Phase 3 RLS policies:
   ```sql
   DROP POLICY IF EXISTS tenant_isolation_suppliers ON suppliers;
   ...
   ```
