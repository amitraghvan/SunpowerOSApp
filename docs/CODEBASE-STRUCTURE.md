# SOLAROS ERP — CODEBASE STRUCTURE SPECIFICATION

---

## 1. Directory Layout

The repository is organized as a high-performance pnpm monorepo managed by Turborepo:

```text
solaros/
│
├── apps/
│   ├── web/                     # Next.js 15 App Router Frontend
│   │   ├── src/
│   │   │   ├── app/             # Route Groups: (auth), (erp), (technician), (portal)
│   │   │   ├── components/      # UI components & ERP layout
│   │   │   ├── lib/             # Utility helpers
│   │   │   ├── providers/       # React Query & global context providers
│   │   │   └── styles/          # Tailwind globals & design tokens
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                     # NestJS 11 Modular Monolith Backend
│       ├── src/
│       │   ├── main.ts          # API HTTP Server bootstrap
│       │   ├── worker.ts        # Dedicated Background Queue Worker
│       │   ├── app.module.ts    # Central Application Module registering all domains
│       │   ├── common/          # Filters, guards, interceptors, middleware
│       │   ├── config/          # Environment validation schemas
│       │   ├── database/        # Prisma Service & lifecycle
│       │   ├── infrastructure/  # Redis, BullMQ, MinIO Storage, Health
│       │   └── modules/         # 49 Domain Modules
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                      # Reusable component library & enterprise design tokens
│   ├── contracts/               # API contracts, DTO interfaces, error models
│   ├── types/                   # Core TypeScript types, tenant context, domain enums
│   ├── config/                  # Shared constants, queue names, storage buckets
│   └── eslint-config/           # Monorepo linting configurations
│
├── database/
│   ├── prisma/
│   │   ├── schema.prisma        # Canonical database schema
│   │   └── seeds/               # Multi-tenant development seeds
│   └── sql/
│       ├── indexes/             # Advanced partial and composite indexes
│       ├── constraints/         # Business domain database constraints
│       └── rls-policies/        # PostgreSQL Row-Level Security policies
│
├── infrastructure/
│   ├── docker/                  # Dockerfiles (API, Worker, Web) and container docs
│   ├── nginx/                   # Reverse proxy configuration
│   └── deployment/              # Staging and production manifests
│
├── tests/
│   ├── unit/                    # Token and configuration unit tests
│   ├── integration/             # Health and database integration tests
│   ├── e2e/                     # Playwright browser end-to-end test specs
│   └── performance/             # k6 health check load scenarios
│
├── docs/                        # Comprehensive architectural specifications & ADRs
├── .github/workflows/           # CI pipelines (lint, typecheck, test, build)
├── docker-compose.yml           # Full local development container stack
├── pnpm-workspace.yaml          # Workspace package mapping
├── turbo.json                   # Build and task execution graph
└── tsconfig.base.json           # Monorepo strict TypeScript configuration
```
