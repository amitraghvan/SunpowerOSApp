# ADR-008: Background Processing & Transactional Outbox with BullMQ

## Status
Accepted

## Context
Solar ERP operations require asynchronous tasks: PDF quotation and contract generation, customer WhatsApp/SMS notifications, government subsidy status polling, and inverter telemetry synchronization. Performing these synchronously in HTTP request threads would lead to timeouts and poor UX. Distributed messaging brokers (Kafka, RabbitMQ) are overly complex for this stage.

## Decision
We select **Redis + BullMQ with the Transactional Outbox Pattern**:
1. Business actions write events to the `outbox_events` table within the same ACID database transaction.
2. A lightweight poller dispatches pending outbox events to BullMQ queues (`notifications`, `documents`, `pdf-generation`, `reports`, `ai-processing`).
3. Dedicated worker process (`apps/api/src/worker.ts`) consumes BullMQ jobs with automatic retries and exponential backoff.

## Consequences
- **Positive:** Guaranteed at-least-once event delivery, zero HTTP request blocking, minimal infrastructure footprint (Redis).
- **Negative:** Outbox polling introduces a sub-second latency before asynchronous jobs begin processing.
