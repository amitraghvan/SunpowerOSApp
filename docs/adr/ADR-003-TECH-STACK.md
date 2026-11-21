# ADR-003: Selection of Core Technology Stack

## Status
Accepted

## Context
The stack must support rapid full-stack TypeScript development, strict static typing, robust database operations, real-time background processing, and enterprise UI components.

## Decision
We standardize on:
- **Runtime:** Node.js 22 LTS with strict TypeScript 5.7+
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Radix/shadcn UI
- **Backend:** NestJS 11 with class-validator DTOs and Swagger OpenAPI
- **Database:** PostgreSQL 16 with Prisma ORM
- **Queues:** Redis 7 with BullMQ
- **Object Storage:** MinIO / AWS S3

## Consequences
- **Positive:** Single language (TypeScript) across the entire stack, rich enterprise ecosystem, high hiring availability.
- **Negative:** Requires disciplined memory management for long-running Node.js worker processes.
