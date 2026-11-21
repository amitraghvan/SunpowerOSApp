# SolarOS Phase 3 REST API Documentation

All endpoints are hosted under `/api/v1` and protected by `AuthenticationGuard`, `TenantContextGuard`, and `PermissionsGuard`.

---

## 1. Suppliers Controller (`/api/v1/suppliers`)

| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | `suppliers:suppliers:manage` | Creates a new supplier profile with statutory GSTIN/PAN and category |
| `GET` | `/` | `suppliers:suppliers:read` | Lists suppliers with category, type, status, and search filters |
| `GET` | `/:id` | `suppliers:suppliers:read` | Retrieves full supplier record including contacts, addresses, banks, docs, and product mappings |
| `PUT` | `/:id` | `suppliers:suppliers:manage` | Updates supplier profile, rating, or commercial terms |
| `POST` | `/:id/contacts` | `suppliers:suppliers:manage` | Adds a contact person to the supplier |
| `POST` | `/:id/addresses` | `suppliers:suppliers:manage` | Adds a billing/shipping address or warehouse to the supplier |
| `POST` | `/:id/bank-accounts` | `suppliers:suppliers:manage` | Adds bank settlement information (IFSC, Account number) |
| `POST` | `/:id/documents` | `suppliers:suppliers:manage` | Registers statutory vendor compliance documents |
| `POST` | `/:id/products` | `suppliers:suppliers:manage` | Maps a catalog product to the supplier with SKU, price, MOQ, and lead time |
| `PUT` | `/:id/products/:mappingId` | `suppliers:suppliers:manage` | Updates supplier SKU mapping and price |

---

## 2. Procurement Controller (`/api/v1/procurement`)

### 2.1 Dashboard & Analytics
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard` | `procurement:po:read` | Retrieves consolidated procurement metrics: total spend, open POs, pending PRs, active suppliers |

### 2.2 Material Requirements Planning (MRP)
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/mrp/generate` | `procurement:mrp:manage` | Generates net material requirements by exploding approved project BOM against inventory |
| `GET` | `/mrp` | `procurement:mrp:manage` | Lists all MRP runs and requirement calculations |
| `GET` | `/mrp/:id` | `procurement:mrp:manage` | Retrieves itemized MRP run with shortfall quantities |
| `POST` | `/mrp/:id/convert-to-pr` | `procurement:mrp:manage` | Converts MRP shortfalls into an official Purchase Requisition (PR) |

### 2.3 Purchase Requisitions (PR)
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/requisitions` | `procurement:requisitions:manage` | Creates a manual purchase requisition with itemized lines |
| `GET` | `/requisitions` | `procurement:requisitions:read` | Lists purchase requisitions with status and priority filters |
| `GET` | `/requisitions/:id` | `procurement:requisitions:read` | Retrieves requisition details and line items |
| `POST` | `/requisitions/:id/approve` | `procurement:requisitions:approve` | Formally authorizes a purchase requisition for procurement |
| `POST` | `/requisitions/:id/reject` | `procurement:requisitions:approve` | Rejects a purchase requisition with reason notes |

### 2.4 Request for Quotation (RFQ) & Supplier Quotes
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/rfqs` | `procurement:rfq:manage` | Creates an RFQ bidding event and invites suppliers |
| `GET` | `/rfqs` | `procurement:rfq:manage` | Lists all RFQs with status and date filters |
| `GET` | `/rfqs/:id` | `procurement:rfq:manage` | Retrieves RFQ details, invited suppliers, and collected quotations |
| `POST` | `/rfqs/:id/quotations` | `procurement:rfq:manage` | Submits a vendor quotation response with line-item pricing and terms |
| `GET` | `/rfqs/:id/compare` | `procurement:rfq:manage` | Generates a comparative matrix of supplier bids across price, lead time, and terms |
| `POST` | `/rfqs/:id/award` | `procurement:rfq:manage` | Awards RFQ to the winning supplier and triggers PO generation |

### 2.5 Purchase Orders (PO) & Revisions
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/purchase-orders` | `procurement:po:manage` | Creates a purchase order directly or from an awarded quotation |
| `GET` | `/purchase-orders` | `procurement:po:read` | Lists purchase orders with status, supplier, and date filters |
| `GET` | `/purchase-orders/:id` | `procurement:po:read` | Retrieves purchase order details, lines, revisions, and fulfillment status |
| `POST` | `/purchase-orders/:id/approve` | `procurement:po:approve` | Formally approves or rejects a PO based on delegated financial limits |
| `POST` | `/purchase-orders/:id/revisions` | `procurement:po:manage` | Creates an amended PO revision (v2, v3) preserving historical versions |
| `POST` | `/purchase-orders/:id/delivery-schedules` | `procurement:po:manage` | Creates a phased delivery schedule for multi-tranche fulfillment |

---

## 3. Inbound & Inventory Controller (`/api/v1/inbound`)

### 3.1 Locations & Storage
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/locations` | `inbound:grn:manage` | Creates an inventory location (Receiving Dock, Quarantine, Main Warehouse) |
| `GET` | `/locations` | `inbound:grn:read` | Lists active storage and receiving locations |

### 3.2 Goods Receipt Notes (GRN)
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/grns` | `inbound:grn:manage` | Records gate pass entry and delivery challan receipt against a PO |
| `GET` | `/grns` | `inbound:grn:read` | Lists GRNs with status and supplier filters |
| `GET` | `/grns/:id` | `inbound:grn:read` | Retrieves GRN details, challan quantities, and inspection results |

### 3.3 Quality Inspection (QIR)
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/inspections` | `inbound:inspection:manage` | Performs physical, visual, and electrical flash test QA inspection |

### 3.4 Serial & Batch Tracking
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/serials/register` | `inbound:serials:manage` | Bulk registers barcode/QR scanned serial numbers for solar panels & inverters |
| `GET` | `/serials` | `inbound:serials:manage` | Lists and searches serial numbers with lifecycle status |
| `PUT` | `/serials/:id/status` | `inbound:serials:manage` | Updates serial lifecycle state (e.g. RESERVED, DISPATCHED, INSTALLED) |

### 3.5 Supplier Returns & Debit Notes
| Method | Endpoint | Permission Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/returns` | `inbound:returns:manage` | Creates a supplier return note for damaged/rejected goods with debit note linkage |
| `GET` | `/returns` | `inbound:returns:manage` | Lists all supplier returns with status and debit note amounts |
| `GET` | `/returns/:id` | `inbound:returns:manage` | Retrieves supplier return details and rejected line items |
