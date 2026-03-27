-- ============================================================
-- MIGRATION: admin_audit_log + admin_notes tables
-- Eseguire nel Supabase SQL Editor
-- IDEMPOTENTE (safe to run multiple times)
-- ============================================================

-- 1. AUDIT LOG — registra ogni azione admin
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email TEXT NOT NULL,
    target_user_id UUID,
    target_email TEXT,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role can read/write (secure by default)

CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);

-- 2. ADMIN NOTES — note assistenza per utente
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
-- No policies = only service_role can read/write

CREATE INDEX IF NOT EXISTS idx_admin_notes_user ON admin_notes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created ON admin_notes(created_at DESC);
