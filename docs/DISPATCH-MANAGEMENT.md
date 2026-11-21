# Outbound Dispatch Management
## SolarOS ERP — Module Specification

### 1. Overview
The Dispatch Management module controls physical material gate-out from the warehouse to the customer's solar installation site. It bridges warehouse fulfillment with project execution.

### 2. Dispatch Order Lifecycle
```text
DRAFT ➔ READY_FOR_DISPATCH ➔ APPROVED ➔ DISPATCHED ➔ IN_TRANSIT ➔ DELIVERED
```
1. **Creation (`READY_FOR_DISPATCH`):**
   - Linked to verified `packingOrderId` or explicit product lines with serial/batch numbers.
   - Associated with `salesOrderId` and destination customer `deliveryAddress`.
   - Transporter name, vehicle number, driver name, and driver phone captured.
2. **Approval (`APPROVED`):**
   - Commercial / dispatch controller signs off on shipping authorization.
3. **Posting (`DISPATCHED`):**
   - **Row-Level Concurrency Lock:** `SELECT ... FOR UPDATE` on `dispatch_orders` prevents double-dispatch.
   - **Idempotency Check:** Rejects posting if status is already `DISPATCHED`, `IN_TRANSIT`, or `DELIVERED`.
   - **Authoritative Stock Deduction:** Posts `MovementType.DISPATCH_ISSUE` movements to the ledger for each line item.
   - **Serial Update:** Marks all serial numbers as `status = 'DISPATCHED'` and links `activeDispatchOrderId`.
   - **Reservation Consumption:** Marks corresponding project reservation as `CONSUMED`.
