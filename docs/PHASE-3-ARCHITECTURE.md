# Phase 3 Architecture: Enterprise Procurement, Supplier Operations, Goods Receipt & Traceability

## Executive Summary
SolarOS Phase 3 implements an end-to-end, multi-tenant enterprise procurement engine for commercial and residential Solar EPC organizations. Designed to handle vendor lifecycles, Bill of Materials (BOM) explosion, competitive supplier bidding, multi-version purchase order execution, inward logistics, gate pass verification, technical Quality Inspection (QIR), and serialized equipment traceability down to cell-level flash-test benchmarks.

```
+--------------------------------------------------------------------------------------------------+
|                                    SOLAROS PHASE 3 LIFECYCLE                                    |
+--------------------------------------------------------------------------------------------------+
|  +--------------------------------+       +---------------------------------------------------+  |
|  | Phase 2 Handover:              | ----> | 1. Material Requirement Planning (MRP)            |  |
|  | READY_FOR_PROCUREMENT Project  |       |    - Explodes Approved BOM Line Items             |  |
|  | Initiation with Approved BOM   |       |    - Reconciles In-Stock vs Net Demand            |  |
|  +--------------------------------+       +---------------------------------------------------+  |
|                                                                    |                             |
|                                                                    v                             |
|  +--------------------------------+       +---------------------------------------------------+  |
|  | 3. Request For Quotations (RFQ)| <---- | 2. Purchase Requisitions (PR)                     |  |
|  |    - Multi-Supplier Broadcast  |       |    - Departmental Justification & Authorization   |  |
|  |    - Competitive Rate Sheets   |       |    - Approval Threshold Matrix                    |  |
|  +--------------------------------+       +---------------------------------------------------+  |
|                 |                                                                                |
|                 v                                                                                |
|  +--------------------------------+       +---------------------------------------------------+  |
|  | 4. Bid Comparison & Award      | ----> | 5. Purchase Order (PO) Execution                  |  |
|  |    - Rank Evaluation (L1..Ln)  |       |    - Director Approval Workflow                   |  |
|  |    - Justified Commercial Award|       |    - Version Revision Control (v1, v2...)         |  |
|  +--------------------------------+       +---------------------------------------------------+  |
|                                                                    |                             |
|                                                                    v                             |
|  +--------------------------------+       +---------------------------------------------------+  |
|  | 7. Quality Inspection (QIR)    | <---- | 6. Inward Goods Receipt Note (GRN)                |  |
|  |    - STC Flash Test Benchmarks |       |    - Gate Entry & Vehicle / Transporter Details   |  |
|  |    - Visual & IP68 Checklist   |       |    - Challan vs Physical Received Reconciliation  |  |
|  +--------------------------------+       +---------------------------------------------------+  |
|                 |                                                                                |
|                 v                                                                                |
|  +--------------------------------+       +---------------------------------------------------+  |
|  | 8. Serial & Asset Registration | ----> | 9. Inbound Inventory Ledger & Supplier Returns    |  |
|  |    - OEM Serial & Asset Codes  |       |    - MOV Ledger Audit Record (Inward Receipt)     |  |
|  |    - Voc, Isc, Pmax Benchmarks |       |    - Debit Note Generation for Rejected Units     |  |
|  +--------------------------------+       +---------------------------------------------------+  |
+--------------------------------------------------------------------------------------------------+
```

## Architectural Highlights
1. **Strict Multi-Tenant Isolation**: Every database interaction is scoped by `organizationId`, enforced via PostgreSQL Row-Level Security (`005_phase3_tenant_isolation.sql`) and `this.prisma.forTenant(orgId, ...)`.
2. **Deterministic Sequence Numbering**: Atomic concurrency-safe sequence generation across all Phase 3 entities: `SUP-YYYY-NNNNNN`, `MRP-YYYY-NNNNNN`, `PR-YYYY-NNNNNN`, `RFQ-YYYY-NNNNNN`, `SQ-YYYY-NNNNNN`, `PO-YYYY-NNNNNN`, `GRN-YYYY-NNNNNN`, `QIR-YYYY-NNNNNN`, `AST-YYYY-NNNNNN`, `MOV-YYYY-NNNNNN`, `RET-YYYY-NNNNNN`.
3. **Stateless Financial Calculation Engine**: High-precision decimal arithmetic avoiding floating-point drift across subtotal, GST rate brackets (5%, 12%, 18%, 28%), freight, and rupee rounding.
4. **Three-Way Matching Foundation**: Cryptographic document linkage between Purchase Order $\leftrightarrow$ Goods Receipt Note $\leftrightarrow$ Vendor Invoice $\leftrightarrow$ Inspection Sign-off.
