# SOLAROS ERP — API PHASE 1 REST SPECIFICATION
## Endpoints, Request/Response Payloads & HTTP Status Codes

---

## 1. CRM & Lead Management (`/api/v1/crm`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/crm/leads` | Create new lead with scoring & activity log | 201 Created |
| `GET` | `/api/v1/crm/leads` | Paginated lead listing with search & filters | 200 OK |
| `GET` | `/api/v1/crm/leads/duplicates` | Check phone/email duplicate inquiries | 200 OK |
| `GET` | `/api/v1/crm/leads/:id` | Get lead by ID with activities & history | 200 OK |
| `PATCH` | `/api/v1/crm/leads/:id` | Update lead contact or technical inputs | 200 OK |
| `POST` | `/api/v1/crm/leads/:id/status` | Execute state machine transition | 200 OK / 400 |
| `POST` | `/api/v1/crm/leads/:id/activities` | Append activity log entry | 201 Created |
| `POST` | `/api/v1/crm/leads/:id/convert` | Atomically convert lead into Customer 360 | 201 Created |
| `GET` | `/api/v1/crm/analytics` | Aggregate lead pipeline metrics | 200 OK |

---

## 2. Customer Management (`/api/v1/customers`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/customers` | Register customer account | 201 Created |
| `GET` | `/api/v1/customers` | Paginated customer accounts | 200 OK |
| `GET` | `/api/v1/customers/:id` | Get customer profile | 200 OK |
| `GET` | `/api/v1/customers/:id/360` | Full Customer 360 with activity timeline | 200 OK |
| `PATCH` | `/api/v1/customers/:id` | Update customer record | 200 OK |
| `POST` | `/api/v1/customers/:id/contacts` | Add contact person (primary management) | 201 Created |
| `POST` | `/api/v1/customers/:id/addresses` | Add billing or site address | 201 Created |
| `POST` | `/api/v1/customers/:id/sites` | Register installation rooftop site | 201 Created |
| `GET` | `/api/v1/customers/:id/sites` | List installation sites for customer | 200 OK |

---

## 3. Site Surveys & Assessments (`/api/v1/surveys`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/surveys` | Request new site survey | 201 Created |
| `GET` | `/api/v1/surveys` | List surveys by status/customer | 200 OK |
| `GET` | `/api/v1/surveys/:id` | Get survey details with revisions | 200 OK |
| `POST` | `/api/v1/surveys/:id/schedule` | Assign technician and date | 200 OK |
| `POST` | `/api/v1/surveys/:id/assessment` | Submit rooftop & electrical assessment | 200 OK |
| `POST` | `/api/v1/surveys/:id/review` | Approve or request survey revision | 200 OK |
| `POST` | `/api/v1/surveys/:id/photos/upload-url` | Generate MinIO presigned PUT URL | 200 OK |
| `POST` | `/api/v1/surveys/:id/photos/confirm` | Confirm photo metadata in DB | 201 Created |
| `GET` | `/api/v1/surveys/:id/photos` | List photos with signed download URLs | 200 OK |
| `GET` | `/api/v1/surveys/:id/report` | Printable survey report dataset | 200 OK |

---

## 4. Solar Product Catalog (`/api/v1/catalog`)

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/catalog/categories` | Create product category | 201 Created |
| `GET` | `/api/v1/catalog/categories` | List active categories | 200 OK |
| `POST` | `/api/v1/catalog/manufacturers` | Register OEM / manufacturer | 201 Created |
| `GET` | `/api/v1/catalog/manufacturers` | List manufacturers | 200 OK |
| `POST` | `/api/v1/catalog/products` | Create solar product model | 201 Created |
| `GET` | `/api/v1/catalog/products` | Paginated product list with filters | 200 OK |
| `GET` | `/api/v1/catalog/products/:id` | Get product with variants & specs | 200 OK |
| `POST` | `/api/v1/catalog/products/:id/variants` | Add SKU variant with initial price | 201 Created |
| `PATCH` | `/api/v1/catalog/variants/:id/price` | Adjust prices and record audit history | 200 OK |
| `GET` | `/api/v1/catalog/variants/:id/price-history` | Audit log of historical price changes | 200 OK |
| `POST` | `/api/v1/catalog/attribute-definitions` | Define dynamic technical parameter | 201 Created |
| `GET` | `/api/v1/catalog/categories/:id/attribute-definitions` | List attribute definitions for category | 200 OK |
| `POST` | `/api/v1/catalog/products/:id/attributes` | Upsert technical spec values on product | 200 OK |
