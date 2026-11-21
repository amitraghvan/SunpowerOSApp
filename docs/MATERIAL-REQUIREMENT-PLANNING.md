# Material Requirement Planning (MRP) Engine

## Overview
The MRP engine reconciles engineering design requirements against available inventory stock, allocated quantities, and lead times. It takes an approved `BillOfMaterials` from Phase 2 and calculates the net procurement demand.

## Calculation Formula
For each line item $i$ in the engineering BOM:
$$\text{Gross Demand}_i = \text{BOM Item Effective Quantity}_i$$
$$\text{Net Procurement Quantity}_i = \max\left(0, \text{Gross Demand}_i - (\text{Available Stock}_i - \text{Allocated Stock}_i)\right)$$

Where:
- $\text{Available Stock}_i$: Current physical units across warehouses in `IN_STOCK` status.
- $\text{Allocated Stock}_i$: Physical units reserved for confirmed projects awaiting dispatch.
- $\text{Net Procurement Quantity}_i$: Additional stock to purchase.

## MRP Workflow Stages
1. **Trigger**: An approved `ProjectInitiation` with status `READY_FOR_PROCUREMENT` invokes `generateMRPFromProject`.
2. **Explosion**: The system reads all `BOMItem` records linked to the project's approved BOM.
3. **Price Estimation**: If a preferred `SupplierProductMapping` exists, its standard price is fetched; otherwise, the BOM unit cost is used.
4. **Output Document**: A `MaterialRequirement` record (`MRP-YYYY-NNNNNN`) is generated with status `CALCULATED`.
5. **Conversion**: The MRP run is converted with a single click into a `PurchaseRequisition` (`PR-YYYY-NNNNNN`).
