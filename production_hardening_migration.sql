-- PRODUCTION HARDENING MIGRATION
-- simonsilvercaldaie.it
--
-- 1. Performance Indexes
-- 2. Log Retention Policy
-- 3. Security Logging Helper

-- ============================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================

-- Speed up 'purchases' lookups by user (critical for login/dashboard)
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- Speed up 'purchases' idempotency checks (critical for purchase flow)
CREATE INDEX IF NOT EXISTS idx_purchases_paypal_capture_id ON purchases(paypal_capture_id);

-- Speed up 'team_members' lookups (critical for team dashboard/login)
CREATE INDEX IF NOT EXISTS idx_team_members_team_license_id ON team_members(team_license_id);

-- ============================================================
-- 2. LOG RETENTION MAINTENANCE
-- ============================================================

-- Function to clean old logs (retention: 90 days)
-- Can be called via cron or manually by admin
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events 
    WHERE created_at < (now() - INTERVAL '90 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ============================================================
-- 3. LOGGING HELPER (Optional, if not already present)
-- ============================================================

-- Ensure security_events has useful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_security_events_type_created ON security_events(event_type, created_at DESC);
