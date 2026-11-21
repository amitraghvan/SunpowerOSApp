# SOLAROS ERP — DOMAIN MODULES CATALOG

**Total Registered Modules:** 49  
**Status in Phase 0:** Scaffolded, registered in `AppModule`, isolated with clear public API boundaries.

---

## 1. Domain Group Breakdown

### Group 1: Foundation (6 Modules)
- `identity`: User auth, credentials, session tokens, password hashing.
- `organizations`: Multi-tenant organization profiles, branch offices, tax registration.
- `access-control`: RBAC engine, system roles, granular permissions, authorization guards.
- `employees`: Staff records, employee directory, technician rosters.
- `audit`: Immutable event logging of sensitive operational and financial actions.
- `configuration`: Tenant settings, system preferences, regional parameters.

### Group 2: Commercial (8 Modules)
- `crm`: Solar sales leads, inquiry intake, qualification pipeline, customer interactions.
- `customers`: Customer directory, residential and commercial accounts, site addresses.
- `surveys`: Site survey scheduling, roof measurements, shading analysis, photo uploads.
- `catalog`: PV panels, inverters, batteries, structures, and balance of systems catalog.
- `engineering`: PV array design, single-line diagrams (SLD), string calculations, BOM generation.
- `quotations`: Commercial proposals, price schedules, subsidies, gross margin modeling.
- `contracts`: Digital solar contracts, warranties, terms, e-signatures.
- `sales-orders`: Confirmed solar orders, payment milestone schedules, project authorization.

### Group 3: Project Management (4 Modules)
- `projects`: End-to-end solar EPC project execution tracking (~40 projects/month).
- `tasks`: Work packages, technical milestones, quality checklists.
- `planning`: Gantt timelines, resource allocation, weather delay planning.
- `scheduling`: Technician field appointments, survey bookings, installation slots.

### Group 4: Supply Chain (7 Modules)
- `suppliers`: Solar manufacturers, equipment distributors, OEM vendor directory.
- `procurement`: Purchase orders, vendor approvals, goods receipt.
- `inventory`: Stock levels across central warehouse and mobile technician kits.
- `warehouses`: Warehouse locations, bin tracking, intra-warehouse stock transfers.
- `serial-registry`: QR/barcode serial tracking for panels, inverters, and batteries.
- `dispatch`: Material staging, technician kit issuance, delivery slips.
- `logistics`: Transportation, logistics notes, on-site material delivery confirmations.

### Group 5: Field Operations (5 Modules)
- `workforce`: 15 field technician crews, skill certifications, team assignments.
- `attendance`: Geofenced mobile check-ins and check-outs at installation sites.
- `timesheets`: Job hours, overtime tracking, labor cost allocations.
- `installation`: Roof mounting, wiring, inverter placement, battery installation.
- `commissioning`: Pre-commissioning testing, DISCOM net-metering synchronization, sign-off.

### Group 6: After-Sales (5 Modules)
- `warranty`: Component warranty records (25-yr panels, 5/10-yr inverters, batteries).
- `maintenance`: Preventive maintenance cycles, solar panel cleaning schedules.
- `service`: Field service visits, corrective maintenance, breakdown tickets.
- `helpdesk`: Customer support ticketing, SLA tracking, portal communications.
- `replacement`: RMA workflows, defective equipment vendor replacement claims.

### Group 7: Finance (6 Modules)
- `finance`: General ledger entries, chart of accounts, financial periods.
- `invoicing`: Milestone billing, customer tax invoices (GST), credit notes.
- `payments`: Customer payments, receipts, payment gateways, bank reconciliation.
- `expenses`: Direct project expenses, technician travel and lodging, site costs.
- `accounting`: Double-entry journal entries, trial balance, tax reports.
- `project-costing`: Real-time project gross margin analysis (Estimated vs. Actual BOM).

### Group 8: Supporting Services (8 Modules)
- `subsidy`: Government solar subsidy documentation, state portal submissions, status sync.
- `documents`: Secure document generation, customer KYC, engineering drawings, S3 storage.
- `notifications`: Push notifications, SMS alerts, email notifications.
- `communications`: Automated WhatsApp project updates, client messaging history.
- `analytics`: Business intelligence, solar conversion metrics, project duration KPIs.
- `workflow`: State machines, event-driven approval chains.
- `integrations`: Inverter monitoring cloud APIs, DISCOM utility portal sync.
- `ai-copilot`: Solar engineering design assistant and read-only enterprise query copilot.
