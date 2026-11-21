# Material Picking & Packing Workspace
## SolarOS ERP — Module Specification

### 1. Material Picking
- **Generation:** Pick tickets (`PCK-YYYY-000001`) are generated directly from approved stock reservations (`StockReservation`).
- **Barcode & Serial Scanner Input:** Pickers scan individual manufacturer serial numbers at the bin location.
- **Short-Pick Tracking:** If physical stock is insufficient, the line records `shortageQuantity` and updates line status to `SHORT_PICKED`.
- **Serial Status Transition:** Scanned serial numbers update from `ALLOCATED` to `PICKED`.

### 2. Packing Workspace
- **Package Box Assignment:** Picked items are grouped into physical packages (`packageCount`, box numbers).
- **Physical Dimensions & Weight:** Pallet dimensions ($L \times W \times H$) and gross weight ($kg$) recorded for freight rating.

### 3. Mandatory 8-Point Solar Verification Checklist
Before a packing order can be transitioned to `VERIFIED`, all 8 solar-specific checks must be certified:
1. Solar modules verified and inspected for micro-cracks.
2. Inverter model, wattage, and accessories checked.
3. Battery units and BMS verified (if applicable).
4. BOS mounting rails, clamps, and fasteners counted.
5. DC/AC surge protection devices and cables verified.
6. Serial numbers scanned and verified against pick list.
7. Delivery challan and safety manuals enclosed.
8. Final box strapping and weather-proof packaging complete.

Attempting to confirm packing with unverified items is rejected with `BadRequestException`.
