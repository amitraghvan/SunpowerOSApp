# SolarOS ERP — Role-Permission Matrix

| Permission Code | Category | Action | Sensitivity | SYS_ADMIN | ORG_ADMIN | PROJ_MGR | SOLAR_ENG | TECHNICIAN | SALES_REP |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `iam:users:read` | IDENTITY | READ | NORMAL | ✓ | ✓ | ✓ | | | |
| `iam:users:create` | IDENTITY | CREATE | SENSITIVE | ✓ | ✓ | | | | |
| `iam:users:update` | IDENTITY | UPDATE | SENSITIVE | ✓ | ✓ | | | | |
| `iam:users:delete` | IDENTITY | DELETE | CRITICAL | ✓ | ✓ | | | | |
| `iam:roles:read` | IDENTITY | READ | NORMAL | ✓ | ✓ | | | | |
| `iam:roles:manage` | IDENTITY | MANAGE | CRITICAL | ✓ | ✓ | | | | |
| `iam:permissions:read` | IDENTITY | READ | NORMAL | ✓ | ✓ | | | | |
| `iam:sessions:read` | IDENTITY | READ | NORMAL | ✓ | ✓ | | | | |
| `iam:sessions:revoke` | IDENTITY | MANAGE | SENSITIVE | ✓ | ✓ | | | | |
| `iam:audit:read` | IDENTITY | READ | SENSITIVE | ✓ | ✓ | | | | |
| `org:organizations:read` | ORGANIZATION | READ | NORMAL | ✓ | ✓ | ✓ | | | |
| `org:organizations:update`| ORGANIZATION | UPDATE | CRITICAL | ✓ | ✓ | | | | |
| `org:branches:read` | ORGANIZATION | READ | NORMAL | ✓ | ✓ | ✓ | | | |
| `org:branches:manage` | ORGANIZATION | MANAGE | SENSITIVE | ✓ | ✓ | | | | |
| `org:invitations:manage` | ORGANIZATION | MANAGE | SENSITIVE | ✓ | ✓ | | | | |
| `crm:leads:read` | CRM | READ | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `crm:leads:create` | CRM | CREATE | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `crm:leads:update` | CRM | UPDATE | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `crm:leads:delete` | CRM | DELETE | CRITICAL | ✓ | ✓ | | | | |
| `crm:leads:assign` | CRM | ASSIGN | NORMAL | ✓ | ✓ | ✓ | | | |
| `crm:leads:export` | CRM | EXPORT | SENSITIVE | ✓ | ✓ | ✓ | | | |
| `crm:analytics:read` | CRM | READ | NORMAL | ✓ | ✓ | ✓ | | | |
| `customer:customers:read` | CUSTOMERS | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `customer:customers:create`| CUSTOMERS | CREATE | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `customer:customers:update`| CUSTOMERS | UPDATE | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `customer:customers:delete`| CUSTOMERS | DELETE | CRITICAL | ✓ | ✓ | | | | |
| `customer:360:read` | CUSTOMERS | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `survey:surveys:read` | SURVEYS | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `survey:surveys:create` | SURVEYS | CREATE | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `survey:surveys:update` | SURVEYS | UPDATE | NORMAL | ✓ | ✓ | ✓ | | ✓ | |
| `survey:surveys:assign` | SURVEYS | ASSIGN | NORMAL | ✓ | ✓ | ✓ | | | |
| `survey:surveys:review` | SURVEYS | APPROVE | SENSITIVE | ✓ | ✓ | ✓ | ✓ | | |
| `catalog:products:read` | CATALOG | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `catalog:products:create` | CATALOG | CREATE | SENSITIVE | ✓ | ✓ | | | | |
| `catalog:products:update` | CATALOG | UPDATE | SENSITIVE | ✓ | ✓ | | | | |
| `catalog:pricing:read` | CATALOG | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `catalog:pricing:update` | CATALOG | UPDATE | CRITICAL | ✓ | ✓ | | | | |
| `engineering:designs:read`| ENGINEERING | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | | |
| `engineering:designs:manage`| ENGINEERING | MANAGE | SENSITIVE | ✓ | ✓ | ✓ | ✓ | | |
| `bom:boms:read` | BOM | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | | |
| `bom:boms:manage` | BOM | MANAGE | SENSITIVE | ✓ | ✓ | ✓ | ✓ | | |
| `quotation:quotations:read`| QUOTATIONS | READ | NORMAL | ✓ | ✓ | ✓ | ✓ | | ✓ |
| `quotation:quotations:manage`| QUOTATIONS | MANAGE | SENSITIVE | ✓ | ✓ | ✓ | | | ✓ |
| `quotation:quotations:approve`| QUOTATIONS | APPROVE | CRITICAL | ✓ | ✓ | ✓ | | | |
| `sales_order:orders:read` | SALES_ORDERS| READ | NORMAL | ✓ | ✓ | ✓ | | | ✓ |
| `sales_order:orders:manage`| SALES_ORDERS| MANAGE | CRITICAL | ✓ | ✓ | ✓ | | | |
