# Scheduling Module

**Domain Group:** Project Management  
**Status:** Scaffolded (Phase 0 Foundation)  
**Ownership:** SolarOS Technical Architecture & Engineering Team

## Overview
Field technician calendar scheduling, survey appointments, and dispatch slots.

## Architectural Boundaries
- **Inbound Interface:** REST API endpoints under `/api/v1/scheduling` (Phase-specific implementation).
- **Public Domain Interface:** Exported NestJS providers and service contracts.
- **Outbound Dependencies:**
  - Database access via `PrismaService`
  - Audit logging via `AuditModule`
  - Asynchronous events via `OutboxEvent` and BullMQ queues

## Implementation Roadmap
- [x] Phase 0: Domain module registration and boundary definition.
- [ ] Business CRUD, application handlers, and domain rules implemented in designated phase.
