# Product Serial Number & Batch Traceability

## Overview
SolarOS enforces individual asset tracking for major capital equipment (modules, inverters, storage batteries). Every individual unit is serialized upon passing quality inspection, establishing lifecycle provenance from goods receipt to post-commissioning warranty service.

## Schema Architecture: `ProductSerial` (`product_serials`)
- `internalAssetCode`: Auto-generated document sequence `AST-YYYY-NNNNNN`.
- `manufacturerSerialNumber`: OEM-printed serial number from barcode/QR code (e.g. `VSMD550-2026-000101`).
- `batchNumber`: Manufacturing production batch code (e.g. `BATCH-2026-Q4-01`).
- `barcode` & `qrCode`: Optional scanned optical barcodes.
- `electricalSpecs`: JSON payload recording benchmark performance metrics:
  ```json
  {
    "voc": 49.82,
    "isc": 13.91,
    "pmax": 552.8,
    "efficiency": 21.4
  }
  ```
- `warrantyPeriodMonths`: Manufacturer product warranty period (e.g. 144 months for modules, 60-120 months for inverters/batteries).
- `warrantyExpiresAt`: Calculated expiration date: $\text{Received Date} + \text{Warranty Months}$.
- `status`:
  - `IN_STOCK`: Available in warehouse inventory.
  - `ALLOCATED`: Reserved for a specific installation project.
  - `DISPATCHED`: En route to the customer installation site.
  - `INSTALLED`: Fixed on rooftop and wired into string.
  - `RETURNED_TO_VENDOR`: Defective unit rejected during QA and returned.

## Duplicate Prevention
The combination of tenant organization and OEM serial number is enforced with a database-level unique constraint:
`@@unique([organizationId, manufacturerSerialNumber])`.
Any attempt to register an already-recorded serial number throws a `400 Conflict / Bad Request` error.
