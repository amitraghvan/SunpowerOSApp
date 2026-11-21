# SOLAROS DOCKER INFRASTRUCTURE

This directory contains containerization specifications for the SolarOS platform.

---

## Architecture Overview

The local container environment comprises:
1. **`solaros-postgres`**: PostgreSQL 16 Alpine with persistent volume `postgres-data` and healthcheck.
2. **`solaros-redis`**: Redis 7 Alpine with persistent volume `redis-data` for BullMQ queues.
3. **`solaros-minio`**: MinIO S3-compatible object store on port 9000 with console on port 9001.
4. **`solaros-minio-init`**: Automated provisioning of default document & survey storage buckets.
5. **`solaros-api`**: NestJS Modular Monolith API server (`/api/v1`).
6. **`solaros-worker`**: Shared backend worker process executing BullMQ queue jobs.
7. **`solaros-web`**: Next.js App Router ERP application shell.

---

## Startup & Shutdown Commands

### 1. Launch Core Datastores (PostgreSQL, Redis, MinIO)
```bash
docker compose up -d postgres redis minio minio-init
```

### 2. Launch Entire Full-Stack Environment
```bash
docker compose up -d
```

### 3. Check Service Health
```bash
docker compose ps
```

### 4. View Container Logs
```bash
# All services
docker compose logs -f

# Specific service (e.g. API or Worker)
docker compose logs -f api
docker compose logs -f worker
```

### 5. Graceful Teardown
```bash
# Stop containers without losing data
docker compose down

# Stop containers and remove volumes (destructive reset)
docker compose down -v
```

---

## Native Local Fallback (When Docker Engine is Not Available)

If Docker Desktop or OrbStack is not running on macOS:

1. **Start PostgreSQL via Homebrew:**
   ```bash
   brew services start postgresql@14
   createdb solaros_dev
   ```

2. **Start Redis via Homebrew:**
   ```bash
   brew services start redis
   ```

3. **Run Prisma Migrations:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Start Applications:**
   ```bash
   # Terminal 1: NestJS API
   pnpm --filter @solaros/api dev

   # Terminal 2: Next.js Web
   pnpm --filter @solaros/web dev
   ```
