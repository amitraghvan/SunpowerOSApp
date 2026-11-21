# SunPowerOS — Solar EPC Enterprise Operating Platform

SunPowerOS (by SunPower Solutions) is an enterprise SaaS ERP platform purpose-built for Solar EPC (Engineering, Procurement, and Construction) companies operating in India.

## Architecture Highlights

- **Architecture:** Modular Monolith + Monorepo + Domain-Driven Design + PostgreSQL Row-Level Security
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Odoo Enterprise visual design system (`--erp-*`)
- **Public Website:** Product-led SaaS experience with Caveat editorial typography, plum branding (`#714B67`), and self-service registration
- **Backend:** NestJS 11, TypeScript, REST APIs, Swagger/OpenAPI, class-validator, Argon2id encryption
- **Database:** PostgreSQL 14 with Prisma ORM, UUID primary keys, Decimal financial types, and engine-level multi-tenant RLS
- **Queues & Cache:** Redis 7 & BullMQ
- **Object Storage:** MinIO / AWS S3 compatible (geo-tagged survey photo audits & attachments)
- **Monorepo:** pnpm workspaces with Turborepo (7 packages)

---

## Capabilities & Phase Breakdown

1. **Phase 0 & 0.5 (Infrastructure & IAM):** Argon2id auth, multi-tenant RLS, role-based access control (RBAC), organization & branch switching, audit logging.
2. **Phase 1 (Commercial & Site Assessment):** CRM opportunity pipeline, Customer 360 multi-site directory, technical site surveys, solar equipment catalog.
3. **Phase 2 (Solar Engineering & Contracts):** Automated string sizing calculation, 5-point inverter electrical compatibility validation, 6-category BOM generation, dynamic multi-rate GST quotations, EPC contracts, and 4-gate prerequisite sales orders.
4. **Phase 3 (Procurement & Inward Operations):** Supplier registry, MRP net requirements explosion, RFQs & vendor quotation comparison, versioned purchase orders, goods receipt notes (GRN), inward quality inspection, and panel/inverter serial tracking.
5. **Master UX & Enterprise ERP Overhaul:**
   - Public Website: Varied compositions (connected timeline, activity flowchart, compact integration strip, analytics cockpit, consolidated 18-app ecosystem).
   - Public Pages: `/features`, `/solutions`, `/security`, `/contact`, `/signup`, `/login`.
   - ERP Application Shell: Compact 58px topbar (`erp-topbar.tsx`), 252px collapsible grouped sidebar (`erp-sidebar.tsx`), standardized data tables, smart buttons, status pipeline ribbons, empty states, and skeleton loaders.

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
