# ADR-005: Selection of Prisma ORM

## Status
Accepted

## Context
TypeScript type safety from database schema to API layer is essential. Writing raw SQL strings or using weakly-typed ORMs results in runtime type mismatches and high maintenance burden.

## Decision
We select **Prisma ORM 6.3+**.
1. Declarative `schema.prisma` acts as the single source of truth for the domain model.
2. Auto-generated TypeScript types prevent type drift.
3. Advanced constraints and RLS policies are applied via explicit SQL migration scripts in `database/sql/`.

## Consequences
- **Positive:** Superior developer productivity, compile-time query type verification, reliable schema migrations.
- **Negative:** Advanced complex joins or custom PostgreSQL extensions require raw query fallbacks (`$queryRaw`).
