# ADR-004: Selection of PostgreSQL as Primary Datastore

## Status
Accepted

## Context
Solar ERP operations require strict ACID transactions for inventory stock adjustments, serial number tracking, milestone invoice generation, and financial accounting. Unstructured or eventually consistent NoSQL databases are ill-suited for ERP financial and inventory integrity.

## Decision
We select **PostgreSQL 16** as the sole primary database.
1. Relational schema with foreign key integrity.
2. Row-Level Security (RLS) for tenant isolation.
3. Native JSONB for flexible engineering metadata and audit logging.
4. Decimal types for financial accuracy.

## Consequences
- **Positive:** Unrivaled reliability, proven ACID guarantees, powerful indexing, and native multi-tenancy capabilities.
- **Negative:** Relational schema migrations must be planned and executed carefully in production.
