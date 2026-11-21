# SunPowerOS — Testing & Commissioning
## 8 Standard Electrical Tests & Mandatory Approval Gate

---

## 1. Overview

Testing & Commissioning (`COM-YYYY-000001`) verifies that the assembled solar PV generation facility satisfies safety codes, performance standards, and grid interconnection guidelines.

## 2. Standard 8 Testing Protocols

1. **INSULATION_RESISTANCE (Mandatory):** DC string to earth megger test at 1000V DC. Expected: `> 1.0 MΩ`.
2. **CONTINUITY (Mandatory):** Array frame, mounting structure, and rail ground continuity. Expected: `< 0.5 Ω`.
3. **POLARITY (Mandatory):** DC string polarity verification (positive to male MC4). Expected: `Confirmed`.
4. **VOC_OPEN_CIRCUIT (Mandatory):** Open circuit voltage within design temperature bounds.
5. **ISC_SHORT_CIRCUIT (Mandatory):** Short circuit current within expected irradiance-normalized bounds.
6. **EARTHING_RESISTANCE (Mandatory):** Dedicated solar chemical earth pit 3-point fall of potential test. Expected: `< 5.0 Ω` (IS 3043:2018).
7. **ANTI_ISLANDING (Mandatory):** Automatic inverter disconnection within 2 seconds upon grid loss simulation. Expected: `< 2.0 s`.
8. **INVERTER_EFFICIENCY (Optional):** Grid-connected power conversion efficiency. Expected: `> 97.0%`.

## 3. Strict Gate Enforcement
- When `approveCommissioning` is called, the system evaluates all test results.
- If ANY mandatory test has `testResult === 'FAIL'`, the service strictly throws a `BadRequestException` and aborts approval.
- Upon successful approval:
  - `CommissioningRecord.status = 'APPROVED'`
  - `ProjectInitiation.installationStatus = 'COMMISSIONED'`
  - `ProjectInitiation.commissioningStatus = 'APPROVED'`
  - All matching `ProductSerial` records have `commissionedAt` timestamped and `status = 'INSTALLED'`.
