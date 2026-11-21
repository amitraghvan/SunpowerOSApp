# SOLAROS ERP — RBAC PHASE 1 SPECIFICATION
## Role-Based Access Control, Permissions Matrix & Operation Guards

---

## 1. System Roles in Phase 1

SolarOS defines standard roles for solar installation operations:

| Role Code | Description | Key Phase 1 Responsibilities |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Platform Operator | Cross-tenant administration, system maintenance |
| `ORG_ADMIN` | Solar EPC Company Owner | Full access across CRM, customers, surveys, catalog |
| `SALES_REP` | Sales Executive | Lead capture, qualification, conversion |
| `SOLAR_ENGINEER` | Technical Lead | Survey assessment review, feasibility approval, catalog management |
| `TECHNICIAN` | Field Operations | Site survey execution, photo uploads |
| `PROCUREMENT_OFFICER` | Supply Chain Lead | Hardware pricing, supplier catalog maintenance |

---

## 2. Permission Matrix for Phase 1 Domains

| Operation | `ORG_ADMIN` | `SALES_REP` | `SOLAR_ENGINEER` | `TECHNICIAN` | `PROCUREMENT_OFFICER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Capture Lead** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Convert Lead to Customer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Register Installation Site** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Schedule Site Survey** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Submit Technical Survey** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Upload Survey Photos** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Approve / Reject Survey** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Create Catalog Products** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Adjust Variant Prices** | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 3. Enforcement Layers

1. **HTTP Guard Layer:** `TenantGuard` enforces that every request has a validated tenant context.
2. **Controller Layer:** Decorators extract `tenantContext` verifying active membership.
3. **Database Layer:** Row-Level Security policies restrict rows regardless of application-level bugs.
