# SolarOS ERP — Production Deployment Security Guide

## 1. Secrets Management
- Never commit `.env` or production credentials into source control (`.gitignore` enforces exclusion).
- Secrets must be injected via environment variables or secret managers (e.g. AWS Secrets Manager, HashiCorp Vault):
  - `DATABASE_URL`: Dedicated unprivileged role `solaros_app`.
  - `REDIS_PASSWORD`: Secure Redis cluster auth.
  - `STORAGE_ACCESS_KEY` & `STORAGE_SECRET_KEY`: S3/MinIO bucket access.

## 2. PostgreSQL Role Configuration
Production instances must maintain two distinct database users:
1. **Migration / Owner User (`solaros_migrator`)**: Possesses DDL privileges (`CREATE TABLE`, `ALTER TABLE`) to apply Prisma migrations.
2. **Runtime Application User (`solaros_app`)**: Strictly non-superuser, no `BYPASSRLS` privileges, granted only `SELECT`, `INSERT`, `UPDATE`, `DELETE` on required tables.

## 3. Reverse Proxy & Network Hardening
- Terminate TLS (HTTPS) at reverse proxy (e.g. Nginx, Cloudflare, Traefik).
- Set `NODE_ENV=production` to activate `secure: true` on cookies.
- Helmet security headers: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`).
- Rate limiting: Redis-backed IP rate limiter mounted on `/api/v1/auth/login` (max 10 requests per minute).
