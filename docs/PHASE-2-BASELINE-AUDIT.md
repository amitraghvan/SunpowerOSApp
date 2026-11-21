# SolarOS ERP — Phase 2 Baseline Audit

**Audit Timestamp:** November 21, 2026  
**Auditor:** Principal ERP & Solar PV Systems Architect (CTO Lead)  
**Target:** Solar Engineering, Technical Calculation Engine, Compatibility, BOM, Quotation, Contract & Sales Order Management

---

## 1. Executive Summary

This baseline audit evaluates the existing SolarOS codebase across runtime infrastructure, database schema, domain services, security layers, and UI components prior to implementing Phase 2.

The foundational architectures (Phase 0, Phase 0.5, and Phase 1) are verified, stable, and running against live PostgreSQL 14, Redis 7, and native MinIO S3 object storage with 17 passed automated test suites (59/59 tests passing).

No database wipes or entity destructions are required. Phase 2 extends the verified domain entities (`Customer`, `CustomerSite`, `Survey`, `Product`, `ProductVariant`, `ProductAttributeValue`, `ProductPriceHistory`, `User`, `Organization`, `OrganizationBranch`) without duplicating records or authentication systems.

---

## 2. Capability Classification Matrix

| Capability / Component | Classification | Existing Location | Audit Findings & Integration Notes |
| :--- | :---: | :--- | :--- |
| **Monorepo & Build Pipeline** | `VERIFIED_EXISTING` | Root `package.json`, Turborepo | pnpm workspace with `@solaros/api`, `@solaros/web`, `@solaros/contracts`, `@solaros/types`, `@solaros/config`, `@solaros/ui`, `@solaros/database`. |
| **PostgreSQL & Prisma Foundation** | `VERIFIED_EXISTING` | `database/prisma/schema.prisma` | PostgreSQL 14 active on `localhost:5432/solaros_dev`. Migrations applied up to `phase0_5_identity_and_access_control`. |
| **PostgreSQL Row-Level Security** | `VERIFIED_EXISTING` | `database/sql/rls-policies/` | `FORCE ROW LEVEL SECURITY` active on all 23 organization-owned tables via non-superuser `solaros_app`. |
| **Authentication & Sessions** | `VERIFIED_EXISTING` | `apps/api/src/modules/identity/` | Argon2id password hashing, 32-byte CSPRNG opaque session tokens (SHA-256 in DB), 15-minute brute-force lockout, single/all revocation. |
| **Centralized RBAC Engine** | `VERIFIED_EXISTING` | `apps/api/src/modules/access-control/` | 42 permission keys registered. `AuthenticationGuard`, `TenantContextGuard`, `PermissionsGuard` active globally. |
| **Multi-Tenant Context & Branches** | `VERIFIED_EXISTING` | `apps/api/src/modules/organizations/` | Multi-organization membership, `/organizations/:id/switch` context switching, regional branches, employee invitations. |
| **CRM & Lead Lifecycle** | `VERIFIED_EXISTING` | `apps/api/src/modules/crm/` | Leads state machine, activities, conversion to customer accounts. |
| **Customer 360 & Sites** | `VERIFIED_EXISTING` | `apps/api/src/modules/customers/` | Customer entity, contacts, addresses, and `CustomerSite` with roof area, sanctioned load, DISCOM, and transformer capacity. |
| **Site Survey & Technical Measurements** | `VERIFIED_EXISTING` | `apps/api/src/modules/surveys/` | `Survey` and `SurveyRevision` capturing usable roof area, azimuth, pitch, shadow obstacles, phase type, distance to panel, approval workflow. |
| **Solar Product Catalog & Pricing** | `VERIFIED_EXISTING` | `apps/api/src/modules/catalog/` | Product types (`PANEL`, `INVERTER`, `BATTERY`, `STRUCTURE`, `CABLE`), variants, attributes (`Voc`, `Vmp`, `Isc`, `Imp`), price history. |
| **MinIO S3 Object Storage** | `VERIFIED_EXISTING` | `apps/api/src/infrastructure/storage/` | Native MinIO on `localhost:9000` with buckets `solaros-documents`, `solaros-surveys`, `solaros-assets`. Presigned upload/download URLs. |
| **BullMQ Async Queues & Worker** | `VERIFIED_EXISTING` | `apps/api/src/infrastructure/queues/` | Redis 7 queue `solaros-background-jobs` and running worker process. |
| **Odoo 19 Enterprise Design System** | `VERIFIED_EXISTING` | `apps/web/` | Topbar with 9-dot App Launcher, organization/branch switcher, user profile, `#714B67` / `#017E84` tokens, 14px enterprise density. |
| **Document Numbering Service** | `PARTIALLY_IMPLEMENTED`| `apps/api/src/` | Basic UUID generation exists; transactional concurrency-safe human-readable sequence generator (`DES-YYYY-000001`, `BOM-YYYY-000001`, `QTN-YYYY-000001`, etc.) is required. |
| **Solar System Configuration** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Scaffolding module exists. Needs `SystemConfiguration` entity, ON_GRID / OFF_GRID / HYBRID topology definitions, and versioning. |
| **Engineering Design Workspace** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Needs state machine (`DRAFT` $\to$ `CONFIGURING` $\to$ `CALCULATING` $\to$ `UNDER_REVIEW` $\to$ `APPROVED`), UI tabs, component selection. |
| **Solar Technical Calculation Engine** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Needs deterministic calculation domain: DC sizing, string sizing, cold Voc / hot Vmp, MPPT allocation, DC/AC ratio, battery DoD, energy generation, cable/protection sizing. |
| **Engineering Standards Registry** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Needs versioned standards registry (MNRE, BIS, CEA, IEC 61215, IEC 61730, IS 16221, IS 16169, IS 16270). |
| **Product Compatibility Engine** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Needs rule engine evaluating panel/inverter/battery/structure compatibility with outcomes (`COMPATIBLE`, `INCOMPATIBLE`, `CONDITIONAL`, `INSUFFICIENT_DATA`). |
| **Automated BOM Engine** | `NOT_IMPLEMENTED` | `apps/api/src/modules/engineering/` | Needs topology-specific BOM generation from approved design, categorized line items, immutable versions, approval workflow. |
| **Commercial Pricing & Cost Estimation**| `NOT_IMPLEMENTED` | `apps/api/src/modules/quotations/` | Needs BOM-derived cost estimation, margin policies, discount limits, configurable tax rules (CGST/SGST/IGST), PostgreSQL Decimal precision. |
| **Quotation Management** | `NOT_IMPLEMENTED` | `apps/api/src/modules/quotations/` | Scaffolding module exists. Needs quotation state machine, versioning (`QTN-YYYY-000001-V1`), approval hierarchy, PDF generation, customer acceptance evidence. |
| **Contract Management** | `NOT_IMPLEMENTED` | `apps/api/src/modules/contracts/` | Scaffolding module exists. Needs contract from accepted quote, versioned templates, payment milestones schedule, acceptance/execution evidence. |
| **Sales Order Management** | `NOT_IMPLEMENTED` | `apps/api/src/modules/sales-orders/`| Scaffolding module exists. Needs sales order creation from contract, idempotent confirmation, payment prerequisite checks, project initiation handoff. |
| **Project Initiation Handoff** | `NOT_IMPLEMENTED` | `apps/api/src/modules/projects/` | Needs project initiation record and event handoff for Phase 3/4/5. |

---

## 3. Reusable Phase 1 Data Contracts

Phase 2 will directly consume:
1. `CustomerSite`: Provides `roofAreaSqFt`, `shadowFreeAreaSqFt`, `sanctionedLoadKw`, `roofType`, `discomName`, `transformerCapacityKva`, `latitude`, `longitude`.
2. `Survey` (status `APPROVED`): Provides `usableAreaSqFt`, `recommendedCapacityKw`, `roofPitchDegrees`, `roofAzimuthDegrees`, `currentVoltage`, `phaseType`, `distanceToMainPanelMeters`.
3. `Product` & `ProductVariant`: Selected PV modules, string inverters, hybrid inverters, batteries, structures, and cables.
4. `ProductAttributeValue`: Provides verified technical attributes (`Voc`, `Vmp`, `Isc`, `Imp`, temperature coefficients, MPPT voltage ranges, input current limits, battery chemistry).
5. `ProductPriceHistory`: Provides current selling and cost prices for BOM lines and quotation costing.

---

## 4. Sequential Execution Plan for Phase 2

1. **Step 1: Database Architecture & Prisma Schema Extension**
   - Add models for Engineering Designs, Configurations, Calculations, Standards, Compatibility Rules, BOMs, Pricing Estimates, Quotations, Contracts, Sales Orders, Document Sequences, and Project Initiations.
   - Run Prisma migration dev and create RLS policies for all new tables.
2. **Step 2: Concurrency-Safe Document Numbering Service**
   - Transactional sequence generator for `DES`, `BOM`, `QTN`, `CON`, and `SO` identifiers.
3. **Step 3: Solar Technical Calculation Engine & Standards Registry**
   - Pure, deterministic engineering calculation modules (DC array, string sizing, MPPT limits, cold/hot voltage, DC/AC ratio, battery sizing, cable/protection sizing, energy estimation).
   - Versioned compliance standards registry.
4. **Step 4: Product Compatibility Engine**
   - Rule evaluator linking catalog modules, inverters, batteries, and balance-of-system hardware.
5. **Step 5: Automated BOM Engine**
   - Topology-specific generation, line-item categorization, version snapshots, and immutability.
6. **Step 6: Cost Estimation & Commercial Pricing Engine**
   - Direct costs, labor, transport, margins, discount policy, and configurable CGST/SGST/IGST tax calculation.
7. **Step 7: Quotation Management**
   - Versioned quotes, internal approval workflows, PDF generation, customer acceptance evidence.
8. **Step 8: Contract Management**
   - Legal template versioning, payment milestone schedules, execution evidence recording.
9. **Step 9: Sales Order Management & Project Initiation Handoff**
   - Order confirmation, payment prerequisite verification, idempotent initiation handoff event.
10. **Step 10: Odoo 19-Inspired Frontend Implementation**
    - Engineering workspaces, calculation results, BOM preview, quotation builder, contract tracker, sales order cockpit.
11. **Step 11: Comprehensive Test Suite & Release Verification**
    - Unit, calculation, compatibility, BOM, pricing, quotation, contract, sales order, RLS, and end-to-end commercial journey tests.
