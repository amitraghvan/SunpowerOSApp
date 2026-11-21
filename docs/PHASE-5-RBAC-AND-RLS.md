# SunPowerOS — Phase 5 RBAC & RLS Security Architecture

---

## 1. Permission Registry

Phase 5 registers 24 granular permissions under the `installation` category:

```typescript
// Read
'installation:read'
'installation:schedules:read'
'installation:safety:read'
'installation:quality:read'
'installation:commissioning:read'
'installation:costs:read'

// Create & Execute
'installation:create'
'installation:execute'
'installation:safety:create'
'installation:incidents:report'
'installation:readiness:assess'
'installation:punchlist:create'

// Quality & Commissioning
'installation:inspect'
'installation:rework:resolve'
'installation:commission'
'installation:test:record'

// Management & Assignment
'installation:assign'
'installation:manage'
'installation:stop_work:issue'
'installation:costs:record'

// Approvals & Sign-Off
'installation:approve'
'installation:stop_work:lift'
'installation:readiness:override'
'installation:handover:signoff'
```

---

## 2. System Role Templates

| System Role | Key Permissions Assigned |
|---|---|
| `PROJECT_MANAGER` | Full operational authority: create, assign, manage, stop-work, approve, handover signoff |
| `INSTALLATION_SUPERVISOR` | Manage site tasks, conduct safety reviews, issue stop-work, verify material custody, sign readiness |
| `INSTALLATION_TECHNICIAN` | Read schedules, view work orders, update assigned task progress, view safety guidelines |
| `ELECTRICAL_TECHNICIAN` | Update cabling/inverter tasks, conduct pre-commissioning tests, record megger and continuity |
| `COMMISSIONING_ENGINEER` | Create commissioning records, record all 8 technical tests, grid sync verification |
| `QUALITY_INSPECTOR` | Create stage-gate inspections, log deviations, enforce rework, verify rework resolution |

---

## 3. PostgreSQL Row-Level Security (RLS) Coverage

Migration script `database/sql/rls-policies/007_phase5_tenant_isolation.sql` enables `ROW LEVEL SECURITY` and forces strict tenant isolation policies on all 29 Phase 5 tables:

```sql
ALTER TABLE "technician_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technician_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technician_certifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_crews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crew_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_readiness_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_readiness_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_material_handovers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material_handover_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material_consumptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_safety_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "safety_checklist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "safety_observations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "safety_incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "installation_quality_inspections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quality_inspection_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commissioning_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commissioning_tests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "utility_connection_trackings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_handovers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "handover_punchlist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_handover_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_cost_records" ENABLE ROW LEVEL SECURITY;
```

Each table is enforced by standard tenant isolation policy:
```sql
CREATE POLICY "tenant_isolation_policy" ON "<table>"
AS RESTRICTIVE
USING ("organizationId" = CURRENT_SETTING('app.current_organization_id', true)::uuid);
```
