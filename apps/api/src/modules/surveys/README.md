# Surveys Module

**Domain Group:** Commercial  
**Status:** Scaffolded (Phase 0 Foundation)  
**Ownership:** SolarOS Technical Architecture & Engineering Team

## Overview
Site survey requests, technician roof measurements, shading analysis, and photos.

## Architectural Boundaries
- **Inbound Interface:** REST API endpoints under `/api/v1/surveys` (Phase-specific implementation).
- **Public Domain Interface:** Exported NestJS providers and service contracts.
- **Outbound Dependencies:**
  - Database access via `PrismaService`
  - Audit logging via `AuditModule`
  - Asynchronous events via `OutboxEvent` and BullMQ queues

## Implementation Roadmap
- [x] Phase 0: Domain module registration and boundary definition.
- [ ] Business CRUD, application handlers, and domain rules implemented in designated phase.
