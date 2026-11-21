# SolarOS ERP — Record-Level Security & Visibility Scopes

## 1. Scope Definitions
In solar operations, access boundaries vary between managerial and field personnel:
- **ORGANIZATION (All records)**: Administrators, Project Managers, and Finance Controllers view all projects, surveys, and customer contracts across the company.
- **BRANCH (Depot isolation)**: Branch managers and regional operations personnel access only records where `branchId` equals their active branch context.
- **ASSIGNED (Technician task queue)**: Field technicians view and submit measurements exclusively for surveys and installation tasks assigned to their `userId` (`assignedTechnicianId = userId`).
- **OWN (Representative ownership)**: Sales representatives access leads and customer contacts created by or assigned directly to them.

## 2. Enforcement Mechanisms
Record-level constraints operate on two layers:
1. **Application Query Filtering**: NestJS service layers (`LeadsService`, `SurveysService`) inspect `req.tenantContext.roles` and inject `where: { assignedTechnicianId: userId }` or `where: { branchId: tenantContext.branchId }`.
2. **Database Engine Row-Level Security**: PostgreSQL RLS policies enforce `organizationId = current_setting('app.current_organization_id', true)` to guarantee that even if an application filter is omitted, rows from other tenants can never be returned or modified.
