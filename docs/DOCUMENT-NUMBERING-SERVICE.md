# SolarOS Concurrency-Safe Document Numbering Service

## 1. Overview & Business Need

SolarOS operates in a multi-tenant environment where multiple engineers and commercial executives simultaneously generate engineering designs, bills of materials, quotations, contracts, and sales orders. Sequential numbering must be:
- 100% collision-free under concurrent traffic.
- Strictly tenant-isolated.
- Reset or partitioned cleanly by fiscal year.

## 2. Implementation (`NumberingService`)

The service operates against the `DocumentSequence` table using atomic upserts:

```typescript
const sequence = await tx.documentSequence.upsert({
  where: {
    organizationId_type_year: {
      organizationId,
      type: documentType,
      year: currentYear,
    },
  },
  update: {
    lastSequence: { increment: 1 },
  },
  create: {
    organizationId,
    type: documentType,
    year: currentYear,
    prefix,
    lastSequence: 1,
  },
});
```

## 3. Standard Document Formats

| Document Type | Standard Format | Example |
|---|---|---|
| Engineering Design | `DES-YYYY-XXXXXX` | `DES-2026-000001` |
| Bill of Materials | `BOM-YYYY-XXXXXX` | `BOM-2026-000001` |
| Commercial Quotation | `QTN-YYYY-XXXXXX` | `QTN-2026-000001` |
| Legal Contract | `CON-YYYY-XXXXXX` | `CON-2026-000001` |
| Sales Order | `SO-YYYY-XXXXXX` | `SO-2026-000001` |
| Project Initiation | `PRJ-YYYY-XXXXXX` | `PRJ-2026-000001` |
