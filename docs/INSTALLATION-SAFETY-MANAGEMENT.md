# SunPowerOS — Installation Safety & Stop-Work Controls
## Rooftop Safety Compliance & HSE Enforcement

---

## 1. Overview

Safety Management enforces zero-compromise environmental health and safety (HSE) protocols on hazardous rooftop solar worksites.

## 2. Daily Pre-Work Safety Review (`SAF-YYYY-000001`)
Conducted every morning prior to commencing rooftop work:
- **Mandatory Toolbox Talk:** Topic, briefing by supervisor, and attendance recording.
- **Mandatory PPE Verification:** Hard hats, high-traction safety shoes, high-visibility vests, cut-resistant gloves.
- **Fall Protection:** Full-body harnesses inspected, static lifeline secured to certified rooftop anchorage points.
- **Electrical Isolation:** Lockout/Tagout (LOTO) verification on existing electrical feeders.
- **Weather Cleared:** Wind speed < 30 km/h, no lightning, precipitation, or extreme wet surfaces.

## 3. Stop-Work Order & Work Isolation
- Any team member or safety officer observing an imminent hazard (e.g., excessive wind, compromised lifeline anchor, lightning risk) can issue a **Formal Stop-Work Order**.
- **System Action:**
  - `InstallationSafetyRecord.status = 'STOP_WORK'`
  - `ProjectInitiation.installationStatus = 'ON_HOLD'`
  - All active work orders are frozen; no new tasks can be marked completed.
- **Lifting Stop-Work:**
  - Requires documented corrective action by an authorized safety officer or project manager.
  - Calling `liftStopWork` marks `status = 'RESOLVED'` and restores project execution to `INSTALLATION_IN_PROGRESS`.

## 4. Incident Reporting (`INC-YYYY-000001`)
- Structured reporting capturing severity (`FIRST_AID`, `MEDICAL_TREATMENT`, `LOST_TIME_INJURY`, `NEAR_MISS`, `FATALITY`), immediate mitigation, root cause analysis, and regulatory reporting requirements.
