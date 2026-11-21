# SOLAROS ERP — SYSTEM ARCHITECTURE SPECIFICATION

---

## 1. High-Level System Architecture

SolarOS is architected as an **Enterprise Modular Monolith within a Unified pnpm Monorepo**. It balances the agility of a single deployable unit with the strict domain encapsulation required for an enterprise ERP.

```text
                               +-----------------------------------+
                               |       CLIENT EXPERIENCES          |
                               +-----------------+-----------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
         v                                       v                                       v
+------------------+                   +--------------------+                  +--------------------+
|  Next.js ERP     |                   | Field Technician   |                  | Customer Portal    |
|  Backoffice App  |                   | Mobile Web PWA     |                  | Self-Service App   |
|  /(erp)          |                   | /(technician)      |                  | /(portal)          |
+--------+---------+                   +---------+----------+                  +---------+----------+
         |                                       |                                       |
         +---------------------------------------+---------------------------------------+
                                                 | HTTPS / JSON (REST)
                                                 v
                               +-----------------------------------+
                               |     SOLAROS API GATEWAY           |
                               |     NestJS Modular Monolith       |
                               |     Prefix: /api/v1               |
                               +-----------------+-----------------+
                                                 |
             +-----------------------------------+-----------------------------------+
             |                                                                       |
             v                                                                       v
+-------------------------------------+                             +-------------------------------------+
|        API HTTP SERVER              |                             |        QUEUE WORKER PROCESS         |
|        (src/main.ts)                |                             |        (src/worker.ts)              |
| - Correlation ID & Helmet           |                             | - BullMQ Job Processors             |
| - Multi-Tenant Context Middleware   |                             | - Transactional Outbox Poller       |
| - Global Exception Filters          |                             | - PDF & Report Generators           |
| - Domain Controllers & Use Cases    |                             | - Asynchronous Notification Workers |
+------------------+------------------+                             +------------------+------------------+
                   |                                                                   |
                   +---------------------------------+---------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                    ENTERPRISE DOMAIN MODULES (49)                                       |
|  [Foundation]  identity | organizations | access-control | employees | audit | configuration            |
|  [Commercial]  crm | customers | surveys | catalog | engineering | quotations | contracts | sales-orders|
|  [Projects]    projects | tasks | planning | scheduling                                                |
|  [SupplyChain] suppliers | procurement | inventory | warehouses | serial-registry | dispatch | logistics|
|  [FieldOps]    workforce | attendance | timesheets | installation | commissioning                       |
|  [AfterSales]  warranty | maintenance | service | helpdesk | replacement                                |
|  [Finance]     finance | invoicing | payments | expenses | accounting | project-costing                 |
|  [Supporting]  subsidy | documents | notifications | communications | analytics | workflow | ai-copilot |
+----------------------------------------------------+----------------------------------------------------+
                                                     |
                                                     v
+---------------------------------------------------------------------------------------------------------+
|                                      PERSISTENCE & SHARED INFRASTRUCTURE                                |
|   PostgreSQL 16 (Prisma ORM + RLS)  |  Redis 7 (BullMQ & Cache)  |  MinIO (S3-Compatible Object Store)  |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Key Architecture Tenets

1. **Modular Monolith over Microservices:** Microservices introduce distributed transaction overhead, network latency, and operational fragility. SolarOS encapsulates domain boundaries in clean NestJS modules within a single codebase, allowing instant function calls rather than RPCs, while preparing for eventual extraction if needed.
2. **Transactional Outbox Pattern:** Guarantees that database updates and event publications (e.g., dispatch notifications, quotation emails) occur atomically. If a database transaction commits, the event is guaranteed to be processed by BullMQ.
3. **Multi-Tenancy by Design:** Every tenant-scoped entity carries `organizationId`. Application-level guards resolve organization membership from cryptographic sessions, reinforced by database Row-Level Security policies.
4. **Separation of Read/Write & Worker Entrypoints:** The HTTP API and the asynchronous queue workers run as separate operating system processes from the exact same compiled codebase, ensuring that CPU-heavy tasks (such as PDF generation or PV design calculations) never block web request threads.
