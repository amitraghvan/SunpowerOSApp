-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 3 EXTENSION
-- ==============================================================================
-- Tables:
--   1. suppliers
--   2. supplier_contacts
--   3. supplier_addresses
--   4. supplier_bank_accounts
--   5. supplier_documents
--   6. supplier_product_mappings
--   7. supplier_price_history
--   8. material_requirements
--   9. material_requirement_lines
--  10. purchase_requisitions
--  11. purchase_requisition_lines
--  12. rfqs
--  13. rfq_lines
--  14. rfq_suppliers
--  15. supplier_quotations
--  16. supplier_quotation_lines
--  17. purchase_orders
--  18. purchase_order_lines
--  19. purchase_delivery_schedules
--  20. inventory_locations
--  21. goods_receipt_notes
--  22. goods_receipt_lines
--  23. quality_inspections
--  24. product_serials
--  25. inventory_receipt_movements
--  26. supplier_returns
--  27. supplier_return_lines
--
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY (applies to owner & app user alike)
-- ==============================================================================

-- 1. Suppliers
ALTER TABLE IF EXISTS "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "suppliers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_suppliers ON "suppliers";
CREATE POLICY tenant_isolation_suppliers ON "suppliers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Supplier Contacts
ALTER TABLE IF EXISTS "supplier_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_contacts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_contacts ON "supplier_contacts";
CREATE POLICY tenant_isolation_supplier_contacts ON "supplier_contacts"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Supplier Addresses
ALTER TABLE IF EXISTS "supplier_addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_addresses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_addresses ON "supplier_addresses";
CREATE POLICY tenant_isolation_supplier_addresses ON "supplier_addresses"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Supplier Bank Accounts
ALTER TABLE IF EXISTS "supplier_bank_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_bank_accounts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_bank_accounts ON "supplier_bank_accounts";
CREATE POLICY tenant_isolation_supplier_bank_accounts ON "supplier_bank_accounts"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 5. Supplier Documents
ALTER TABLE IF EXISTS "supplier_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_documents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_documents ON "supplier_documents";
CREATE POLICY tenant_isolation_supplier_documents ON "supplier_documents"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 6. Supplier Product Mappings
ALTER TABLE IF EXISTS "supplier_product_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_product_mappings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_product_mappings ON "supplier_product_mappings";
CREATE POLICY tenant_isolation_supplier_product_mappings ON "supplier_product_mappings"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 7. Supplier Price History
ALTER TABLE IF EXISTS "supplier_price_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_price_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_price_history ON "supplier_price_history";
CREATE POLICY tenant_isolation_supplier_price_history ON "supplier_price_history"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 8. Material Requirements
ALTER TABLE IF EXISTS "material_requirements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "material_requirements" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_material_requirements ON "material_requirements";
CREATE POLICY tenant_isolation_material_requirements ON "material_requirements"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 9. Material Requirement Lines
ALTER TABLE IF EXISTS "material_requirement_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "material_requirement_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_material_requirement_lines ON "material_requirement_lines";
CREATE POLICY tenant_isolation_material_requirement_lines ON "material_requirement_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 10. Purchase Requisitions
ALTER TABLE IF EXISTS "purchase_requisitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_requisitions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_purchase_requisitions ON "purchase_requisitions";
CREATE POLICY tenant_isolation_purchase_requisitions ON "purchase_requisitions"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 11. Purchase Requisition Lines
ALTER TABLE IF EXISTS "purchase_requisition_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_requisition_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_purchase_requisition_lines ON "purchase_requisition_lines";
CREATE POLICY tenant_isolation_purchase_requisition_lines ON "purchase_requisition_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 12. RFQs
ALTER TABLE IF EXISTS "rfqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "rfqs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rfqs ON "rfqs";
CREATE POLICY tenant_isolation_rfqs ON "rfqs"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 13. RFQ Lines
ALTER TABLE IF EXISTS "rfq_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "rfq_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rfq_lines ON "rfq_lines";
CREATE POLICY tenant_isolation_rfq_lines ON "rfq_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 14. RFQ Suppliers
ALTER TABLE IF EXISTS "rfq_suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "rfq_suppliers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_rfq_suppliers ON "rfq_suppliers";
CREATE POLICY tenant_isolation_rfq_suppliers ON "rfq_suppliers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 15. Supplier Quotations
ALTER TABLE IF EXISTS "supplier_quotations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_quotations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_quotations ON "supplier_quotations";
CREATE POLICY tenant_isolation_supplier_quotations ON "supplier_quotations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 16. Supplier Quotation Lines
ALTER TABLE IF EXISTS "supplier_quotation_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_quotation_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_quotation_lines ON "supplier_quotation_lines";
CREATE POLICY tenant_isolation_supplier_quotation_lines ON "supplier_quotation_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 17. Purchase Orders
ALTER TABLE IF EXISTS "purchase_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_purchase_orders ON "purchase_orders";
CREATE POLICY tenant_isolation_purchase_orders ON "purchase_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 18. Purchase Order Lines
ALTER TABLE IF EXISTS "purchase_order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_order_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_purchase_order_lines ON "purchase_order_lines";
CREATE POLICY tenant_isolation_purchase_order_lines ON "purchase_order_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 19. Purchase Delivery Schedules
ALTER TABLE IF EXISTS "purchase_delivery_schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "purchase_delivery_schedules" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_purchase_delivery_schedules ON "purchase_delivery_schedules";
CREATE POLICY tenant_isolation_purchase_delivery_schedules ON "purchase_delivery_schedules"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 20. Inventory Locations
ALTER TABLE IF EXISTS "inventory_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "inventory_locations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_inventory_locations ON "inventory_locations";
CREATE POLICY tenant_isolation_inventory_locations ON "inventory_locations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 21. Goods Receipt Notes
ALTER TABLE IF EXISTS "goods_receipt_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "goods_receipt_notes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_goods_receipt_notes ON "goods_receipt_notes";
CREATE POLICY tenant_isolation_goods_receipt_notes ON "goods_receipt_notes"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 22. Goods Receipt Lines
ALTER TABLE IF EXISTS "goods_receipt_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "goods_receipt_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_goods_receipt_lines ON "goods_receipt_lines";
CREATE POLICY tenant_isolation_goods_receipt_lines ON "goods_receipt_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 23. Quality Inspections
ALTER TABLE IF EXISTS "quality_inspections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "quality_inspections" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_quality_inspections ON "quality_inspections";
CREATE POLICY tenant_isolation_quality_inspections ON "quality_inspections"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 24. Product Serials
ALTER TABLE IF EXISTS "product_serials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_serials" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_product_serials ON "product_serials";
CREATE POLICY tenant_isolation_product_serials ON "product_serials"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 25. Inventory Receipt Movements
ALTER TABLE IF EXISTS "inventory_receipt_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "inventory_receipt_movements" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_inventory_receipt_movements ON "inventory_receipt_movements";
CREATE POLICY tenant_isolation_inventory_receipt_movements ON "inventory_receipt_movements"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 26. Supplier Returns
ALTER TABLE IF EXISTS "supplier_returns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_returns" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_returns ON "supplier_returns";
CREATE POLICY tenant_isolation_supplier_returns ON "supplier_returns"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 27. Supplier Return Lines
ALTER TABLE IF EXISTS "supplier_return_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "supplier_return_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_supplier_return_lines ON "supplier_return_lines";
CREATE POLICY tenant_isolation_supplier_return_lines ON "supplier_return_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );
