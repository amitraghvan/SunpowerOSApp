# Purchase Order Versioning & Revision Control

## Revision Management Principle
In Solar EPC procurement, scope amendments, manufacturer module wattage changes (e.g. 545W to 550W), or commercial rate fluctuations frequently require modifying an approved Purchase Order. To maintain a complete audit trail without losing previous legal commitments, SolarOS implements immutable PO versioning.

## Versioning Algorithm
When `createPORevision` is executed:
1. The original PO record (e.g. `PO-2026-000001`, version 1) is duplicated into a new row with:
   - Identical `poNumber`: `PO-2026-000001`.
   - Incremented `version`: $v_{\text{new}} = v_{\text{old}} + 1$.
   - Status reset to `PENDING_APPROVAL` with `approvalStatus: PENDING`.
   - Updated lines and pricing as per the revision request.
   - Preserved `notes` including the audit reason for the revision.
2. The previous version remains archived in the database for historical matching and legal dispute resolution.
3. The unique constraint `@@unique([organizationId, poNumber, version])` guarantees that no two versions can collide within a tenant organization.
