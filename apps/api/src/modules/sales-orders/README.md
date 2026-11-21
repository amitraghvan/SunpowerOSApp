# SalesOrders Module

**Domain Group:** Commercial  
**Status:** Scaffolded (Phase 0 Foundation)  
**Ownership:** SolarOS Technical Architecture & Engineering Team

## Overview
Confirmed solar sales orders, payment milestone schedules, and execution authorization.

## Architectural Boundaries
- **Inbound Interface:** REST API endpoints under `/api/v1/sales-orders` (Phase-specific implementation).
- **Public Domain Interface:** Exported NestJS providers and service contracts.
- **Outbound Dependencies:**
  - Database access via `PrismaService`
  - Audit logging via `AuditModule`
  - Asynchronous events via `OutboxEvent` and BullMQ queues

## Implementation Roadmap
- [x] Phase 0: Domain module registration and boundary definition.
- [ ] Business CRUD, application handlers, and domain rules implemented in designated phase.
