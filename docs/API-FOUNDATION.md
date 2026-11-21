# SOLAROS ERP — API ARCHITECTURE & FOUNDATION

---

## 1. REST Standards

- **Base Prefix:** `/api/v1`
- **Swagger Documentation:** `/docs`
- **Correlation ID Header:** `x-correlation-id`
- **Tenant Context Header:** `x-organization-id`
- **Branch Context Header:** `x-branch-id`

---

## 2. Standard Response & Error Envelope

All error responses strictly conform to `ApiErrorResponse` (`@solaros/contracts`):

```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request",
  "correlationId": "f7d23a60-9114-411a-8bb7-d8c9735d1f88",
  "timestamp": "2026-11-21T08:30:00.000Z",
  "path": "/api/v1/auth/login"
}
```

---

## 3. Real Dependency Health Endpoint

`GET /api/v1/health`

Performs active connection verification against PostgreSQL, Redis, and MinIO:

```json
{
  "status": "healthy",
  "timestamp": "2026-11-21T08:30:00.000Z",
  "uptimeSeconds": 124,
  "version": "0.1.0",
  "environment": "development",
  "dependencies": {
    "database": { "status": "UP", "latencyMs": 4, "timestamp": "..." },
    "redis": { "status": "UP", "latencyMs": 2, "timestamp": "..." },
    "storage": { "status": "UP", "latencyMs": 12, "timestamp": "..." }
  }
}
```
