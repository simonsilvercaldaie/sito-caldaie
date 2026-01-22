-- ============================================================
-- SIMONSILVERCALDAIE.IT - AUTH PROTECTION MIGRATION
-- Sistema Autenticazione, Sessioni, Dispositivi, Fatturazione
-- ============================================================
-- Eseguire nel SQL Editor di Supabase

-- ============================================================
-- 1. PROFILES TABLE
-- Estende auth.users con metadati applicativi
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    profile_completed BOOLEAN DEFAULT FALSE NOT NULL,
    last_device_reset_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index per query su profile_completed
CREATE INDEX IF NOT EXISTS idx_profiles_completed ON profiles(profile_completed);

-- ============================================================
-- 2. BILLING PROFILES TABLE
-- Dati fiscali per fatturazione
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('private', 'company')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    -- Company fields (nullable for private)
    company_name TEXT,
    vat_number TEXT,
    sdi_code TEXT,
    -- Address
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'IT',
    -- Private fields
    fiscal_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Constraint: company MUST have vat_number
    CONSTRAINT billing_company_requires_vat CHECK (
        customer_type != 'company' OR vat_number IS NOT NULL
    ),
    -- One billing profile per user
    CONSTRAINT billing_profiles_user_id_key UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_profiles_user ON billing_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_vat ON billing_profiles(vat_number) WHERE vat_number IS NOT NULL;

-- ============================================================
-- 3. ACTIVE SESSIONS TABLE
-- Gestione sessione singola per utente
-- ============================================================
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires ON active_sessions(expires_at);

-- ============================================================
-- 4. TRUSTED DEVICES TABLE
-- Max 2 dispositivi fidati per utente
-- ============================================================
CREATE TABLE IF NOT EXISTS trusted_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    device_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Unique constraint per user + device
    CONSTRAINT trusted_devices_user_device_key UNIQUE (user_id, device_hash)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- BILLING PROFILES POLICIES
CREATE POLICY "Users can view own billing" ON billing_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing" ON billing_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing" ON billing_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- ACTIVE SESSIONS POLICIES
-- Note: Managed via service role, but allow user to view own
CREATE POLICY "Users can view own sessions" ON active_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- TRUSTED DEVICES POLICIES
CREATE POLICY "Users can view own devices" ON trusted_devices
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM active_sessions
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to check device limit
CREATE OR REPLACE FUNCTION check_device_limit(p_user_id UUID, p_device_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_device_count INTEGER;
    v_device_exists BOOLEAN;
    v_max_devices INTEGER := 2;
BEGIN
    -- Check if device already exists for this user
    SELECT EXISTS (
        SELECT 1 FROM trusted_devices 
        WHERE user_id = p_user_id AND device_hash = p_device_hash
    ) INTO v_device_exists;
    
    IF v_device_exists THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'device_trusted');
    END IF;
    
    -- Count existing devices
    SELECT COUNT(*) INTO v_device_count
    FROM trusted_devices
    WHERE user_id = p_user_id;
    
    IF v_device_count >= v_max_devices THEN
        RETURN jsonb_build_object(
            'allowed', false, 
            'reason', 'device_limit_reached',
            'current_count', v_device_count,
            'max_devices', v_max_devices
        );
    END IF;
    
    RETURN jsonb_build_object('allowed', true, 'reason', 'under_limit');
END;
$$;

-- Function to check if user can reset devices
CREATE OR REPLACE FUNCTION can_reset_devices(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_reset TIMESTAMPTZ;
    v_cooldown_days INTEGER := 30;
    v_cooldown_end TIMESTAMPTZ;
BEGIN
    SELECT last_device_reset_at INTO v_last_reset
    FROM profiles
    WHERE id = p_user_id;
    
    IF v_last_reset IS NULL THEN
        RETURN jsonb_build_object('can_reset', true);
    END IF;
    
    v_cooldown_end := v_last_reset + (v_cooldown_days || ' days')::interval;
    
    IF now() >= v_cooldown_end THEN
        RETURN jsonb_build_object('can_reset', true);
    ELSE
        RETURN jsonb_build_object(
            'can_reset', false,
            'cooldown_ends', v_cooldown_end,
            'days_remaining', EXTRACT(DAY FROM v_cooldown_end - now())::INTEGER
        );
    END IF;
END;
$$;

-- ============================================================
-- 7. TRIGGER: Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, profile_completed, last_device_reset_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        FALSE,
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 8. SCHEDULED JOB (Optional - requires pg_cron extension)
-- Uncomment if pg_cron is enabled in your Supabase project
-- ============================================================
-- SELECT cron.schedule(
--     'cleanup-expired-sessions',
--     '0 * * * *', -- Every hour
--     $$ SELECT cleanup_expired_sessions(); $$
-- );
