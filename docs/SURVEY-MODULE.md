# SOLAROS ERP — SITE SURVEY MODULE SPECIFICATION
## Technical Feasibility, Structural & Electrical Inspection

---

## 1. Purpose

The Site Survey Module captures real physical and electrical parameters required to engineer solar PV systems, calculate structural mounting configurations, and guarantee grid interconnection compliance.

---

## 2. Technical Parameter Specifications

### Rooftop Assessment
- `roofType`: `RCC_FLAT`, `METAL_SHEET`, `TILED`, `SHED`, `GROUND`
- `roofAgeYears`: Integer representing rooftop age (determines structural life)
- `roofPitchDegrees`: Tilt angle for sloped roofs
- `roofAzimuthDegrees`: Compass orientation (180° = True South, optimum for Northern Hemisphere)
- `roofCondition`: `EXCELLENT`, `GOOD`, `FAIR`, `POOR`
- `usableAreaSqFt`: Shadow-free area suitable for solar modules
- `shadowObstacles`: Categorized obstacles (`PARAPET_WALL`, `TREES`, `WATER_TANK`, `NEIGHBOR_BUILDING`, `NONE`, `OTHER`)
- `recommendedCapacityKw`: Capacity in kW recommended by the field technician

### Electrical Assessment
- `sanctionedLoadKw`: Maximum connected load allowed by DISCOM utility
- `currentVoltage`: Measured AC voltage at main switchboard
- `phaseType`: `SINGLE_PHASE` (230V) or `THREE_PHASE` (415V)
- `incomingCableCapacitySqMm`: Cross-sectional conductor area
- `cableLengthMeters`: Distance from proposed inverter location to main LT switchboard
- `earthingRequired`: Dedicated chemical earthing pit requirement
- `earthResistanceOhms`: Measured earth resistance (target < 2.0 Ω)
- `lightningArresterRequired`: Early Streamer Emission (ESE) or conventional Franklin rod requirement
- `inverterLocation`: Proposed inverter mounting environment (`INDOOR`, `OUTDOOR`, `ROOF_TOP`, `BASEMENT`)

### Structural & Logistics Assessment
- `canSupportStructure`: Confirmation that roof slab/truss can support ~15 kg/m² solar dead load + 150 km/h wind load
- `reinforcementRequired`: Structural strengthening requirement flag
- `accessibilityNotes`: Staircase access, hatch access, or external crane required
