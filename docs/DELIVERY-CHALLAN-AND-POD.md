# Delivery Challan & Proof of Delivery (POD)
## SolarOS ERP — Module Specification

### 1. Delivery Challan Generation
- **Sequential Document Numbering:** Generated automatically using `DCH-YYYY-000001` format via `NumberingService`.
- **Compliance & Legal Structure:**
  - Complete consignor & consignee identification.
  - Linked `dispatchOrder`, `salesOrder`, and `projectInitiation` references.
  - Transporter name, truck registration vehicle number, and e-way bill references.
  - Standard solar industry terms and conditions:
    1. Goods once sold/dispatched will not be taken back without authorized inspection.
    2. Warranty is subject to manufacturer terms and serial verification.
    3. SunPower Solutions is not liable for transit damages after formal handoff unless insured transit is opted.
- **Printable ERP Layout:** Clean HTML/CSS printable delivery challan dialog with one-click print capability.

### 2. Proof of Delivery (POD) Confirmation
- **Sign-Off at Installation Site:**
  - Receiver name and verified mobile contact.
  - Digital receiver signature URL.
  - Photographic proof document attachments (gate receipt, unloaded pallet condition).
- **Shortage & Transit Damage Handling:**
  - If damages or shortages are reported (`isDamaged: true`), status is set to `PARTIAL_DELIVERY` with damage descriptions.
  - If sound receipt is confirmed, status is set to `DELIVERY_CONFIRMED`.
  - Automatically transitions the dispatch order status to `DELIVERED`.
