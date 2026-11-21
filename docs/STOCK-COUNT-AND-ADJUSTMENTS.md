# Stock Counting & Inventory Adjustments
## SolarOS ERP — Module Specification

### 1. Business Problem
Physical variance occurs due to breakage during transit, warehouse micro-cracks, cable cut waste, and cycle audit discrepancies. Without strict segregation of duties, unauthorized manual stock corrections lead to pilferage and inventory distortion.

### 2. Stock Counting (Physical & Cycle Audits)
- **Count Generation:** Counts are scheduled by warehouse or specific storage bins (`PHYSICAL`, `CYCLE`, `SPOT`).
- **Variance Calculation:** Upon count submission:
  $$\text{Variance} = \text{Counted Quantity} - \text{System On-Hand Quantity}$$
- Discrepant items are highlighted with variance values and audit notes.

### 3. Segregation of Duties Enforcement
To meet statutory audit and enterprise internal control standards, SolarOS enforces strict segregation of duties in `AdjustmentService.approveStockAdjustment()`:
```typescript
if (userId && adjustment.createdById && adjustment.createdById === userId) {
  throw new BadRequestException(
    'Segregation of duties policy violation: The user who created the stock adjustment cannot approve it.'
  );
}
```
- A warehouse clerk who records counts or proposes an adjustment **CANNOT** self-approve it.
- Approval requires an independent supervisor (`inventory:adjustments:approve`).

### 4. Authoritative Ledger Posting
Upon supervisor approval, an immutable `MovementType.STOCK_ADJUSTMENT` movement is posted to the authoritative ledger, immediately reconciling system on-hand balances with physical truth.
