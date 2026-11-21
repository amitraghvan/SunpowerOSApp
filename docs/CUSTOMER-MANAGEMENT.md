# SOLAROS ERP — CUSTOMER MANAGEMENT SPECIFICATION
## Normalized Schema, Multi-Contact Governance & Site Registry

---

## 1. Domain Objectives

The Customer Management module provides a persistent entity model representing individuals and commercial entities that purchase solar EPC installations, battery systems, or maintenance services.

---

## 2. Entity Relational Architecture

```mermaid
erDiagram
    ORGANIZATION ||--o{ CUSTOMER : owns
    CUSTOMER ||--o{ CUSTOMER_CONTACT : "has contacts"
    CUSTOMER ||--o{ CUSTOMER_ADDRESS : "has addresses"
    CUSTOMER ||--o{ CUSTOMER_SITE : "has installation sites"
    CUSTOMER_SITE ||--o{ SURVEY : "surveyed by"

    CUSTOMER {
        string id PK
        string organizationId FK
        string customerNumber
        string customerType
        string name
        string phone
        string email
        string taxId
        string status
    }

    CUSTOMER_CONTACT {
        string id PK
        string customerId FK
        string name
        string designation
        string phone
        string email
        boolean isPrimary
    }

    CUSTOMER_SITE {
        string id PK
        string customerId FK
        string siteName
        string addressLine1
        string city
        string state
        string roofType
        decimal sanctionedLoadKw
        string electricityConnectionNumber
        string discomName
    }
```

---

## 3. Contact Governance Rules

- Each customer can have multiple authorized contacts (e.g., Managing Director, Site Engineer, Billing Lead).
- The `isPrimary` flag designates the main operational contact for notifications and dispatch.
- When a new contact is designated `isPrimary: true`, all existing contacts for that customer are automatically reset to `isPrimary: false`.

---

## 4. Site Registry

In solar installations, a single customer may own multiple physical installation sites (e.g., a commercial entity with 3 factories, or a residential owner with two properties).
The `CustomerSite` entity encapsulates:
- Physical coordinates (`latitude`, `longitude`)
- DISCOM utility provider details (`discomName`, `electricityConnectionNumber`, `sanctionedLoadKw`)
- Structural rooftop properties (`roofType`, `roofAreaSqFt`, `shadowFreeAreaSqFt`)
- Metering details (`meterNumber`, `averageMonthlyUnits`)
