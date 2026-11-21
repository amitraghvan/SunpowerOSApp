# ADR-007: RESTful API Architecture & OpenAPI Specification

## Status
Accepted

## Context
The backend API serves multiple clients: the Next.js ERP backoffice, the Field Technician mobile experience, the Customer Portal, and future third-party integrations (inverter cloud telemetry, utility portals).

## Decision
We adopt **RESTful HTTP APIs with OpenAPI / Swagger**:
1. Base prefix: `/api/v1`.
2. DTO validation with `class-validator` and `class-transformer`.
3. Auto-generated interactive Swagger UI at `/docs`.
4. Standardized error response envelope (`ApiErrorResponse`).
5. Real dependency health check endpoint at `/api/v1/health`.

## Consequences
- **Positive:** Universal client compatibility, predictable caching, self-documenting API contracts, simple debugging.
- **Negative:** Requires rigorous DTO definitions and versioning discipline.
