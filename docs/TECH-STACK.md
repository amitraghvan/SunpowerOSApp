# SOLAROS ERP — TECHNOLOGY STACK SPECIFICATION

**Version:** 1.0  
**Status:** Approved & Implemented (Phase 0)  
**Target Workload:** Solar EPC Operations (40+ projects/month, 15+ technicians, Multi-Tenant SaaS)

---

## 1. Core Runtime & Monorepo Engine

- **Node.js:** `v22.18.0` (Active LTS)
- **Language:** TypeScript 5.7+ (Strict Mode enabled across all workspaces)
- **Package Manager:** `pnpm` 9.15.4 (Strict dependency isolation, symlinked node_modules, content-addressable storage)
- **Monorepo Build Orchestration:** Turborepo 2.3+ (Pipeline dependency graphs, task caching, topological execution)

---

## 2. Frontend Application Layer (`apps/web`)

- **Framework:** Next.js 15 (React 19, App Router, Server Components)
- **Styling:** Tailwind CSS 3.4+ with unified SolarOS Enterprise Tokens:
  - Primary: `#2563EB` (Royal Blue)
  - Success: `#14B8A6` (Teal)
  - Analytics: `#8B5CF6` (Violet)
  - Warning: `#F59E0B` (Amber)
  - Danger: `#F43F5E` (Rose)
  - Background: `#F7F9FC` (Cool Off-White)
  - Surface: `#FFFFFF` (Pure White)
- **Component Primitives:** Radix UI / shadcn/ui headless pattern
- **State & Server Cache:** TanStack Query v5 (React Query)
- **Table Virtualization & Filtering:** TanStack Table v8
- **Form Management:** React Hook Form + Zod schema validation
- **Data Visualization:** Recharts
- **Icons:** Lucide React

---

## 3. Backend Application Layer (`apps/api`)

- **Framework:** NestJS 11+ (Modular Monolith architecture, Dependency Injection)
- **API Protocol:** RESTful HTTP APIs with OpenAPI / Swagger specification at `/docs`
- **Validation:** `class-validator` + `class-transformer` with strict DTO whitelisting
- **Security:** Helmet, CORS, strict HTTP-only secure cookie support
- **Logging:** Structured JSON logging with correlation ID tracing
- **Worker Process:** Dedicated entrypoint (`src/worker.ts`) executing BullMQ consumers sharing the exact same NestJS module graph.

---

## 4. Persistence & Database

- **Engine:** PostgreSQL 16 (Docker Compose / Production) & PostgreSQL 14.20+ (Local Native Homebrew Dev)
- **ORM:** Prisma ORM 6.19+
- **Primary Keys:** UUID v4
- **Financial Fields:** SQL `Decimal(15, 2)` (Strictly avoiding IEEE 754 floating-point inaccuracies)
- **Timestamps:** UTC `TIMESTAMP WITH TIME ZONE`
- **Isolation:** Multi-tenant organization scoping with PostgreSQL Row-Level Security (RLS) policies.

---

## 5. Background Processing & Caching

- **Queue Engine:** BullMQ 5.40+
- **Cache & Redis:** Redis 7 Alpine
- **Reliability Pattern:** Transactional Outbox Pattern (`outbox_events` table + BullMQ dispatcher)
- **Dedicated Queues:** `notifications`, `documents`, `pdf-generation`, `reports`, `ai-processing`

---

## 6. Local & Cloud Object Storage

- **Local Development:** MinIO (S3-compatible, port 9000 API, port 9001 console)
- **Production Target:** AWS S3 / Cloudflare R2
- **Pre-configured Buckets:** `solaros-documents`, `solaros-surveys`, `solaros-assets`

---

## 7. Quality Assurance & Testing

- **Unit Testing:** Jest 29 + `ts-jest`
- **API & Integration Testing:** Supertest
- **End-to-End Testing:** Playwright
- **Performance / Load Testing:** k6
- **Code Standards:** ESLint + Prettier + EditorConfig
