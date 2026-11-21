# Suppliers Module

**Domain Group:** Supply Chain  
**Status:** Scaffolded (Phase 0 Foundation)  
**Ownership:** SolarOS Technical Architecture & Engineering Team

## Overview
OEM manufacturers, equipment vendors, and solar distributor directories.

## Architectural Boundaries
- **Inbound Interface:** REST API endpoints under `/api/v1/suppliers` (Phase-specific implementation).
- **Public Domain Interface:** Exported NestJS providers and service contracts.
- **Outbound Dependencies:**
  - Database access via `PrismaService`
  - Audit logging via `AuditModule`
  - Asynchronous events via `OutboxEvent` and BullMQ queues

## Implementation Roadmap
- [x] Phase 0: Domain module registration and boundary definition.
- [ ] Business CRUD, application handlers, and domain rules implemented in designated phase.
