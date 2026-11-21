# Supplier and Vendor Lifecycle Management

## Overview
The Supplier Management subsystem manages the onboarding, qualification, evaluation, compliance, and financial profiling of solar equipment manufacturers (OEMs), authorized distributors, stockists, and subcontractors.

## Database Entities
- **Supplier (`suppliers`)**:
  - `supplierCode`: Document sequence number formatted as `SUP-YYYY-NNNNNN`.
  - `legalName` & `tradeName`: Company legal entity name and d/b/a brand name.
  - `category`: `MANUFACTURER`, `DISTRIBUTOR`, `WHOLESALER`, `SERVICE_PROVIDER`.
  - `supplierType`: Equipment specialization: `SOLAR_PANELS`, `INVERTERS`, `BATTERIES`, `MOUNTING_STRUCTURES`, `BOS_ELECTRICAL`, `MULTI_CATEGORY`.
  - `gstin`: Validated via India GSTIN Regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
  - `pan`: Validated via PAN Regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`.
  - `msmeRegistrationNumber`: UDYAM compliance registration.
  - `rating`: Continuous rating scalar from 0.00 to 5.00.
  - `paymentTerms`: Default terms (`NET_15`, `NET_30`, `ADVANCE_100`, `LC`).
- **SupplierContact (`supplier_contacts`)**: Multi-contact directory with designations, phone numbers, and primary contact flags.
- **SupplierAddress (`supplier_addresses`)**: Registered office, plant, and warehouse dispatch locations.
- **SupplierBankAccount (`supplier_bank_accounts`)**: Beneficiary accounts with validated IFSC codes for RTGS/NEFT settlement.
- **SupplierDocument (`supplier_documents`)**: Compliance artifacts (GST certificates, cancelled cheques, OEM authorization letters).

## Validation Engine
The backend enforces regex verification during creation and updates:
```typescript
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
```
Attempts to onboard duplicate supplier codes or invalid GSTINs within the same organization are rejected with `400 Bad Request`.
