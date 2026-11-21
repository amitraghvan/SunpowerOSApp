# SunPowerOS — Installation Scheduling
## Multi-Visit Site Planning & Conflict Management

---

## 1. Overview

Installation Scheduling coordinates technician crews, equipment deliveries, and utility inspectors across distinct site mobilization visits.

## 2. Visit Types
- `MOBILIZATION`: Initial site establishment, material staging, and safety line rigging.
- `STRUCTURE_INSTALLATION`: Roof fastener anchoring, rail mounting, and torque verification.
- `PANEL_MOUNTING`: Solar module coplanar clamping and string DC cabling.
- `ELECTRICAL_WIRING`: Inverter mounting, AC-DB connection, cable conduit routing, and earth pit installation.
- `COMMISSIONING`: Technical testing, Voc/Isc measurement, and inverter energization.
- `UTILITY_INSPECTION`: DISCOM inspector joint walk-through and bi-directional meter sealing.
- `CUSTOMER_HANDOVER`: Joint walkthrough, customer training, and dossier sign-off.

## 3. Conflict Detection & Audit
- Automatic validation preventing double-booking of crews or technician profiles on overlapping date ranges.
- Documented rescheduling workflows capturing reason codes (`WEATHER_DELAY`, `CUSTOMER_UNAVAILABLE`, `MATERIAL_TRANSIT_DELAY`, `GRID_OUTAGE`) with audit logging.
