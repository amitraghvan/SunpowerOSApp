# SunPowerOS — Phase 5 System Architecture
## Solar Installation, Project Execution, Testing, Commissioning & Customer Handover

---

## 1. Architectural Overview

Phase 5 represents the EPC site execution engine within the SunPowerOS modular monolith. Building upon Phase 4 (Warehouse, Inventory Stock Ledger, and Dispatched Material), Phase 5 governs physical delivery on site through project completion and warranty commencement.

```
+-------------------------------------------------------------------------------------------------------+
|                                    PHASE 5: SITE EXECUTION LIFECYCLE                                  |
+-------------------------------------------------------------------------------------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Project Initiation (Phase 2 & Phase 4 Dispatch)    |
                        |  installationStatus: READY_FOR_INSTALLATION          |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Technician & Crew Management (Module 2)            |
                        |  - Profile & Skills Mapping                         |
                        |  - Certification Expiry Tracking                    |
                        |  - Crew Assignment (CRW-YYYY-000001)                |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Installation Scheduling (Module 3)                 |
                        |  - Mobilization, Mounting, Commissioning Visits     |
                        |  - Overlap / Conflict Detection                     |
                        |  - Documented Rescheduling Audit                    |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Site Readiness Assessment (Module 4)               |
                        |  - 12-point Pre-Installation Checklist             |
                        |  - Mandatory Checks Gating Execution                |
                        |  - Controlled Supervisor Exception Bypass           |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Work Orders & Tasks Execution (Module 5)           |
                        |  - IWO-YYYY-000001 with 9 Standard Tasks            |
                        |  - 7 Automated Milestone Transitions                |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Material Custody & Site Verification (Module 6)    |
                        |  - MHO-YYYY-000001 from Phase 4 Dispatch/Challan    |
                        |  - CRITICAL RULE: ZERO DOUBLE STOCK DEDUCTION       |
                        |  - Serial Verification & Allocation (ALLOCATED)     |
                        |  - Consumption Logging (CON-YYYY-000001 -> INSTALLED|
                        +--------------------------+--------------------------+
                                                   |
             +-------------------------------------+-------------------------------------+
             |                                                                           |
+------------v-----------------------------+                 +---------------------------v-------------+
|  Daily Safety & HSE Control (Modules 7-8) |                 |  Quality Inspection Gates (Module 9)   |
|  - SAF-YYYY-000001 Toolbox Talk & PPE     |                 |  - IQI-YYYY-000001 7 Stage-Gates        |
|  - Safety Observations & Incidents        |                 |  - Mandatory Tolerance Failure Gate     |
|  - Stop-Work: Freezes Project ON_HOLD     |                 |  - Rework Resolution Flow               |
|  - Lift Stop-Work: Restores to IN_PROGRESS|                 +---------------------------+-------------+
+------------+-----------------------------+                                             |
             |                                                                           |
             +-------------------------------------+-------------------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Testing & Commissioning (Module 10)                |
                        |  - COM-YYYY-000001 with 8 Mandatory Test Protocols  |
                        |  - Voc, Isc, Earth Pit (<5Ω), Anti-Islanding (<2s)  |
                        |  - STRICT GATE: Any failed test blocks approval     |
                        |  - Approval stamps serials commissionedAt           |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  DISCOM & Net-Metering Tracking (Module 11)         |
                        |  - UTL-YYYY-000001 Feasibility & Meter Testing      |
                        |  - Bi-Directional Net-Meter Serial Number           |
                        |  - PM Surya Ghar Muft Bijli Yojana Subsidy Workflow |
                        +--------------------------+--------------------------+
                                                   |
                        +--------------------------v--------------------------+
                        |  Customer Handover & Closure (Module 12)            |
                        |  - CHO-YYYY-000001 Dossier & Sign-Off               |
                        |  - Open Punchlist Severity Resolution Gate          |
                        |  - 60-Month Warranty Period Commencement            |
                        |  - Transition project to COMPLETED                  |
                        +-----------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Project Execution Workspace
- Extends `ProjectInitiation` with `installationStatus` and `commissioningStatus`.
- State Machine:
  1. `READY_FOR_INSTALLATION`
  2. `SITE_READINESS_PENDING`
  3. `READY_FOR_EXECUTION`
  4. `CREW_ASSIGNED`
  5. `MATERIAL_HANDOVER_PENDING`
  6. `INSTALLATION_IN_PROGRESS`
  7. `INSTALLATION_COMPLETED`
  8. `QUALITY_INSPECTION_PENDING`
  9. `COMMISSIONING_PENDING`
  10. `COMMISSIONED`
  11. `CUSTOMER_HANDOVER_PENDING`
  12. `COMPLETED`
  - Exception states: `ON_HOLD` (via Stop-Work Order), `CANCELLED`.

### 2.2 Material Custody & The Zero Double Deduction Invariant
- Phase 4 dispatch already posted `DISPATCH_ISSUE` to `inventory_receipt_movements`.
- When material reaches the project site, the site supervisor accepts physical custody via `ProjectMaterialHandover` (`MHO`).
- **Invariant:** No movements are posted to `inventory_receipt_movements` during site handover or consumption.
- Equipment serial numbers move from `IN_STOCK` -> `ALLOCATED` (during MHO signoff) -> `INSTALLED` (during consumption logging `CON`).

### 2.3 Strict Quality & Commissioning Gates
- Commissioning approval enforces 8 standardized electrical tests:
  1. Insulation Resistance (Megger 1000V DC > 1.0 MΩ)
  2. Ground Continuity (< 0.5 Ω)
  3. String Polarity
  4. Voc Open Circuit Voltage
  5. Isc Short Circuit Current
  6. Dedicated Earth Pit Resistance (< 5.0 Ω as per IS 3043:2018)
  7. Anti-Islanding Trip Time (< 2.0 s)
  8. Inverter Conversion Efficiency (> 97%)
- If any mandatory test fails, `approveCommissioning` throws `BadRequestException`.

### 2.4 Mobile Technician Experience
- Designed specifically for field technicians on 360px-480px touchscreens.
- Quick action tabs: Tasks, Safety Review, Serial Matching, and Commissioning Tests.
