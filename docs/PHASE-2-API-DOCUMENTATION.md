# SolarOS Phase 2 REST API Documentation

## 1. Engineering Controller (`/api/v1/engineering`)

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `POST` | `/designs` | `engineering:designs:manage` | Creates top-level engineering design |
| `GET` | `/designs` | `engineering:designs:read` | Lists tenant engineering designs |
| `GET` | `/designs/:id` | `engineering:designs:read` | Retrieves design with revisions & calculations |
| `POST` | `/designs/:id/revisions/:revNum/configure` | `engineering:designs:manage` | Updates revision hardware configuration |
| `POST` | `/designs/:id/revisions/:revNum/calculate` | `engineering:calculations:run` | Executes physics calculation engine |
| `POST` | `/designs/:id/approve` | `engineering:designs:approve` | Approves and freezes design |
| `POST` | `/designs/:id/revisions/:revNum/generate-bom` | `bom:boms:manage` | Compiles 6-category BOM |
| `GET` | `/boms/:id` | `bom:boms:read` | Retrieves itemized BOM |
| `POST` | `/boms/:id/approve` | `bom:boms:approve` | Approves and freezes BOM |

## 2. Quotations Controller (`/api/v1/quotations`)

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `POST` | `/` | `quotation:quotations:manage` | Generates commercial quotation from approved BOM |
| `GET` | `/` | `quotation:quotations:read` | Lists quotations with filter params |
| `GET` | `/:id` | `quotation:quotations:read` | Retrieves quotation with costing & GST schedule |
| `POST` | `/:id/approve` | `quotation:quotations:approve` | Approves commercial quotation |
| `POST` | `/:id/accept` | `quotation:quotations:manage` | Records customer digital/physical acceptance |

## 3. Contracts Controller (`/api/v1/contracts`)

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `POST` | `/` | `contract:contracts:manage` | Generates contract from accepted quotation |
| `GET` | `/` | `contract:contracts:read` | Lists contracts |
| `GET` | `/:id` | `contract:contracts:read` | Retrieves contract with milestone schedule |
| `POST` | `/:id/sign` | `contract:contracts:sign` | Records customer signature & activates contract |

## 4. Sales Orders Controller (`/api/v1/sales-orders`)

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `POST` | `/` | `sales_order:orders:manage` | Creates sales order with prerequisite tracking |
| `GET` | `/` | `sales_order:orders:read` | Lists sales orders |
| `GET` | `/:id` | `sales_order:orders:read` | Retrieves sales order & prerequisite gates |
| `POST` | `/:id/advance-payment` | `sales_order:orders:manage` | Records advance payment verification |
| `POST` | `/:id/confirm` | `sales_order:orders:confirm` | Confirms order & initiates project handoff |
