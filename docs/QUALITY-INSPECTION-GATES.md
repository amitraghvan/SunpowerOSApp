# SunPowerOS — Quality Inspection Stage-Gates
## 7-Stage Technical Inspection & Rework Enforcement

---

## 1. Overview

Quality Inspection Stage-Gates (`IQI-YYYY-000001`) ensure that every mechanical, structural, and electrical element meets stringent engineering tolerances before energized commissioning.

## 2. The 7 Inspection Stages

| Stage | Checkpoint Key | Name & Tolerance Criteria | Mandatory |
|---|---|---|---|
| `STRUCTURE_MOUNTING` | `ANCHOR_TORQUE` | Anchor Bolt Fastener Torque (M10: 40 Nm ± 2 Nm) | Yes |
| | `TILT_ANGLE` | Structure Tilt Angle (Designed tilt ± 1°) | Yes |
| | `CORROSION_COATING` | Hot Dip Galvanization Integrity (Min 80 microns) | Yes |
| `PANEL_ALIGNMENT_TORQUE` | `MID_END_CLAMPS` | Mid & End Clamp Fastener Torque (9-10 Nm with EPDM) | Yes |
| | `STRING_ALIGNMENT` | Array Coplanar Pitch & Azimuth Alignment (No twist) | Yes |
| `DC_CABLING_CONDUIT` | `MC4_CRIMPING` | MC4 Connector Pull Test & IP68 Sealing (Audible click) | Yes |
| | `UV_CONDUIT_ROUTING`| DC Solar Cable in UV Resistant Flexible Conduit | Yes |
| `INVERTER_INSTALLATION` | `WALL_CLEARANCE` | Heatsink Clearance (Min 300mm sides, 500mm top) | Yes |
| | `INGRESS_PROTECTION`| Cable Glands Tightened (IP65/IP66 verified) | Yes |
| `AC_ELECTRICAL_DISTRIBUTION`| `SPD_SURGE_PROTECTION`| Type II SPD Installed on AC-DB (Green flag) | Yes |
| | `MCB_RCCB_TRIP_TEST`| RCCB 30mA Earth Leakage Trip Test (< 40ms) | Yes |
| `EARTHING_LIGHTNING` | `EARTH_RESISTANCE` | Earth Pit Resistance to Ground (< 5.0 Ω as per IS 3043)| Yes |
| | `ESE_LA_COVERAGE` | Lightning Protection Mast Coverage Radius | Yes |
| `FINAL_PRE_COMMISSIONING` | `PHASE_SEQUENCE` | 3-Phase AC Sequence Alignment (R-Y-B Clockwise) | Yes |
| | `INSULATION_RESISTANCE`| DC String to Earth Megger Test at 1000V (> 1.0 MΩ) | Yes |

## 3. Rework Enforcement & Resolution
- If any mandatory checkpoint fails, overall inspection result is automatically stamped `REWORK_REQUIRED`.
- The system prevents the project from advancing to commissioning until `resolveRework` is invoked by a quality inspector with documented rectification notes.
