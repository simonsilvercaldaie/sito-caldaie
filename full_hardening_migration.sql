-- ============================================================
-- SIMONSILVERCALDAIE.IT - FULL HARDENING MIGRATION
-- Include: Auth Protection, Billing, Sessions, Devices, Team Licenses
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS & SETUP
-- ============================================================
-- Enable required extensions if not active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. CORE TABLES (PROFILES & BILLING)
-- ============================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    profile_completed BOOLEAN DEFAULT FALSE NOT NULL,
    last_device_reset_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(profile_completed);

-- BILLING PROFILES
CREATE TABLE IF NOT EXISTS billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('private', 'company')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_name TEXT,
    vat_number TEXT,
    sdi_code TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'IT',
    fiscal_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT billing_company_requires_vat CHECK (customer_type != 'company' OR vat_number IS NOT NULL),
    CONSTRAINT billing_profiles_user_id_key UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_user ON billing_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_vat ON billing_profiles(vat_number) WHERE vat_number IS NOT NULL;

-- ============================================================
-- 3. SESSION & DEVICE SECURITY
-- ============================================================

-- ACTIVE SESSIONS
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT active_sessions_user_id_key UNIQUE (user_id)
);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);

-- TRUSTED DEVICES (Limit 2)
CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    device_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT trusted_devices_user_device_key UNIQUE (user_id, device_hash)
);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);

-- ============================================================
-- 4. TEAM LICENSES
-- ============================================================

-- TEAM LICENSES
CREATE TABLE IF NOT EXISTS team_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    seats INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    billing_cycle TEXT,
    status TEXT DEFAULT 'active',
    owner_user_id UUID REFERENCES auth.users(id),
    last_payment_at TIMESTAMPTZ
);

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID REFERENCES team_licenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    removed_at TIMESTAMPTZ
);
-- Unique active user per team
CREATE UNIQUE INDEX IF NOT EXISTS uniq_team_members_active
    ON team_members(team_license_id, user_id)
    WHERE removed_at IS NULL;

-- TEAM INVITATIONS
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID NOT NULL REFERENCES team_licenses(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_user_id UUID REFERENCES auth.users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invitations_token_hash ON team_invitations(token_hash);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invitations_pending_email ON team_invitations(team_license_id, email) WHERE status = 'pending';

-- UPDATE PURCHASES TABLE
ALTER TABLE purchases 
    ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'individual' NOT NULL,
    ADD COLUMN IF NOT EXISTS seats INT DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS billing_cycle TEXT,
    ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS team_license_id UUID REFERENCES team_licenses(id),
    ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Snapshot columns for Invoice Integrity (Prevent data loss if profile changes)
ALTER TABLE purchases
    ADD COLUMN IF NOT EXISTS snapshot_company_name TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_vat_number TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_sdi_code TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_address TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_city TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_postal_code TEXT,
    ADD COLUMN IF NOT EXISTS snapshot_fiscal_code TEXT;

-- Drop default for plan_type (strict mode)
ALTER TABLE purchases ALTER COLUMN plan_type DROP DEFAULT;

-- Unique constraint for paypal capture id if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchases_paypal_capture_id_key') THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_paypal_capture_id_key UNIQUE (paypal_capture_id);
    END IF;
END $$;

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- BILLING
CREATE POLICY "Users can view own billing" ON billing_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own billing" ON billing_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own billing" ON billing_profiles FOR UPDATE USING (auth.uid() = user_id);

-- SESSIONS & DEVICES
CREATE POLICY "Users can view own sessions" ON active_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own devices" ON trusted_devices FOR SELECT USING (auth.uid() = user_id);

-- TEAMS
CREATE POLICY "Owners can view own licenses" ON team_licenses FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can view team members" ON team_members FOR SELECT USING (team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = auth.uid()));
CREATE POLICY "Members can view own membership" ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can view invitations" ON team_invitations FOR SELECT USING (team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = auth.uid()));

-- ============================================================
-- 4b. SECURITY LOGGING
-- ============================================================
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'session_blocked', 'device_limit_reached', 'reset_devices')),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);

-- Enable RLS (Admin Only can view - for now implicit admin access via service role)
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
-- No public policies needed as this is backend-only logging for now.

-- ============================================================
-- 6. FUNCTIONS & TRIGGERS

-- ============================================================

-- SESSION CLEANUP
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE deleted_count INTEGER;
BEGIN
    DELETE FROM active_sessions WHERE expires_at < now();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- DEVICE LIMIT CHECK
CREATE OR REPLACE FUNCTION check_device_limit(p_user_id UUID, p_device_hash TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_device_count INTEGER;
    v_device_exists BOOLEAN;
    v_max_devices INTEGER := 2;
BEGIN
    SELECT EXISTS (SELECT 1 FROM trusted_devices WHERE user_id = p_user_id AND device_hash = p_device_hash) INTO v_device_exists;
    IF v_device_exists THEN RETURN jsonb_build_object('allowed', true, 'reason', 'device_trusted'); END IF;
    SELECT COUNT(*) INTO v_device_count FROM trusted_devices WHERE user_id = p_user_id;
    IF v_device_count >= v_max_devices THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'device_limit_reached', 'current_count', v_device_count);
    END IF;
    RETURN jsonb_build_object('allowed', true, 'reason', 'under_limit');
END;
$$;

-- RESET COOL DOWN CHECK
CREATE OR REPLACE FUNCTION can_reset_devices(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_last_reset TIMESTAMPTZ;
    v_cooldown_days INTEGER := 30;
    v_cooldown_end TIMESTAMPTZ;
BEGIN
    SELECT last_device_reset_at INTO v_last_reset FROM profiles WHERE id = p_user_id;
    IF v_last_reset IS NULL THEN RETURN jsonb_build_object('can_reset', true); END IF;
    v_cooldown_end := v_last_reset + (v_cooldown_days || ' days')::interval;
    IF now() >= v_cooldown_end THEN
        RETURN jsonb_build_object('can_reset', true);
    ELSE
        RETURN jsonb_build_object('can_reset', false, 'cooldown_ends', v_cooldown_end, 'days_remaining', EXTRACT(DAY FROM v_cooldown_end - now())::INTEGER);
    END IF;
END;
$$;

-- AUTO CREATE PROFILE
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, profile_completed, last_device_reset_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', FALSE, now())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- TEAM ACCEPT INVITATION (ATOMIC)
CREATE OR REPLACE FUNCTION accept_team_invitation(p_token_hash TEXT, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_invite RECORD;
    v_license_id UUID;
    v_seats INT;
    v_count INT;
BEGIN
    SELECT * INTO v_invite FROM team_invitations WHERE token_hash = p_token_hash FOR UPDATE;
    IF v_invite IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'invitation_not_found'); END IF;
    IF v_invite.status != 'pending' THEN RETURN jsonb_build_object('success', false, 'error', 'invitation_not_pending'); END IF;
    IF v_invite.expires_at < now() THEN RETURN jsonb_build_object('success', false, 'error', 'invitation_expired'); END IF;

    v_license_id := v_invite.team_license_id;
    IF EXISTS (SELECT 1 FROM team_members WHERE team_license_id = v_license_id AND user_id = p_user_id AND removed_at IS NULL) THEN
         RETURN jsonb_build_object('success', false, 'error', 'already_member');
    END IF;

    SELECT seats INTO v_seats FROM team_licenses WHERE id = v_license_id FOR UPDATE;
    SELECT COUNT(*) INTO v_count FROM team_members WHERE team_license_id = v_license_id AND removed_at IS NULL;
    IF v_count >= v_seats THEN RETURN jsonb_build_object('success', false, 'error', 'seats_full'); END IF;

    INSERT INTO team_members(team_license_id, user_id) VALUES (v_license_id, p_user_id);
    UPDATE team_invitations SET status = 'accepted', accepted_at = now(), accepted_user_id = p_user_id WHERE id = v_invite.id;
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================
-- 7. CRITICAL HARDENING: BLOCK EMAIL/PASSWORD
-- ============================================================

-- First, NULLIFY all existing passwords to force Google/MagicLink
UPDATE auth.users SET encrypted_password = NULL WHERE encrypted_password IS NOT NULL;

-- Trigger to enforce Google-only by preventing encrypted_password
CREATE OR REPLACE FUNCTION verify_google_only()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Allow updates to other fields (e.g. last_sign_in_at), but prevent setting a password
    IF NEW.encrypted_password IS NOT NULL THEN
        RAISE EXCEPTION 'Email/Password authentication is disabled. Please use Google.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_google_only ON auth.users;
CREATE TRIGGER ensure_google_only
    BEFORE INSERT OR UPDATE OF encrypted_password ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION verify_google_only();

