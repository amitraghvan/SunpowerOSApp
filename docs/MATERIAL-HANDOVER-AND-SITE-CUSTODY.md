# SunPowerOS — Material Handover & Site Custody
## Zero Double Stock Deduction Invariant & Physical Serial Tracking

---

## 1. Overview

Material Handover (`MHO-YYYY-000001`) transfers physical custody of dispatched solar equipment from the logistics transporter to the rooftop site supervisor.

## 2. Critical Inventory Invariant: Zero Double Stock Deduction

```
+-------------------------------------------------------------------------------------------------------+
|  PHASE 4: WAREHOUSE & DISPATCH                                                                        |
|  - Dispatch order approved & shipped                                                                  |
|  - Inventory receipt ledger records: movementType = DISPATCH_ISSUE                                    |
|  - Physical warehouse stock is DEDUCTED at this step!                                                 |
+-------------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+-------------------------------------------------------------------------------------------------------+
|  PHASE 5: SITE MATERIAL HANDOVER (MHO)                                                                |
|  - Transporter delivers equipment to project rooftop                                                  |
|  - Site supervisor inspects equipment & scans serial barcodes                                         |
|  - Line items marked MATCHED                                                                          |
|  - Site supervisor signs custody acceptance (MHO status = ACCEPTED)                                   |
|                                                                                                       |
|  CRITICAL INVENTORY RULE:                                                                             |
|  - ZERO records created in inventory_receipt_movements!                                               |
|  - Warehouse inventory was already deducted in Phase 4!                                               |
|  - ProductSerial records move: status = ALLOCATED, projectInitiationId = <projectId>                  |
+-------------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+-------------------------------------------------------------------------------------------------------+
|  PHASE 5: MATERIAL CONSUMPTION LOGGING (CON)                                                          |
|  - Technicians mount panels and inverter onto roof structure                                          |
|  - Material consumption record created (CON-YYYY-000001)                                              |
|  - ProductSerial records move: status = INSTALLED                                                     |
|  - ZERO deduction from warehouse ledger (Stock already consumed)                                      |
+-------------------------------------------------------------------------------------------------------+
```

## 3. Discrepancy & Damage Handling
- If materials arrive with transit damage (e.g., shattered module glass) or missing quantities:
  - Line status is marked `DAMAGED` or `DISCREPANCY`.
  - Parent MHO transitions to `DISCREPANCY`.
  - Discrepancy notes trigger an immediate claim against the transporter and notification to procurement.
