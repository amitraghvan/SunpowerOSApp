# SolarOS Phase 2 — Solar Engineering Architecture

## 1. Executive Summary

Phase 2 establishes the core technical and engineering engine of SolarOS ERP. It bridges pre-sales site survey assessments with engineering designs, physics-based photovoltaic calculations, automated Bill of Materials (BOM) compilation, commercial pricing, legally binding EPC contracts, and sales order execution.

```mermaid
flowchart LR
    A[Survey Approved] --> B[Engineering Design Created]
    B --> C[Hardware Topology Configured]
    C --> D[Calculation Engine & Compatibility Audit]
    D --> E[Design Approval]
    E --> F[Automated BOM Generation]
    F --> G[Quotation & Pricing Engine]
    G --> H[Customer Acceptance]
    H --> I[Contract Generation & Signing]
    I --> J[Sales Order & Advance Payment]
    J --> K[Project Initiation Handoff]
```

## 2. Core Architectural Components

1. **Engineering Service (`EngineeringService`):**
   - Coordinates multi-revision design lifecycles (`DES-YYYY-000001`).
   - Maintains immutable snapshots of physical designs and engineering standards.
   - Enforces approval gates: revisions cannot be approved without passing compatibility validation.

2. **Solar Technical Calculation Engine (`apps/api/src/modules/engineering/calculations/`):**
   - Pure, deterministic calculation functions executed against manufacturer specification sheets and site conditions.
   - Modules: DC Sizing, Temperature-Adjusted String Sizing, DC/AC Ratio Analysis, Battery/Storage Sizing, Cable & Conductor Sizing, Switchgear Protection, and Energy Yield.

3. **Product Compatibility Engine (`CompatibilityService`):**
   - Rigorous 5-point verification:
     - Voltage limits ($V_{oc,\text{cold}} \le V_{\text{max,inverter}}$).
     - MPPT operating window ($V_{mp,\text{hot}} \ge V_{\text{mppt,min}}$).
     - Current rating ($I_{sc} \le I_{\text{sc,max,inverter}}$).
     - Phase configuration matching (Single Phase vs Three Phase).
     - Storage and structural compatibility.

4. **Multi-Tenant Context & Row-Level Security:**
   - Every operation is isolated via `this.prisma.forTenant(organizationId, ...)`.
   - PostgreSQL RLS enforced with `FORCE ROW LEVEL SECURITY` on all Phase 2 tables.
