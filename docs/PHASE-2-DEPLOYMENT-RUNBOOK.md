# SolarOS Phase 2 Deployment Runbook

## 1. Prerequisites & Services

- **Node.js:** v22.18.0 (LTS).
- **Package Manager:** pnpm 9.15.4.
- **Database:** PostgreSQL 14+ with Row-Level Security enabled.
- **Cache/Queue:** Redis 7+ on port 6379.
- **Storage:** MinIO or S3-compatible bucket storage (`solaros-documents`, `solaros-surveys`).

## 2. Step-by-Step Production Migration Runbook

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Apply Prisma schema migration
pnpm --filter @solaros/database db:deploy

# 3. Apply PostgreSQL RLS policies
psql $DATABASE_URL -f database/sql/rls-policies/004_phase2_tenant_isolation.sql

# 4. Seed statutory engineering standards
psql $DATABASE_URL -f database/sql/seed-standards.sql

# 5. Build core packages
pnpm --filter @solaros/types build
pnpm --filter @solaros/contracts build

# 6. Verify full type safety
pnpm check-types

# 7. Run automated test suites
pnpm test

# 8. Build production backend and frontend
pnpm --filter @solaros/api build
pnpm --filter @solaros/web build
```
