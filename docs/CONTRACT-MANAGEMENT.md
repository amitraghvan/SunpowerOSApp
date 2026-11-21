# SolarOS Contract Management & Payment Milestone Engine

## 1. Overview

The Contracts Service (`apps/api/src/modules/contracts/contracts.service.ts`) converts an accepted quotation into an executable legal Solar EPC contract with concurrency-safe document sequencing (`CON-YYYY-000001`).

## 2. Four-Stage Milestone Schedule

Every generated contract automatically instantiates four standard milestones:

```
[Milestone 1] 20% Advance on Contract Execution
     │
     ▼
[Milestone 2] 40% Material Dispatch (Panels, Inverter, Structure)
     │
     ▼
[Milestone 3] 30% Installation Completion (Mechanical & Electrical)
     │
     ▼
[Milestone 4] 10% Net Metering Commissioning & Discom Handover
```

## 3. Statutory & Warranty Clauses

- **Module Warranty:** 12-Year Workmanship + 25-Year 80% Linear Power Performance.
- **Inverter Warranty:** 5-Year Comprehensive Product Replacement.
- **Workmanship Warranty:** 5-Year Installation & Water Ingress Warranty on Roof Penetrations.
