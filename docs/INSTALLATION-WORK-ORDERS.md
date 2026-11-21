# SunPowerOS — Installation Work Orders & Tasks
## Execution Task Orchestration & Milestone Progress

---

## 1. Overview

Installation Work Orders (`IWO-YYYY-000001`) break project execution into 9 standardized solar EPC tasks mapped to 7 sequential project milestones.

## 2. Standard 9 Tasks

1. `STRUCTURE_ERECTION`: Anchor bolts, mounting rails, legs, and torque verification.
2. `MODULE_MOUNTING`: Panel placement, mid-clamps, end-clamps, coplanar array alignment.
3. `DC_CABLING_CONDUIT`: MC4 crimping, DC UV-resistant flexible conduit, combiner box wiring.
4. `INVERTER_INSTALLATION`: Wall-mounting inverter, heatsink clearance, AC/DC cable glands.
5. `AC_ELECTRICAL_WIRING`: AC-DB panel mounting, SPD surge protection, isolator switch wiring.
6. `EARTHING_LIGHTNING`: Chemical earth pit drilling, copper tape bonding, lightning arrester mast.
7. `TESTING_PRE_COMMISSION`: Megger insulation resistance, string continuity, polarity, Voc, Isc.
8. `GRID_SYNCHRONIZATION`: DISCOM net meter energization, anti-islanding trip test, power on.
9. `CLEANUP_DEMOBILIZATION`: Rooftop cleanup, waste disposal, customer training, and site handover.

## 3. Automated 7 Milestone Transitions
When individual tasks reach `COMPLETED`, the system recalculates overall progress percentage and advances corresponding milestone gates:
1. `STRUCTURE_COMPLETED`
2. `PANELS_MOUNTED`
3. `ELECTRICAL_COMPLETED`
4. `EARTHING_VERIFIED`
5. `PRE_COMMISSIONED`
6. `GRID_CONNECTED`
7. `HANDED_OVER`
