# Warehouse Management & Storage Locations
## SolarOS ERP — Module Specification

### 1. Overview
Solar equipment requires specialized warehousing due to high physical footprint (pallets of 540W+ bifacial modules), sensitivity (inverters, MPPT chargers, smart meters), and hazardous classifications (lithium-ion batteries). The Warehouse Management module provides multi-facility support with sub-location granularity.

### 2. Multi-Warehouse Hierarchy
```text
Organization (Tenant)
  └── Organization Branch (e.g. Gujarat Regional Branch)
        └── Warehouse (e.g. WH-GUJ-01: Central Solar Hub)
              ├── Receiving Bay (Default Inward Gate)
              ├── Storage Zone (e.g. Zone A - Inverter Bay)
              │     └── Rack (e.g. Rack 01)
              │           └── Bin (e.g. Bin 04)
              └── Quarantine Zone (Defective / Damaged Inward Goods)
```

### 3. Automatic Location Provisioning
When a new warehouse is provisioned via `WarehouseService.createWarehouse()`, the system automatically provisions:
1. `${warehouse.code}-RCV`: Default Inward Receiving Bay (`WarehouseLocationType.RECEIVING`, `isDefaultReceiving: true`).
2. `${warehouse.code}-GEN`: General Storage Area (`WarehouseLocationType.STORAGE`).

### 4. Database Schema
- **Model:** `Warehouse` (`warehouses`)
  - Primary Key: `id` (UUID)
  - Scoping: `organizationId`, `branchId`
  - Uniqueness: `@@unique([organizationId, code])`
  - Metadata: `name`, `address`, `contactPhone`, `contactEmail`, `managerId`, `isActive`.
- **Model:** `InventoryLocation` (`inventory_locations`)
  - Hierarchy: `warehouseId`, `parentId`, `zone`, `rack`, `bin`
  - Types: `RECEIVING`, `STORAGE`, `QUARANTINE`, `DISPATCH_STAGING`.
