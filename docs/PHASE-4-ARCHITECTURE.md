# Phase 4 — System Architecture
## SolarOS ERP — Modular Monolith Inventory & Warehouse Engine

**Product:** SunPowerOS  
**Architecture:** NestJS + Prisma ORM + PostgreSQL RLS + Next.js App Router  
**Domain:** Inventory, Warehouse Management, Stock Reservation & Dispatch  

---

### 1. High-Level Architectural Topology

```text
Phase 3 Inward Receipts (GRN)
            │
            ▼
┌────────────────────────────────────────────────────────┐
│   Authoritative Inventory Receipt Ledger               │
│   (inventory_receipt_movements)                        │
└────────────────────────────────────────────────────────┘
            │
            ├──────────────────────────────────────────────┐
            ▼                                              ▼
┌───────────────────────────────┐              ┌───────────────────────────────┐
│ Multi-Warehouse Storage       │              │ Project Stock Reservation     │
│ - Storage Zones, Racks, Bins  │              │ - Approved BOM item mapping   │
│ - Default Receiving / Quarantine              │ - Atomic concurrency lock     │
└───────────────────────────────┘              │ - Shortage tracking           │
            │                                  └───────────────────────────────┘
            ▼                                              │
┌───────────────────────────────┐                          ▼
│ Inter-Warehouse Transfers     │              ┌───────────────────────────────┐
│ - Request ➔ Approve ➔ Ship   │              │ Material Picking List         │
│   ➔ In-Transit ➔ Receive      │              │ - Barcode / serial scanner    │
└───────────────────────────────┘              │ - Pick verification           │
                                               └───────────────────────────────┘
                                                           │
                                                           ▼
                                               ┌───────────────────────────────┐
                                               │ Packing Workspace             │
                                               │ - 8-point solar QA checklist  │
                                               │ - Box dimensions & weight     │
                                               └───────────────────────────────┘
                                                           │
                                                           ▼
                                               ┌───────────────────────────────┐
                                               │ Dispatch Management           │
                                               │ - Post dispatch deduction     │
                                               │ - Delivery Challan (DCH-*)    │
                                               │ - Proof of Delivery (POD)     │
                                               └───────────────────────────────┘
                                                           │
                                                           ▼
                                               ┌───────────────────────────────┐
                                               │ Customer Returns (RMA)        │
                                               │ - Restock / Quarantine / Scrap│
                                               └───────────────────────────────┘
```

### 2. Core Architectural Principles
1. **Immutable Double-Entry Ledger Movements:**
   - Every physical stock event generates an authoritative movement entry (`PURCHASE_RECEIPT`, `CUSTOMER_RETURN`, `STOCK_ADJUSTMENT`, `DISPATCH_ISSUE`, `SUPPLIER_RETURN`, `INTERNAL_TRANSFER`).
   - Balances are never maintained via mutable increment/decrement columns that suffer from drift.
2. **Serial & Batch Lifecycle Continuity:**
   - Serial numbers tracked from GRN (`ProductSerial`) persist through project allocation, barcode pick scanning, package boxing, dispatch order release, and customer delivery receipt.
3. **Optimistic & Row-Level Concurrency Control:**
   - Critical path allocation queries utilize `SELECT "id" FROM "product_variants" ... FOR UPDATE` ensuring simultaneous reservation requests for identical solar inventory fail gracefully or serialize without over-commitment.
