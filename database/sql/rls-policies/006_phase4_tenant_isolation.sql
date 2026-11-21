-- ==============================================================================
-- SOLAROS MULTI-TENANCY RLS POLICIES — PHASE 4 EXTENSION
-- ==============================================================================
-- Tables:
--   1. warehouses
--   2. stock_reservations
--   3. stock_reservation_lines
--   4. stock_transfers
--   5. stock_transfer_lines
--   6. stock_counts
--   7. stock_count_lines
--   8. stock_adjustments
--   9. picking_orders
--  10. picking_order_lines
--  11. packing_orders
--  12. packing_order_lines
--  13. dispatch_orders
--  14. dispatch_order_lines
--  15. delivery_challans
--  16. proofs_of_delivery
--  17. customer_returns
--  18. customer_return_lines
--
-- Policy: Restrict rows to active tenant context or super-admin bypass
-- Enforced via: FORCE ROW LEVEL SECURITY (applies to owner & app user alike)
-- ==============================================================================

-- 1. Warehouses
ALTER TABLE IF EXISTS "warehouses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "warehouses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_warehouses ON "warehouses";
CREATE POLICY tenant_isolation_warehouses ON "warehouses"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 2. Stock Reservations
ALTER TABLE IF EXISTS "stock_reservations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_reservations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_reservations ON "stock_reservations";
CREATE POLICY tenant_isolation_stock_reservations ON "stock_reservations"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 3. Stock Reservation Lines
ALTER TABLE IF EXISTS "stock_reservation_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_reservation_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_reservation_lines ON "stock_reservation_lines";
CREATE POLICY tenant_isolation_stock_reservation_lines ON "stock_reservation_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 4. Stock Transfers
ALTER TABLE IF EXISTS "stock_transfers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_transfers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_transfers ON "stock_transfers";
CREATE POLICY tenant_isolation_stock_transfers ON "stock_transfers"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 5. Stock Transfer Lines
ALTER TABLE IF EXISTS "stock_transfer_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_transfer_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_transfer_lines ON "stock_transfer_lines";
CREATE POLICY tenant_isolation_stock_transfer_lines ON "stock_transfer_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 6. Stock Counts
ALTER TABLE IF EXISTS "stock_counts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_counts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_counts ON "stock_counts";
CREATE POLICY tenant_isolation_stock_counts ON "stock_counts"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 7. Stock Count Lines
ALTER TABLE IF EXISTS "stock_count_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_count_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_count_lines ON "stock_count_lines";
CREATE POLICY tenant_isolation_stock_count_lines ON "stock_count_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 8. Stock Adjustments
ALTER TABLE IF EXISTS "stock_adjustments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "stock_adjustments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_stock_adjustments ON "stock_adjustments";
CREATE POLICY tenant_isolation_stock_adjustments ON "stock_adjustments"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 9. Picking Orders
ALTER TABLE IF EXISTS "picking_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "picking_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_picking_orders ON "picking_orders";
CREATE POLICY tenant_isolation_picking_orders ON "picking_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 10. Picking Order Lines
ALTER TABLE IF EXISTS "picking_order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "picking_order_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_picking_order_lines ON "picking_order_lines";
CREATE POLICY tenant_isolation_picking_order_lines ON "picking_order_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 11. Packing Orders
ALTER TABLE IF EXISTS "packing_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "packing_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_packing_orders ON "packing_orders";
CREATE POLICY tenant_isolation_packing_orders ON "packing_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 12. Packing Order Lines
ALTER TABLE IF EXISTS "packing_order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "packing_order_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_packing_order_lines ON "packing_order_lines";
CREATE POLICY tenant_isolation_packing_order_lines ON "packing_order_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 13. Dispatch Orders
ALTER TABLE IF EXISTS "dispatch_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "dispatch_orders" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dispatch_orders ON "dispatch_orders";
CREATE POLICY tenant_isolation_dispatch_orders ON "dispatch_orders"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 14. Dispatch Order Lines
ALTER TABLE IF EXISTS "dispatch_order_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "dispatch_order_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_dispatch_order_lines ON "dispatch_order_lines";
CREATE POLICY tenant_isolation_dispatch_order_lines ON "dispatch_order_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 15. Delivery Challans
ALTER TABLE IF EXISTS "delivery_challans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "delivery_challans" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_delivery_challans ON "delivery_challans";
CREATE POLICY tenant_isolation_delivery_challans ON "delivery_challans"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 16. Proofs of Delivery
ALTER TABLE IF EXISTS "proofs_of_delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "proofs_of_delivery" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_proofs_of_delivery ON "proofs_of_delivery";
CREATE POLICY tenant_isolation_proofs_of_delivery ON "proofs_of_delivery"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 17. Customer Returns
ALTER TABLE IF EXISTS "customer_returns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_returns" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_returns ON "customer_returns";
CREATE POLICY tenant_isolation_customer_returns ON "customer_returns"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- 18. Customer Return Lines
ALTER TABLE IF EXISTS "customer_return_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "customer_return_lines" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation_customer_return_lines ON "customer_return_lines";
CREATE POLICY tenant_isolation_customer_return_lines ON "customer_return_lines"
  FOR ALL
  USING (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  )
  WITH CHECK (
    "organizationId" = current_setting('app.current_organization_id', true)
    OR current_setting('app.is_super_admin', true) = 'true'
  );

-- Grants for solaros_app application user
GRANT ALL PRIVILEGES ON TABLE "warehouses" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_reservations" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_reservation_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_transfers" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_transfer_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_counts" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_count_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "stock_adjustments" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "picking_orders" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "picking_order_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "packing_orders" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "packing_order_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "dispatch_orders" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "dispatch_order_lines" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "delivery_challans" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "proofs_of_delivery" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "customer_returns" TO solaros_app;
GRANT ALL PRIVILEGES ON TABLE "customer_return_lines" TO solaros_app;
