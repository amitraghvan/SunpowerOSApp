# SunPowerOS — Customer Handover & Punchlist Management
## Dossier Sign-Off, Punchlist Resolution & 60-Month Warranty

---

## 1. Overview

Customer Handover (`CHO-YYYY-000001`) represents the final formal handoff of the commissioned solar plant to the asset owner.

## 2. Handover Dossier Documents
- As-Built Single Line Diagram (SLD) and Layout Drawing.
- Inverter & Module OEM Warranty Cards.
- Factory Test Reports and Commissioning Certificate.
- DISCOM Joint Inspection Report (JIR) and Net-Meter Test Card.
- System Operations & Maintenance (O&M) User Manual.

## 3. Punchlist Severity Gate
- Items can be logged with severities: `MINOR`, `MODERATE`, `MAJOR`.
- **Strict Invariant:** Handover sign-off is blocked with `BadRequestException` if any `MAJOR` punchlist item remains unresolved.
- All punchlist items must be verified and signed off before closure.

## 4. Warranty Activation & Phase 6 Handoff
- Upon formal sign-off:
  - Customer satisfaction score (1 to 5) and feedback captured.
  - Digital signatures collected for customer and company representative.
  - Standard 60-month (5-year) workmanship warranty is activated with precise `warrantyStartDate` and `warrantyEndDate`.
  - `ProjectInitiation.installationStatus = 'COMPLETED'`.
  - Installed equipment and serial numbers transition seamlessly to Phase 6 Warranty, Maintenance, and AMC management.
