# SunPowerOS — Phase 5 API Documentation
## Site Execution, Crew Management, Safety, Commissioning & Handover Endpoints

All endpoints are protected by `JwtAuthGuard`, tenant isolation RLS, and explicit RBAC permission checks (`@RequirePermission`).

---

## 1. Project Execution Workspace (`/api/v1/installation/projects`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/projects` | `installation:read` | List installation projects with status, capacity & crew filters |
| GET | `/projects/:id` | `installation:read` | Complete 360° installation project cockpit details |
| PATCH | `/projects/:id/status` | `installation:manage` | Advance project execution status |
| POST | `/projects/:id/assign-manager` | `installation:manage` | Assign project manager |

---

## 2. Technician & Crew Management (`/api/v1/installation/crews`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/technicians` | `installation:read` | List technician profiles, skills and certifications |
| POST | `/technicians` | `installation:manage` | Register technician profile (`TECH-YYYY-000001`) |
| GET | `/crews` | `installation:read` | List installation crews with member rosters |
| POST | `/crews` | `installation:manage` | Assemble installation crew (`CRW-YYYY-000001`) |
| POST | `/crews/:id/assign` | `installation:assign` | Assign crew to project initiation |

---

## 3. Installation Scheduling (`/api/v1/installation/schedules`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/schedules` | `installation:read` | List site visit schedules with date ranges |
| POST | `/schedules` | `installation:manage` | Create installation visit schedule (`SCH-YYYY-000001`) |
| PATCH | `/schedules/:id/reschedule`| `installation:manage` | Reschedule visit with documented reason code |

---

## 4. Site Readiness (`/api/v1/installation/readiness`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/readiness` | `installation:execute` | Create 12-point site readiness assessment (`SRR-YYYY-000001`) |
| GET | `/projects/:id/readiness` | `installation:read` | Get readiness records for a project |
| POST | `/readiness/:id/exception` | `installation:manage` | Supervisor approval with exception |

---

## 5. Work Orders & Tasks (`/api/v1/installation/work-orders`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/work-orders` | `installation:manage` | Generate work order (`IWO-YYYY-000001`) with 9 tasks |
| GET | `/work-orders/:id` | `installation:read` | Get work order details, progress % & milestones |
| PATCH | `/work-orders/:id/tasks/:taskKey`| `installation:execute` | Update task progress, status and notes |

---

## 6. Material Handover & Site Custody (`/api/v1/installation/material-handover`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/handovers` | `installation:execute` | Create material handover record (`MHO-YYYY-000001`) |
| PATCH | `/handovers/:id/lines/verify` | `installation:execute` | Verify line item and scan serial numbers |
| POST | `/handovers/:id/accept` | `installation:manage` | Accept custody on site (Zero double stock deduction) |
| POST | `/consumption` | `installation:execute` | Log material consumption (`CON-YYYY-000001`) |

---

## 7. Safety Management & Stop-Work (`/api/v1/installation/safety`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/safety-records` | `installation:execute` | Create daily toolbox talk record (`SAF-YYYY-000001`) |
| POST | `/safety-records/:id/observations` | `installation:execute` | Add unsafe condition / near-miss observation |
| POST | `/safety-records/:id/stop-work` | `installation:manage` | Issue formal stop-work order (freezes project ON_HOLD) |
| POST | `/safety-records/:id/lift-stop-work` | `installation:manage` | Lift stop-work order (restores IN_PROGRESS) |
| POST | `/incidents` | `installation:execute` | Report safety incident (`INC-YYYY-000001`) |

---

## 8. Quality Inspection Stage-Gates (`/api/v1/installation/quality`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/inspections` | `installation:inspect` | Create stage-gate inspection (`IQI-YYYY-000001`) |
| POST | `/inspections/:id/resolve-rework` | `installation:inspect` | Resolve rework requirement from failed inspection |

---

## 9. Testing & Commissioning (`/api/v1/installation/commissioning`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/commissioning` | `installation:commission`| Create commissioning record (`COM-YYYY-000001`) |
| POST | `/commissioning/:id/tests` | `installation:commission`| Record individual test measurement |
| POST | `/commissioning/:id/approve` | `installation:approve` | Approve commissioning (Strict gate: 0 failed mandatory tests) |
| POST | `/commissioning/:id/reject` | `installation:approve` | Reject commissioning with rework instruction |

---

## 10. DISCOM & Utility Tracking (`/api/v1/installation/discom`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/utility-tracking` | `installation:manage` | Initialize DISCOM tracking record (`UTL-YYYY-000001`) |
| GET | `/projects/:id/utility-tracking`| `installation:read` | Get DISCOM tracking for project |
| PATCH | `/utility-tracking/:id` | `installation:manage` | Update feasibility, net meter serial, grid sync & subsidy |

---

## 11. Customer Handover & Closure (`/api/v1/installation/customer-handover`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/customer-handover` | `installation:manage` | Initialize handover process (`CHO-YYYY-000001`) |
| GET | `/projects/:id/customer-handover` | `installation:read` | Get customer handover details and punchlist |
| POST | `/customer-handover/:id/punchlist` | `installation:execute` | Add punchlist item |
| PATCH | `/customer-handover/punchlist/:id/resolve` | `installation:execute` | Resolve punchlist item |
| POST | `/customer-handover/:id/sign-off` | `installation:manage` | Final customer sign-off & start 60-month warranty |

---

## 12. Execution Cost Tracking (`/api/v1/installation/costs`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/costs` | `installation:manage` | Record site expense (`CST-YYYY-000001`) |
| GET | `/projects/:id/costs` | `installation:read` | List project expenses |
| GET | `/projects/:id/cost-summary` | `installation:read` | Category-wise expenditure summary |
