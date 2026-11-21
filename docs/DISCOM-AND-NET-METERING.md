# SunPowerOS — DISCOM & Net-Metering Tracking
## Utility Approvals, Net-Meter Serialization & PM Surya Ghar Integration

---

## 1. Overview

The DISCOM Tracking subsystem (`UTL-YYYY-000001`) manages the regulatory and administrative milestones required to connect a rooftop solar power plant to the state electricity distribution grid.

## 2. Tracked Attributes
- DISCOM Name (e.g. MSEDCL, TPDDL, BESCOM, UGVCL, TANGEDCO).
- Division & Circle Substation Office.
- Consumer Account Number & Sanctioned Load (kW).
- Interconnection Voltage Level (Single-phase 230V or Three-phase 415V LT).
- Bi-Directional Net-Meter Serial Number & Meter Testing Certificate.
- Joint Inspection & Grid Synchronization Dates.

## 3. PM Surya Ghar Muft Bijli Yojana Central Subsidy
- Subsidy Portal Registration ID (National Portal for Rooftop Solar).
- Subsidy Claim Lifecycle:
  1. `NOT_APPLIED`
  2. `SUBMITTED`
  3. `INSPECTION_SCHEDULED`
  4. `APPROVED`
  5. `DISBURSED`
  6. `REJECTED`
