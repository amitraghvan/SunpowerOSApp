# SOLAROS ERP — ENVIRONMENT SETUP & RUNTIME GUIDE

---

## 1. Prerequisites

- **macOS / Linux / Windows WSL2**
- **Node.js:** `v22.18.0` (LTS) or higher
- **pnpm:** `9.15.4` (`npm install -g pnpm`)
- **Docker & Docker Compose** (Optional if running native Homebrew services)

---

## 2. Installation Steps

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Environment Configuration
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```

### Step 3: Start Datastores

#### Option A: Using Docker (Recommended for production & container users)
```bash
docker compose up -d postgres redis minio minio-init
```

#### Option B: Using Native Services on macOS (Homebrew fallback)
```bash
# Start PostgreSQL & Redis services
brew services start postgresql@14
brew services start redis

# Create development database if not existing
createdb solaros_dev
```

### Step 4: Run Prisma Database Migrations
```bash
pnpm db:generate
pnpm db:migrate
```

### Step 5: Start Development Applications
```bash
pnpm dev
```
- API Server: `http://localhost:4000/api/v1`
- Swagger OpenAPI: `http://localhost:4000/docs`
- Health Endpoint: `http://localhost:4000/api/v1/health`
- Frontend ERP Shell: `http://localhost:3000`
- Worker Process: `pnpm --filter @solaros/api start:worker`
