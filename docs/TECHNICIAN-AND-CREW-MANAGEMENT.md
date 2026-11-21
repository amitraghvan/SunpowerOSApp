# SunPowerOS — Technician & Crew Management
## Field Workforce, Skills Matrix & Certification Tracking

---

## 1. Overview

Technician & Crew Management links ERP users to physical field installation resources. It ensures that personnel assigned to solar sites possess the requisite electrical and rooftop safety certifications.

## 2. Technician Profiles (`TECH-YYYY-000001`)
- Linked 1:1 with `User` accounts.
- Attributes: Primary trade (`MECHANICAL_FITTER`, `ELECTRICIAN`, `HELPER`, `SAFETY_OFFICER`, `COMMISSIONING_ENGINEER`), years of experience, emergency contacts, daily labor rates.
- **Skills Matrix:** Proficiency ratings (1-5) across Structural Mounting, Module Clamping, DC Cabling, Inverter Commissioning, Earth Pit Resistance Testing, and Net-Meter Liaison.
- **Certifications & Compliance:**
  - DISCOM Authorized Wireman License
  - Height Safety & Fall Arrest Certification
  - First Aid & CPR
  - Inverter OEM Certified Installer
  - Expiry date tracking with automated alerts for expired credentials.

## 3. Crew Assembly (`CRW-YYYY-000001`)
- Grouping of technicians under an assigned `CREW_LEADER` or site supervisor.
- Crew states: `ACTIVE`, `DEPLOYED`, `RESTRICTED`, `DECOMMISSIONED`.
- Conflict-free assignment engine preventing overlapping commitments across concurrent projects.
