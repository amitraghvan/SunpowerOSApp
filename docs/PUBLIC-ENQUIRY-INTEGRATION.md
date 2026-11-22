# SUNPOWEROS — PUBLIC CONTACT ENQUIRY INTEGRATION

## 1. Overview
Public website inquiries submitted on the marketing portal (`http://localhost:3000/contact`) flow directly into the centralized Platform Admin inbox (`http://localhost:3001/enquiries`).

---

## 2. Request Architecture

1. **Submission Point**:
   - `apps/web/src/app/contact/page.tsx` collects contact details:
     - `name`: Contact person
     - `email`: Business email
     - `company`: Solar EPC firm name
     - `phone`: Mobile number
     - `projectCapacity`: Target system capacity (e.g. 1-10 kW, >100 kW Commercial)
     - `message`: Specific operational requirements
     - `sourceUrl`: Origin URL
2. **API Endpoint**:
   - `POST /api/v1/enquiries` routed via `PublicEnquiriesController` in `apps/api`.
   - Generates document number: `ENQ-YYYY-XXXXXX` via `NumberingService`.
   - Inserts record into `platform_enquiries` and logs an initial creation activity in `platform_enquiry_activities`.
3. **Platform Admin Inbox**:
   - Platform Administrators review inbound leads on `http://localhost:3001/enquiries`.
   - Features status management (`NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `CLOSED`).
   - Supports assignee allocation, contact history timeline, and qualification notes.
