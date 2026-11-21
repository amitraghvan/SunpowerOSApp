# SOLAROS ERP — DOCKER INFRASTRUCTURE SPECIFICATION

---

## 1. Containerized Services

| Service | Image | Internal Port | Host Port | Health Check |
| :--- | :--- | :--- | :--- | :--- |
| `postgres` | `postgres:16-alpine` | 5432 | 5432 | `pg_isready` |
| `redis` | `redis:7-alpine` | 6379 | 6379 | `redis-cli ping` |
| `minio` | `minio/minio` | 9000, 9001 | 9000, 9001 | `mc ready local` |
| `api` | Multi-stage Node 22 | 4000 | 4000 | `curl /api/v1/health` |
| `worker` | Multi-stage Node 22 | N/A | N/A | Process check |
| `web` | Multi-stage Node 22 | 3000 | 3000 | Next.js HTTP |

Refer to `infrastructure/docker/README.md` for complete CLI operational guides.
