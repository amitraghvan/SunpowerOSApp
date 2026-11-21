# Supplier Returns & Commercial Debit Notes

## Overview
When goods are damaged in transit, fail electrical specifications during QIR testing, or do not match purchase order specifications, the Supplier Return workflow handles reverse logistics and generates debit note references for financial accounts.

## Workflow Mechanics
1. **Creation**: Triggered via `createSupplierReturn`:
   - Document number: `RET-YYYY-NNNNNN`.
   - `supplierId`: The vendor being charged.
   - `goodsReceiptNoteId`: Inward receipt document where defects were found.
   - `returnType`: `DAMAGED_IN_TRANSIT`, `DEFECTIVE_REJECTION`, `EXCESS_SUPPLY`, `SPECIFICATION_MISMATCH`.
   - `debitNoteNumber`: Audit reference (e.g. `DN-2026-9001`) transmitted to finance.
   - `totalReturnAmount`: Valuation of returned units: $\sum (\text{Returned Qty} \times \text{Unit Price})$.
2. **Serial Status Transition**:
   - Any serialized assets included in the return lines transition immediately to `RETURNED_TO_VENDOR`.
3. **Ledger Impact**:
   - Creates a corresponding `InventoryReceiptMovement` with type `SUPPLIER_RETURN` and negative stock valuation impact.
4. **Lifecycle States**:
   - `DRAFT` $\to$ `SUBMITTED` $\to$ `ACKNOWLEDGED_BY_VENDOR` $\to$ `CREDIT_NOTE_RECEIVED` $\to$ `REPLACED`.
