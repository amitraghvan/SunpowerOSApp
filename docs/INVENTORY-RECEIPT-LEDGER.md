# Inbound Inventory Movement Ledger

## Overview
Every stock transaction resulting from goods receipt, serial generation, or vendor rejection creates an immutable ledger entry in `InventoryReceiptMovement` (`inventory_receipt_movements`). This establishes an unalterable financial and physical audit trail.

## Movement Types
- `GRN_RECEIPT`: Inward receipt of accepted goods against an active Purchase Order.
- `QC_ACCEPTANCE`: Formal stock transfer from Quarantine Dock into Central Storage Bin.
- `QC_REJECTION`: Quarantine transfer of rejected units into Damaged / Return Bay.
- `SUPPLIER_RETURN`: Physical outbound dispatch of returned materials accompanied by a Debit Note.

## Ledger Record Data
Each movement records:
- `movementNumber`: `MOV-YYYY-NNNNNN`.
- `productVariantId`: Referenced stock SKU.
- `quantity`: Number of units moved.
- `unitCost`: Exact inventory cost valuation basis.
- `fromLocationId` & `toLocationId`: Source and destination inventory bins (`RECEIVING_BAY`, `MAIN_WAREHOUSE`, `QUARANTINE`, `DAMAGED_BAY`).
- `serialId`: Referenced asset code if serialized.
- `createdById`: Warehouse receiving clerk or inspector responsible for the transaction.
