# Purchase Requisition (PR) Workflow

## Lifecycle Stages
The Purchase Requisition represents internal demand authorization before external commitments are made to vendors.

```
+------------+       Submit        +---------------+      Approve       +--------------+      Convert      +------------------+
|   DRAFT    | ------------------> |   SUBMITTED   | -----------------> |   APPROVED   | ----------------> | CONVERTED_TO_PO  |
+------------+                     +---------------+                    +--------------+                   +------------------+
                                           |                                   |
                                           | Reject                            | RFQ Broadcast
                                           v                                   v
                                   +---------------+                    +--------------+
                                   |   REJECTED    |                    | RFQ Published|
                                   +---------------+                    +--------------+
```

## Approval Matrix & Rules
- **DRAFT**: Created directly or generated automatically from an MRP run. Can be edited and lines modified.
- **SUBMITTED**: Locked for edits. Submitted to the designated department head or procurement manager for budget review.
- **APPROVED**: Formally signed off with timestamp and approver user reference. Unlocks RFQ broadcasting and Purchase Order creation.
- **REJECTED**: Rejection reason recorded, and status set to `REJECTED`. Can be revised or archived.
- **CONVERTED_TO_PO**: Marks that one or more lines have been converted into active Purchase Orders.
