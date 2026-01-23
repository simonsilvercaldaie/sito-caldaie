-- SECURITY MIGRATION: ACCOUNT DELETION TOKENS
-- Objective: Store temporary tokens for 2-step account deletion.

BEGIN;

-- 1. Create Table
CREATE TABLE IF NOT EXISTS account_deletion_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_adt_user_id ON account_deletion_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_adt_expires_at ON account_deletion_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_adt_token_hash ON account_deletion_tokens(token_hash);

-- 3. RLS
ALTER TABLE account_deletion_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- STRICT SECURITY: No public policies.
-- Only the Service Role (API) can SELECT/INSERT/UPDATE.
-- This prevents users from listing tokens or creating fake ones directly via Supabase Client.

COMMIT;
