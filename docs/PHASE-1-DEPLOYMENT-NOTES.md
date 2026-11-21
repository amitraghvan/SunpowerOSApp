# SOLAROS ERP — PHASE 1 DEPLOYMENT & RUNTIME NOTES
## Environment Requirements, Database Migrations & Operational Setup

---

## 1. Runtime Prerequisites

| Component | Minimum Version | Verified Local Host Version |
| :--- | :--- | :--- |
| **Node.js** | 20+ LTS | `v22.18.0` |
| **pnpm** | 9+ | `9.15.4` |
| **PostgreSQL** | 14+ | `14.20` (Homebrew native) |
| **Redis** | 7+ | `7.x` (Homebrew native) |
| **MinIO** | Latest RELEASE | RELEASE.2024 (Homebrew native) |

---

## 2. Database Migration Steps

To deploy Phase 1 database changes to a new environment:

```bash
# 1. Apply Prisma migrations
DATABASE_URL="postgresql://<admin_user>:<pw>@<host>:5432/<dbname>?schema=public" \
pnpm --filter @solaros/database prisma migrate deploy

# 2. Grant permissions to the application non-superuser
psql -d <dbname> -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO solaros_app; GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO solaros_app;"

# 3. Apply Phase 1 Row-Level Security policies
psql -d <dbname> -f database/sql/rls-policies/002_phase1_tenant_isolation.sql
```

---

## 3. MinIO Object Storage Setup

Ensure the following buckets exist in MinIO before boot:
- `solaros-documents`
- `solaros-surveys`
- `solaros-assets`

`StorageService` automatically checks and initializes these buckets during NestJS startup if the service account has permission.

---

## 4. Environment Variables Reference

```env
# Application Port
PORT=4000
API_PREFIX=api/v1

# PostgreSQL Connection (Non-Superuser for RLS enforcement)
DATABASE_URL=postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public

# Redis Connection
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Object Storage (MinIO)
STORAGE_ENDPOINT=localhost
STORAGE_PORT=9000
STORAGE_USE_SSL=false
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
```
