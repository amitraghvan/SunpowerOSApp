# SOLAROS ERP — DEVELOPMENT & ENGINEERING STANDARDS

---

## 1. Monorepo Principles

- **No Implicit Dependencies:** All cross-package imports must be declared explicitly in `package.json` (`workspace:*`).
- **No Circular Imports:** Packages follow a strict DAG: `types -> contracts -> config -> ui -> apps`.
- **Strict TypeScript:** `noImplicitAny: true`, `strictNullChecks: true`, `strict: true`. The use of `any` is prohibited without documented justification.

---

## 2. Git & Commit Conventions

Follow Conventional Commits:
- `feat(crm): add lead qualification pipeline`
- `fix(inventory): prevent duplicate serial registration`
- `refactor(engineering): optimize PV array string calculation`
- `chore(deps): update prisma client to 6.3.0`
