# Inward Logistics & Goods Receipt Note (GRN) Management

## Overview
The Goods Receipt Note (GRN) document confirms physical arrival and delivery of solar materials at a central warehouse, staging hub, or direct project site.

## Gate Entry & Vehicle Verification
During receipt creation (`createGoodsReceiptNote`), logistics security data is captured:
- `supplierInvoiceNumber` & `supplierInvoiceDate`: Vendor tax invoice reference.
- `supplierChallanNumber` & `supplierChallanDate`: Delivery challan document reference.
- `gatePassNumber`: Security gate pass audit reference.
- `vehicleNumber`: Truck or transport container registration (e.g. `MH-12-RN-9921`).
- `transporterName` & `lrNumber`: Freight company name and Lorry Receipt / Bilty number.

## Shortage and Excess Reconciliation
For each receipt line item:
$$\text{Shortage Quantity} = \max(0, \text{Challan Quantity} - \text{Received Quantity})$$
$$\text{Excess Quantity} = \max(0, \text{Received Quantity} - \text{Challan Quantity})$$

When items are received:
1. `purchase_order_lines.receivedQuantity` is incrementally updated.
2. If total received quantity across all lines meets or exceeds ordered quantities, the parent Purchase Order automatically transitions to `FULLY_DELIVERED`; otherwise `PARTIALLY_DELIVERED`.
3. The GRN status is set to `INSPECTION_PENDING` until technical quality inspection is executed.
