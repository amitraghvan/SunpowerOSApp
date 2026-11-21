# SOLAROS ERP — DEPLOYMENT FOUNDATION SPECIFICATION

---

## 1. Target Deployment Environments

1. **Local Development:** Docker Compose or native Homebrew services.
2. **Staging Environment:** Single-node or managed Kubernetes cluster with staging database and Redis cluster.
3. **Production SaaS:** High-availability managed PostgreSQL (AWS RDS / GCP Cloud SQL), Redis Cluster (AWS ElastiCache), and S3 object storage with CDN.

---

## 2. CI/CD Deployment Flow

```text
GitHub Push (main)
       |
       v
GitHub Actions CI Pipeline:
  - Lint & Formatting Check
  - Strict TypeScript Validation
  - Unit & Integration Test Suites
  - Production Container Build
       |
       v
Push to Container Registry (GHCR / ECR)
       |
       v
Automated Staging Deployment & Smoke Testing
```
