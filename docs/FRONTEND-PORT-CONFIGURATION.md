# SunPowerOS — Frontend Port Configuration Specification

## 1. Port Allocation Matrix

| Service | Protocol | Dev Host & Port | Environment Variable | Configured In |
| :--- | :--- | :--- | :--- | :--- |
| **Existing Web & Customer ERP** | HTTP | `http://localhost:3000` | `PORT=3000`<br/>`NEXT_PUBLIC_API_URL=http://localhost:4000` | `apps/web/package.json`<br/>`apps/web/.env.local` |
| **Platform Admin Control Center** | HTTP | `http://localhost:3001` | `PORT=3001`<br/>`NEXT_PUBLIC_API_URL=http://localhost:4000`<br/>`NEXT_PUBLIC_EXISTING_WEB_URL=http://localhost:3000` | `apps/platform-admin/package.json`<br/>`apps/platform-admin/.env.local` |
| **Shared NestJS REST API** | HTTP | `http://localhost:4000` | `PORT=4000`<br/>`CORS_ORIGIN=http://localhost:3000,http://localhost:3001` | `apps/api/.env`<br/>`apps/api/src/main.ts` |
| **PostgreSQL Database** | TCP | `localhost:5432` | `DATABASE_URL=postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public` | Shared Environment |
| **MinIO S3 Storage** | HTTP | `localhost:9000` | `S3_ENDPOINT=http://localhost:9000` | Shared Environment |
| **Redis Server** | TCP | `localhost:6379` | `REDIS_HOST=localhost`, `REDIS_PORT=6379` | Shared Environment |

---

## 2. Root Package Commands

The root `package.json` provides direct commands to run individual services or the entire cluster simultaneously:

```bash
# Start Customer Web & ERP on Port 3000
pnpm dev:web

# Start Platform Admin Control Center on Port 3001
pnpm dev:platform-admin

# Start Shared NestJS API on Port 4000
pnpm dev:api

# Run full Turborepo dev pipeline across all packages
pnpm dev
```

---

## 3. Environment Indicator Logic

In `apps/platform-admin/src/app/(admin)/layout.tsx`, the environment badge dynamically determines runtime context:

```typescript
const host = window.location.hostname;
if (host === 'localhost' || host === '127.0.0.1') {
  setEnvironment('DEVELOPMENT'); // Renders: "Development (Port 3001)" in amber
} else if (host.includes('staging')) {
  setEnvironment('STAGING');     // Renders: "Staging Cluster" in blue
} else {
  setEnvironment('PRODUCTION');  // Renders: "Production Cloud" in emerald
}
```

This dynamically resolves the issue where a local development instance showed "Production Cloud" in the top bar.
