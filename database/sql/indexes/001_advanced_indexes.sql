-- ==============================================================================
-- SOLAROS ADVANCED DATABASE INDEXES
-- Optimizes tenant-scoped queries, timeline lookups, and outbox polling.
-- ==============================================================================

-- 1. Partial Index for Active Organization Memberships
CREATE INDEX IF NOT EXISTS idx_memberships_active_tenant 
  ON "organization_memberships" ("organizationId", "userId") 
  WHERE "deletedAt" IS NULL AND "isActive" = TRUE;

-- 2. Outbox Poller Index (Active pending/processing events only)
CREATE INDEX IF NOT EXISTS idx_outbox_pending_scheduled 
  ON "outbox_events" ("status", "scheduledFor") 
  WHERE "status" IN ('PENDING', 'PROCESSING');

-- 3. Active Sessions Index
CREATE INDEX IF NOT EXISTS idx_sessions_active 
  ON "sessions" ("userId", "expiresAt") 
  WHERE "revokedAt" IS NULL;

-- 4. Audit Log Timeline Lookup by Organization
CREATE INDEX IF NOT EXISTS idx_audit_logs_timeline 
  ON "audit_logs" ("organizationId", "createdAt" DESC);
