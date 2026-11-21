# SOLAROS ERP — CRM DOMAIN DESIGN
## Lead Capture, Qualification, Pipeline Stages & Conversion

---

## 1. Domain Purpose

The CRM domain manages solar sales inquiries from first customer contact through qualification, site assessment readiness, and contract signing. It is tailored specifically for residential (1 kW - 10 kW) and commercial solar installations (10 kW - 100 kW+).

---

## 2. Core Entities

### `Lead`
- **Identifier:** `id` (UUID), `leadNumber` (`LEAD-YYYYMMDD-XXXX`).
- **Contact:** `firstName`, `lastName`, `phone`, `email`, `alternatePhone`, `address`, `city`, `state`, `postalCode`.
- **Solar Context:** `source` (WEBSITE, REFERRAL, CAMPAIGN, etc.), `systemType` (ON_GRID, OFF_GRID, HYBRID), `estimatedMonthlyBill` (INR), `estimatedRoofAreaSqFt`, `estimatedCapacityKw`, `budget`.
- **Governance:** `status` (state machine), `score` (0-100), `lostReason`, `assignedToId`, `convertedCustomerId`.

### `LeadActivity`
- Chronological logs for `CALL`, `EMAIL`, `MEETING`, `NOTE`, and `STATUS_CHANGE`.
- Tracks scheduling and completion timestamps.

### `LeadStatusHistory`
- Immutable audit trail recording `fromStatus`, `toStatus`, `changedById`, and transition reason.

---

## 3. Duplicate Detection

Solar companies frequently receive duplicate inquiries across marketing channels. The CRM service provides duplicate detection:
- `GET /api/v1/crm/leads/duplicates?phone=...&email=...`
- Checks whether an active (non-deleted) lead exists with the same phone or email within the same tenant.
- Returns duplicate match status and existing lead reference.

---

## 4. Lead-to-Customer Conversion

When a lead reaches contract readiness or requires formal site engineering, the user triggers `POST /api/v1/crm/leads/:id/convert`.
This executes an atomic database transaction:
1. Generates customer number `CUST-YYYYMMDD-XXXX`.
2. Creates `Customer` entity.
3. Creates primary `CustomerContact` from lead identity.
4. Creates `CustomerAddress` (billing address).
5. Creates initial `CustomerSite` with estimated roof area and sanctioned load.
6. Updates `Lead.status` to `WON` and links `convertedCustomerId`.
7. Appends activity and status history entries.
