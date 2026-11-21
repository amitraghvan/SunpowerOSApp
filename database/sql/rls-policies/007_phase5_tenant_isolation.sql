-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 5 EXTENSION
-- ==============================================================================
-- Tables:
--   1. technician_profiles
--   2. technician_skills
--   3. technician_certifications
--   4. installation_crews
--   5. crew_members
--   6. project_technician_assignments
--   7. installation_schedules
--   8. site_readiness_records
--   9. site_readiness_checks
--  10. installation_work_orders
--  11. installation_tasks
--  12. work_order_technician_assignments
--  13. installation_milestones
--  14. project_material_handovers
--  15. material_handover_lines
--  16. material_consumptions
--  17. installation_safety_records
--  18. safety_checklist_items
--  19. safety_observations
--  20. safety_incidents
--  21. installation_quality_inspections
--  22. quality_inspection_items
--  23. commissioning_records
--  24. commissioning_tests
--  25. utility_connection_trackings
--  26. customer_handovers
--  27. handover_punchlist_items
--  28. handover_documents
--  29. project_cost_records
--
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY (applies to owner & app user alike)
-- ==============================================================================

-- 1. Technician Profiles
ALTER TABLE IF EXISTS "technician_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "technician_profiles" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_technician_profiles ON "technician_profiles";
CREATE POLICY tenant_isolation_technician_profiles ON "technician_profiles"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Technician Skills
ALTER TABLE IF EXISTS "technician_skills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "technician_skills" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_technician_skills ON "technician_skills";
CREATE POLICY tenant_isolation_technician_skills ON "technician_skills"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Technician Certifications
ALTER TABLE IF EXISTS "technician_certifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "technician_certifications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_technician_certifications ON "technician_certifications";
CREATE POLICY tenant_isolation_technician_certifications ON "technician_certifications"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Installation Crews
ALTER TABLE IF EXISTS "installation_crews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_crews" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_crews ON "installation_crews";
CREATE POLICY tenant_isolation_installation_crews ON "installation_crews"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 5. Crew Members
ALTER TABLE IF EXISTS "crew_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "crew_members" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_crew_members ON "crew_members";
CREATE POLICY tenant_isolation_crew_members ON "crew_members"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 6. Project Technician Assignments
ALTER TABLE IF EXISTS "project_technician_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "project_technician_assignments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_project_technician_assignments ON "project_technician_assignments";
CREATE POLICY tenant_isolation_project_technician_assignments ON "project_technician_assignments"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 7. Installation Schedules
ALTER TABLE IF EXISTS "installation_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_schedules" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_schedules ON "installation_schedules";
CREATE POLICY tenant_isolation_installation_schedules ON "installation_schedules"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 8. Site Readiness Records
ALTER TABLE IF EXISTS "site_readiness_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "site_readiness_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_site_readiness_records ON "site_readiness_records";
CREATE POLICY tenant_isolation_site_readiness_records ON "site_readiness_records"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 9. Site Readiness Checks
ALTER TABLE IF EXISTS "site_readiness_checks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "site_readiness_checks" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_site_readiness_checks ON "site_readiness_checks";
CREATE POLICY tenant_isolation_site_readiness_checks ON "site_readiness_checks"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 10. Installation Work Orders
ALTER TABLE IF EXISTS "installation_work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_work_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_work_orders ON "installation_work_orders";
CREATE POLICY tenant_isolation_installation_work_orders ON "installation_work_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 11. Installation Tasks
ALTER TABLE IF EXISTS "installation_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_tasks" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_tasks ON "installation_tasks";
CREATE POLICY tenant_isolation_installation_tasks ON "installation_tasks"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 12. Work Order Technician Assignments
ALTER TABLE IF EXISTS "work_order_technician_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "work_order_technician_assignments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_work_order_technician_assignments ON "work_order_technician_assignments";
CREATE POLICY tenant_isolation_work_order_technician_assignments ON "work_order_technician_assignments"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 13. Installation Milestones
ALTER TABLE IF EXISTS "installation_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_milestones" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_milestones ON "installation_milestones";
CREATE POLICY tenant_isolation_installation_milestones ON "installation_milestones"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 14. Project Material Handovers
ALTER TABLE IF EXISTS "project_material_handovers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "project_material_handovers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_project_material_handovers ON "project_material_handovers";
CREATE POLICY tenant_isolation_project_material_handovers ON "project_material_handovers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 15. Material Handover Lines
ALTER TABLE IF EXISTS "material_handover_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "material_handover_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_material_handover_lines ON "material_handover_lines";
CREATE POLICY tenant_isolation_material_handover_lines ON "material_handover_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 16. Material Consumptions
ALTER TABLE IF EXISTS "material_consumptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "material_consumptions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_material_consumptions ON "material_consumptions";
CREATE POLICY tenant_isolation_material_consumptions ON "material_consumptions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 17. Installation Safety Records
ALTER TABLE IF EXISTS "installation_safety_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_safety_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_safety_records ON "installation_safety_records";
CREATE POLICY tenant_isolation_installation_safety_records ON "installation_safety_records"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 18. Safety Checklist Items
ALTER TABLE IF EXISTS "safety_checklist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "safety_checklist_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_safety_checklist_items ON "safety_checklist_items";
CREATE POLICY tenant_isolation_safety_checklist_items ON "safety_checklist_items"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 19. Safety Observations
ALTER TABLE IF EXISTS "safety_observations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "safety_observations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_safety_observations ON "safety_observations";
CREATE POLICY tenant_isolation_safety_observations ON "safety_observations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 20. Safety Incidents
ALTER TABLE IF EXISTS "safety_incidents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "safety_incidents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_safety_incidents ON "safety_incidents";
CREATE POLICY tenant_isolation_safety_incidents ON "safety_incidents"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 21. Installation Quality Inspections
ALTER TABLE IF EXISTS "installation_quality_inspections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "installation_quality_inspections" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_installation_quality_inspections ON "installation_quality_inspections";
CREATE POLICY tenant_isolation_installation_quality_inspections ON "installation_quality_inspections"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 22. Quality Inspection Items
ALTER TABLE IF EXISTS "quality_inspection_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quality_inspection_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quality_inspection_items ON "quality_inspection_items";
CREATE POLICY tenant_isolation_quality_inspection_items ON "quality_inspection_items"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 23. Commissioning Records
ALTER TABLE IF EXISTS "commissioning_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "commissioning_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_commissioning_records ON "commissioning_records";
CREATE POLICY tenant_isolation_commissioning_records ON "commissioning_records"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 24. Commissioning Tests
ALTER TABLE IF EXISTS "commissioning_tests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "commissioning_tests" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_commissioning_tests ON "commissioning_tests";
CREATE POLICY tenant_isolation_commissioning_tests ON "commissioning_tests"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 25. Utility Connection Trackings
ALTER TABLE IF EXISTS "utility_connection_trackings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "utility_connection_trackings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_utility_connection_trackings ON "utility_connection_trackings";
CREATE POLICY tenant_isolation_utility_connection_trackings ON "utility_connection_trackings"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 26. Customer Handovers
ALTER TABLE IF EXISTS "customer_handovers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_handovers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_handovers ON "customer_handovers";
CREATE POLICY tenant_isolation_customer_handovers ON "customer_handovers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 27. Handover Punchlist Items
ALTER TABLE IF EXISTS "handover_punchlist_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "handover_punchlist_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_handover_punchlist_items ON "handover_punchlist_items";
CREATE POLICY tenant_isolation_handover_punchlist_items ON "handover_punchlist_items"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 28. Handover Documents
ALTER TABLE IF EXISTS "handover_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "handover_documents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_handover_documents ON "handover_documents";
CREATE POLICY tenant_isolation_handover_documents ON "handover_documents"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 29. Project Cost Records
ALTER TABLE IF EXISTS "project_cost_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "project_cost_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_project_cost_records ON "project_cost_records";
CREATE POLICY tenant_isolation_project_cost_records ON "project_cost_records"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
