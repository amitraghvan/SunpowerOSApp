# SolarOS Project Initiation & Execution Handoff Specification

## 1. Handoff Purpose

Phase 2 concludes with the creation of the `project_initiations` record when a Sales Order is confirmed. This represents the formal engineering-to-operations handoff contract.

## 2. Handover Data Payload

The project initiation record encapsulates:
1. `projectCode`: Unique tracking code (`PRJ-YYYY-XXXXXX`).
2. `salesOrderId`: Originating sales order reference.
3. `customerId` & `siteId`: Exact client entity and surveyed installation rooftop.
4. `handoverStatus`: Initialized to `READY_FOR_PROCUREMENT`.
5. `targetCapacityKw`: Verified physical plant capacity.
6. `targetCompletionDate`: Statutory SLA delivery window (typically 30–45 days from advance payment receipt).

## 3. Downstream Module Consumption

- **Phase 3 (Procurement):** Pulls approved BOM items directly from `bomId` to auto-generate Vendor Purchase Orders.
- **Phase 4 (Warehouse & Inventory):** Uses serial number traceability to track module, inverter, and battery dispatch against the confirmed sales order.
- **Phase 5 (Installation & Commissioning):** Consumes single line diagrams, cable schedules, and inspection checklists generated during engineering.
