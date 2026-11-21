# SOLAROS ERP

Enterprise SaaS & ERP platform purpose-built for Solar EPC (Engineering, Procurement, and Construction) companies.

## Architecture Highlights

- **Architecture:** Modular Monolith + Monorepo + Domain-Driven Design
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui design tokens
- **Backend:** NestJS 10, TypeScript, REST APIs, Swagger/OpenAPI, class-validator
- **Database:** PostgreSQL with Prisma ORM, UUIDs, Decimal financial types, and multi-tenant RLS foundations
- **Queues:** Redis & BullMQ
- **Object Storage:** MinIO / AWS S3 compatible
- **Package Management:** pnpm workspaces with Turborepo

---

## Directory Structure Overview

```text
solaros/
├── apps/
│   ├── web/           # Next.js ERP frontend application
│   └── api/           # NestJS modular monolith backend & worker
├── packages/
│   ├── ui/            # Design system tokens and reusable UI primitives
│   ├── contracts/     # API request/response DTO contracts
│   ├── types/         # Domain enums, multi-tenant models, common types
│   ├── config/        # Centralized configuration constants
│   └── eslint-config/ # Shared code style & linting rules
├── database/
│   ├── prisma/        # Prisma schema, migrations, and seed scripts
│   └── sql/           # RLS policies, custom indexes, and constraints
├── infrastructure/    # Docker Compose, Dockerfiles, and deployment configs
├── tests/             # Unit, integration, E2E, security, performance tests
└── docs/              # Architectural decision records & technical guides
```

---

## Quick Start (Development)

### Prerequisites

- Node.js >= 20.0.0 (LTS recommended)
- pnpm >= 9.0.0 (`npm install -g pnpm`)
- Docker & Docker Compose OR local PostgreSQL & Redis instances

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

### 3. Start Infrastructure Services

Using Docker Compose:
```bash
docker compose up -d postgres redis minio
```

Or using native Homebrew services:
```bash
brew services start postgresql@14
brew services start redis
```

### 4. Database Setup & Migration

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start Development Servers

```bash
pnpm dev
```

- API Server: `http://localhost:4000/api/v1`
- Swagger Documentation: `http://localhost:4000/docs`
- Health Endpoint: `http://localhost:4000/api/v1/health`
- Frontend ERP Shell: `http://localhost:3000`

---

## Documentation

Full architectural decisions, domain specifications, security guidelines, and development standards are maintained in the [`docs/`](./docs) directory:

- [Repository Audit](./docs/PHASE-0-REPOSITORY-AUDIT.md)
- [Technology Stack](./docs/TECH-STACK.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Domain Modules](./docs/DOMAIN-MODULES.md)
- [Database Foundation](./docs/DATABASE-FOUNDATION.md)
- [Multi-Tenancy](./docs/MULTI-TENANCY.md)
- [Security Foundation](./docs/SECURITY-FOUNDATION.md)
- [Architectural Decision Records](./docs/adr/)
