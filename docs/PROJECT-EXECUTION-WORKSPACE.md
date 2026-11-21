# SunPowerOS — Project Execution Workspace
## 360° Solar EPC Project Execution Cockpit

---

## 1. Overview

The Project Execution Workspace provides project managers and operations leadership with a single pane of glass to oversee rooftop solar installations from project initiation to final commissioning and handover.

## 2. Controlled Installation States

| State | Prerequisites | Allowed Next Actions |
|---|---|---|
| `READY_FOR_INSTALLATION` | Project initiated from confirmed Sales Order & advance paid | Assess site readiness, assemble crew |
| `SITE_READINESS_PENDING` | Initial assessment scheduled | Submit 12-point readiness review |
| `READY_FOR_EXECUTION` | Site readiness approved (or supervisor exception granted) | Assign crew, schedule visits, issue work order |
| `CREW_ASSIGNED` | Installation crew allocated | Schedule mobilization, verify material handover |
| `MATERIAL_HANDOVER_PENDING`| Materials dispatched from Phase 4 warehouse | Verify physical serials, accept site custody |
| `INSTALLATION_IN_PROGRESS` | Material custody accepted | Execute 9 standard installation tasks, log consumption |
| `INSTALLATION_COMPLETED` | 100% tasks marked completed | Initiate quality stage-gates & electrical inspections |
| `QUALITY_INSPECTION_PENDING`| Quality inspections in progress | Record measurements, resolve any rework |
| `COMMISSIONING_PENDING` | Pre-commissioning quality cleared | Run 8 standard tests, verify grid synchronization |
| `COMMISSIONED` | All mandatory commissioning tests passed (Voc, Isc, Earth <5Ω) | Process DISCOM net-metering & initiate customer handover |
| `CUSTOMER_HANDOVER_PENDING`| Net-meter energized | Complete punchlist items, collect customer signature |
| `COMPLETED` | Customer sign-off complete, 60-month warranty activated | Handoff to Phase 6 O&M / Warranty |
| `ON_HOLD` | Stop-Work order issued | Requires formal supervisor resolution to lift |

## 3. Cockpit Capabilities
- Real-time project KPI metrics (capacity, active tasks, open punchlists, expenditures).
- Direct fast-access tabs to Crew, Schedules, Work Orders, Custody, Safety, Quality, Testing, DISCOM, and Handover.
