# ADR-002: Adoption of pnpm Workspaces & Turborepo Monorepo

## Status
Accepted

## Context
SolarOS requires multiple frontend user experiences (ERP Backoffice, Field Technician Portal, Customer Self-Service Portal), a unified NestJS API, background workers, database schema, and shared domain types/contracts. Maintaining separate repositories would cause contract drift, version mismatch, and painful release synchronization.

## Decision
We adopt a **pnpm Workspaces + Turborepo Monorepo**:
1. `apps/*`: Next.js web application and NestJS API.
2. `packages/*`: Shared UI design system, API contracts, TypeScript types, constants, and lint configs.
3. `database`: Prisma schema and database migrations.
4. Turborepo manages the build graph, topological task execution, and incremental caching.

## Consequences
- **Positive:** Atomic cross-cutting pull requests, zero contract drift, shared types across full stack, blazingly fast cached builds.
- **Negative:** Monorepo tooling setup requires strict workspace dependency hygiene (`workspace:*`).
