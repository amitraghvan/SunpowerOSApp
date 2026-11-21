# ADR-001: Adoption of Modular Monolith Architecture

## Status
Accepted

## Context
SolarOS is an ERP and operations management platform for Solar EPC companies with an initial target capacity of ~40 installations monthly, 15 field technicians, and residential/commercial solar workflows. The engineering team consists of 4-6 developers. We need high developer velocity, transactional consistency across inventory, projects, and billing, and domain boundaries that can scale to multi-tenancy.

Microservices would introduce premature network latency, distributed transaction overhead (two-phase commit / saga complexity), deployment orchestration overhead, and severe cognitive load.

## Decision
We adopt a **Modular Monolith** architecture powered by NestJS.
1. All business domains are partitioned into dedicated, encapsulated NestJS modules (`modules/crm`, `modules/projects`, `modules/inventory`, etc.).
2. Direct cross-module database writes are prohibited; communication occurs through explicit exported service contracts or transactional outbox events.
3. The application is deployed as a single unit with a dedicated worker process entrypoint for asynchronous tasks.

## Consequences
- **Positive:** Maximum developer velocity, simplified local debugging, single transactional database, zero inter-service network overhead.
- **Negative:** Requires strict module boundary discipline; accidental coupling must be prevented by code reviews and linting rules.
