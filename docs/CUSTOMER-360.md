# SOLAROS ERP — CUSTOMER 360 SPECIFICATION
## Comprehensive Commercial, Technical & Chronological Timeline View

---

## 1. Concept & Requirements

Customer 360 is the unified operational cockpit in SolarOS ERP. It aggregates all commercial interactions, technical site parameters, feasibility surveys, quotations, and chronological timeline events into a single queryable endpoint and UI workspace.

---

## 2. API Contract: `GET /api/v1/customers/:id/360`

The 360 aggregator returns:
```typescript
interface ICustomer360 extends ICustomer {
  contacts: ICustomerContact[];
  addresses: ICustomerAddress[];
  sites: ICustomerSite[];
  convertedLead?: ILead | null;
  surveys?: ISurvey[];
  activityTimeline: Array<{
    id: string;
    type: string;
    timestamp: Date | string;
    summary: string;
    metadata?: Record<string, any>;
  }>;
}
```

---

## 3. Timeline Aggregation Pipeline

The activity timeline aggregates and sorts in descending chronological order:
1. **Customer Account Creation:** System record timestamp and account status.
2. **Lead Historical Interactions:** Pre-conversion calls, meetings, notes, and emails captured during the sales inquiry phase.
3. **Site Registrations:** Additions of rooftop locations, DISCOM connection updates.
4. **Survey Milestones:** Scheduling, technical assessments, approvals, and revisions.
5. **Quotations & Orders (Phase 2):** Proposal dispatches and sales order approvals.
