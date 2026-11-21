-- ==============================================================================
-- SOLAROS DATABASE CONSTRAINTS
-- Enforces business integrity rules at the SQL level.
-- ==============================================================================

-- 1. Valid email format check on users
ALTER TABLE IF EXISTS "users"
  DROP CONSTRAINT IF EXISTS chk_users_valid_email;
ALTER TABLE IF EXISTS "users"
  ADD CONSTRAINT chk_users_valid_email 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2. Organization slug format check (lowercase alphanumeric and hyphens only)
ALTER TABLE IF EXISTS "organizations"
  DROP CONSTRAINT IF EXISTS chk_org_slug_format;
ALTER TABLE IF EXISTS "organizations"
  ADD CONSTRAINT chk_org_slug_format 
  CHECK (slug ~* '^[a-z0-9-]+$');
