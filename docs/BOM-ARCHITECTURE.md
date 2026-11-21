# SolarOS Automated Bill of Materials (BOM) Architecture

## 1. Architectural Principles

The SolarOS BOM Engine (`apps/api/src/modules/engineering/bom/bom.service.ts`) compiles an itemized, categorized engineering bill of materials directly from approved design revisions.

### Immutable Snapshots
Once a BOM is generated and approved:
- Unit costs are frozen to protect margins from catalog price volatility.
- Quantity multipliers include realistic installation wastage allowances.
- The BOM is linked by foreign key (`bomId`) to commercial quotations.

## 2. Six Topology Categories

Every generated BOM is classified into six standard EPC categories:

```
├── 1. SOLAR_GENERATION    (PV Modules, bifacial clips)
├── 2. POWER_CONVERSION    (Inverter, smart dongles, CTs)
├── 3. STORAGE             (Battery bank, BMS, battery cables)
├── 4. MOUNTING            (Aluminum rails, clamps, ballasts, anchor fasteners)
├── 5. ELECTRICAL_BOS      (DC/AC cables, DCDB, ACDB, SPDs, MCBs, earthing pits)
└── 6. SERVICES            (Engineering design, installation labor, net-metering liaisoning)
```

## 3. Wastage Allowance Rules

To ensure realistic inventory dispatch:
- **Copper/Solar Cables:** +5.0% to +10.0% wastage allowance.
- **Mounting Fasteners & Clamps:** +5.0% spares allowance.
- **Major Equipment (Panels/Inverters):** 0.0% wastage allowance.
