# SunPowerOS — Site Readiness Assessment
## 12-Point Pre-Installation Quality & Safety Audit

---

## 1. Overview

Before mobilization, the installation team conducts a rigorous 12-point site readiness assessment (`SRR-YYYY-000001`) to ensure rooftop safety and structural soundness.

## 2. The 12-Point Checklist

1. `ROOF_STRUCTURAL_INTEGRITY`: Purlins, rafters, and RCC slab capable of supporting design load (Mandatory).
2. `WATERPROOFING_VERIFIED`: Existing roof membrane undamaged and leak-free (Mandatory).
3. `SAFE_ROOFTOP_ACCESS`: Permanent staircase or secured ladder landing with perimeter parapet (Mandatory).
4. `ELECTRICAL_ROOM_CLEARANCE`: Adequate wall space and ventilation for inverter and AC-DB panels (Mandatory).
5. `LT_PANEL_SPARE_BREAKER`: Spare feeder breaker available with adequate fault interrupting rating (Mandatory).
6. `EARTH_PIT_LOCATION_CLEAR`: Soil space available for dedicated solar chemical earth pits (Mandatory).
7. `AC_CABLE_ROUTE_CLEAR`: Clear vertical shaft / conduit run from roof to ground electrical room (Mandatory).
8. `SHADING_OBSTACLES_CHECK`: No new trees, antennas, or constructions casting unanticipated shadows (Mandatory).
9. `GRID_SUPPLY_STABILITY`: Stable 3-phase LT voltage within operating tolerances (Mandatory).
10. `SITE_STORAGE_SECURED`: Locked dry staging area for solar modules and inverters (Optional).
11. `CRANE_HOIST_ACCESS`: Unobstructed access for boom crane / scissor lift material hoisting (Optional).
12. `DISCOM_FEASIBILITY_SANCTION`: Sanction letter approved by local DISCOM office (Mandatory).

## 3. Mandatory Gate & Supervisor Exception
- If any mandatory check evaluates to `FAIL`, site readiness status is set to `REJECTED`, blocking work order execution.
- If field conditions permit mitigating actions, an authorized project manager can invoke `authorizeSupervisorException` (`APPROVED_WITH_EXCEPTION`) with documented justification and safety controls.
