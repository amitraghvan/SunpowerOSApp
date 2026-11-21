# SolarOS Sales Order Workflow & Project Initiation Handoff

## 1. Strict Prerequisite Gates

A Sales Order represents a firm commercial commitment to procure hardware and dispatch engineering installation teams. To prevent procurement without payment and design validation, SolarOS enforces four strict prerequisite gates:

```mermaid
flowchart TD
    G1[Gate 1: Approved Engineering Design] --> OK1{Valid?}
    G2[Gate 2: Approved & Frozen BOM] --> OK2{Valid?}
    G3[Gate 3: Signed & Active Contract] --> OK3{Valid?}
    G4[Gate 4: 20% Advance Payment Cleared] --> OK4{Cleared?}

    OK1 & OK2 & OK3 & OK4 --> CONFIRM[confirmSalesOrder()]
    CONFIRM --> PRJ[Project Initiation Handover PRJ-YYYY-000001]
```

## 2. Order Confirmation & Downstream Handover

When `confirmSalesOrder` executes:
1. Sales order transitions to `CONFIRMED`.
2. Fulfillment status transitions from `PENDING_ADVANCE` to `PROCUREMENT`.
3. An immutable `project_initiations` record is generated with code `PRJ-YYYY-000001`.
4. Downstream pipelines for Phase 3 (Procurement POs), Phase 4 (Warehouse Serial Dispatch), and Phase 5 (Site Commissioning) receive full technical and commercial specifications.
