# Request for Quotation (RFQ) Management

## Overview
The RFQ module enables competitive bidding across multiple qualified suppliers. It issues standardized material specifications, target quantities, delivery due dates, and commercial terms to invited vendors.

## Core Capabilities
- **Multi-Supplier Broadcasting**: An RFQ is linked to multiple suppliers via `RFQSupplier` records (`INVITED`, `QUOTED`, `DECLINED`).
- **Standardized Lines**: Each `RFQLine` specifies required item variants, target quantities, and target unit benchmarks.
- **Quote Ingestion**: Vendor responses are ingested via `submitSupplierQuotation`, tracking reference quote numbers, validity dates, itemized rates, GST rates, and promised lead times.
- **Status Lifecycle**:
  - `DRAFT`: Initial specification configuration.
  - `ISSUED` / `PUBLISHED`: Transmitted to invited suppliers.
  - `CLOSED`: Bidding window expired.
  - `EVALUATED`: Comparative ranking matrix generated.
  - `AWARDED`: Winning bidder awarded; non-winning quotes marked rejected.
