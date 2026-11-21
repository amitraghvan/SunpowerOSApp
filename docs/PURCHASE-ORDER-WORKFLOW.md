# Purchase Order (PO) Lifecycle & Approval Engine

## PO Lifecycle Stages
A Purchase Order represents a legally binding commercial agreement between the EPC organization and the supplier.

```
+------------+       Submit        +--------------------+      Director       +--------------+
|   DRAFT    | ------------------> |  PENDING_APPROVAL  | ------------------> |   APPROVED   |
+------------+                     +--------------------+      Sign-Off       +--------------+
                                             |                                       |
                                             | Reject                                | Issue
                                             v                                       v
                                     +--------------------+                   +--------------+
                                     |      REJECTED      |                   |    ISSUED    |
                                     +--------------------+                   +--------------+
                                                                                     |
                                                                                     | Partial/Full Delivery
                                                                                     v
                                                                      +-----------------------------+
                                                                      | PARTIALLY / FULLY DELIVERED |
                                                                      +-----------------------------+
```

## Financial Calculation Precision
The backend performs strict multi-line financial computations:
$$\text{Line Subtotal}_j = \text{Ordered Quantity}_j \times \text{Unit Price}_j \times \left(1 - \frac{\text{Discount}_j}{100}\right)$$
$$\text{Line Tax}_j = \text{Line Subtotal}_j \times \frac{\text{Tax Rate Percent}_j}{100}$$
$$\text{Subtotal} = \sum_{j} \text{Line Subtotal}_j, \quad \text{Tax Amount} = \sum_{j} \text{Line Tax}_j$$
$$\text{Total Amount} = \text{round}(\text{Subtotal} + \text{Tax Amount} + \text{Freight Amount})$$

## Delivery Schedules
To support phased dispatch for large 50kW-100kW projects, each PO line can have multiple staggered delivery schedules with specified dates, quantities, and transporter details.
