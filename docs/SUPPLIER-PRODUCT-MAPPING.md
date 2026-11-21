# Supplier Product Mapping & Live Rate History

## Overview
Supplier Product Mapping maintains the technical and commercial bridge between SolarOS internal Product Variants and external vendor catalogues. It enables dynamic price benchmarking, lead-time tracking, and automated quotation evaluation.

## Schema Architecture
- **SupplierProductMapping (`supplier_product_mappings`)**:
  - `supplierId`: Foreign key to `Supplier`.
  - `productVariantId`: Foreign key to internal `ProductVariant`.
  - `supplierPartCode`: External OEM or distributor catalogue part number (e.g. `VSMD-550-OEM`, `SG50CX-V2`).
  - `unitPrice`: Base unit price excluding taxes.
  - `currency`: Default `INR`.
  - `taxRatePercent`: Applicable GST slab (e.g., 12% for PV modules, 18% for inverters/BOS).
  - `leadTimeDays`: Factory-to-warehouse delivery SLA in days.
  - `minimumOrderQuantity`: Minimum order threshold (MOQ).
  - `isPreferred`: Flag identifying primary OEM vendor for automated PO generation.
  - `effectiveFrom` & `effectiveTo`: Validity date window.

- **SupplierPriceHistory (`supplier_price_history`)**:
  - Tracks historical price movements whenever negotiated rates change.
  - Captures `oldPrice`, `newPrice`, `changedById`, `reason`, and timestamp `createdAt`.

## Automated Price Auditing
When an existing mapping is updated with a new unit price:
1. The previous rate is preserved in `supplier_price_history`.
2. The delta percentage is computed.
3. The new price becomes active immediately for future MRP calculations and Purchase Requisitions.
