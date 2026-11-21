# SolarOS ERP — Phase 0.5 API Endpoint Permission Coverage

All endpoints are guarded by `AuthenticationGuard`, `TenantContextGuard`, and `PermissionsGuard`:

| Module | HTTP Method | Endpoint | Required Permissions |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/v1/auth/login` | `@Public()` |
| | `POST` | `/api/v1/auth/logout` | Authenticated |
| | `GET` | `/api/v1/auth/me` | Authenticated |
| | `POST` | `/api/v1/auth/password/forgot` | `@Public()` |
| | `POST` | `/api/v1/auth/password/reset` | `@Public()` |
| **Users** | `GET` | `/api/v1/users` | `iam:users:read` |
| | `GET` | `/api/v1/users/:id` | `iam:users:read` |
| | `POST` | `/api/v1/users` | `iam:users:create` |
| | `PATCH` | `/api/v1/users/:id` | `iam:users:update` |
| | `PUT` | `/api/v1/users/:id/roles` | `iam:roles:manage` |
| **Access Control** | `GET` | `/api/v1/access-control/permissions` | `iam:permissions:read` |
| | `GET` | `/api/v1/access-control/roles` | `iam:roles:read` |
| | `GET` | `/api/v1/access-control/roles/:id` | `iam:roles:read` |
| | `POST` | `/api/v1/access-control/roles` | `iam:roles:manage` |
| | `PATCH` | `/api/v1/access-control/roles/:id` | `iam:roles:manage` |
| | `DELETE` | `/api/v1/access-control/roles/:id` | `iam:roles:manage` |
| **Organizations** | `GET` | `/api/v1/organizations` | Authenticated |
| | `POST` | `/api/v1/organizations/:id/switch` | Authenticated |
| | `GET` | `/api/v1/organizations/:id/branches` | `org:branches:read` |
| | `POST` | `/api/v1/organizations/:id/branches` | `org:branches:manage` |
| | `GET` | `/api/v1/organizations/:id/invitations` | `org:invitations:manage` |
| | `POST` | `/api/v1/organizations/:id/invitations` | `org:invitations:manage` |
| | `POST` | `/api/v1/organizations/invitations/accept` | `@Public()` |
| **Sessions** | `GET` | `/api/v1/sessions` | Authenticated |
| | `DELETE` | `/api/v1/sessions/:id` | Authenticated |
| | `DELETE` | `/api/v1/sessions` | Authenticated |
| **CRM Leads** | `POST` | `/api/v1/crm/leads` | `crm:leads:create` |
| | `GET` | `/api/v1/crm/leads` | `crm:leads:read` |
| | `GET` | `/api/v1/crm/leads/:id` | `crm:leads:read` |
| | `PATCH` | `/api/v1/crm/leads/:id` | `crm:leads:update` |
| | `POST` | `/api/v1/crm/leads/:id/status` | `crm:leads:update` |
| | `POST` | `/api/v1/crm/leads/:id/activities` | `crm:leads:update` |
| | `POST` | `/api/v1/crm/leads/:id/convert` | `crm:leads:update`, `customer:customers:create` |
| **CRM Analytics** | `GET` | `/api/v1/crm/analytics` | `crm:analytics:read` |
| **Customers** | `POST` | `/api/v1/customers` | `customer:customers:create` |
| | `GET` | `/api/v1/customers` | `customer:customers:read` |
| | `GET` | `/api/v1/customers/:id` | `customer:customers:read` |
| | `GET` | `/api/v1/customers/:id/360` | `customer:360:read` |
| | `PATCH` | `/api/v1/customers/:id` | `customer:customers:update` |
| **Site Surveys** | `POST` | `/api/v1/surveys` | `survey:surveys:create` |
| | `GET` | `/api/v1/surveys` | `survey:surveys:read` |
| | `GET` | `/api/v1/surveys/:id` | `survey:surveys:read` |
| | `POST` | `/api/v1/surveys/:id/schedule` | `survey:surveys:assign` |
| | `POST` | `/api/v1/surveys/:id/assessment`| `survey:surveys:update` |
| | `POST` | `/api/v1/surveys/:id/review` | `survey:surveys:review` |
| **Catalog** | `POST` | `/api/v1/catalog/products` | `catalog:products:create` |
| | `GET` | `/api/v1/catalog/products` | `catalog:products:read` |
| | `GET` | `/api/v1/catalog/products/:id` | `catalog:products:read` |
| | `POST` | `/api/v1/catalog/products/:id/variants` | `catalog:products:create` |
| | `POST` | `/api/v1/catalog/variants/:id/price` | `catalog:pricing:update` |
| | `GET` | `/api/v1/catalog/variants/:id/prices` | `catalog:pricing:read` |
