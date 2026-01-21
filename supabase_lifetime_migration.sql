-- LIFETIME LICENSES SAFE MIGRATION 2026-01-21
-- Esegui questo script nel Supabase SQL Editor.
-- Non Droppa nulla. Non forza NOT NULL su dati esistenti.

-- 1. Create Team Tables (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS team_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seats INT NOT NULL DEFAULT 5,
    owner_user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID NOT NULL REFERENCES team_licenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    removed_at TIMESTAMPTZ
);

-- Sicurezza: Owner ID su team_licenses (se tabella esisteva senza)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_licenses' AND column_name = 'owner_user_id') THEN
        ALTER TABLE team_licenses ADD COLUMN owner_user_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_licenses' AND column_name = 'seats') THEN
        ALTER TABLE team_licenses ADD COLUMN seats INT NOT NULL DEFAULT 5;
    END IF;
END $$;

-- 2. Align Purchases Table (Safely)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS plan_type TEXT; -- 'individual' | 'team'
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_code TEXT; -- 'base', 'team_5'...
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount_cents INT; -- Prezzo in centesimi
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT; -- Unicità
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS team_license_id UUID REFERENCES team_licenses(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS seats INT; -- Per ridondanza e query veloci

-- 3. Indexes & Constraints (Non-blocking)

-- Idempotenza su paypal_capture_id (solo se non esiste)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchases_paypal_capture_id_key') THEN
    ALTER TABLE purchases ADD CONSTRAINT purchases_paypal_capture_id_key UNIQUE (paypal_capture_id);
  END IF;
END $$;

-- Unicità Membri Attivi (Core Business Logic)
DROP INDEX IF EXISTS uniq_team_members_active;
CREATE UNIQUE INDEX uniq_team_members_active
    ON team_members(team_license_id, user_id)
    WHERE removed_at IS NULL;

-- 4. RLS Policies (Idempotent Apply)
ALTER TABLE team_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view own licenses" ON team_licenses;
CREATE POLICY "Owners can view own licenses" ON team_licenses
    FOR SELECT USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Owners can view team members" ON team_members;
CREATE POLICY "Owners can view team members" ON team_members
    FOR SELECT USING (
        team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Members can view own membership" ON team_members;
CREATE POLICY "Members can view own membership" ON team_members
    FOR SELECT USING (auth.uid() = user_id);

-- 5. Helper Function: add_team_member
CREATE OR REPLACE FUNCTION add_team_member(p_team_license_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_seats INT;
  v_count INT;
  v_owner UUID;
BEGIN
  SELECT seats, owner_user_id INTO v_seats, v_owner
  FROM team_licenses WHERE id = p_team_license_id;

  IF v_seats IS NULL THEN RAISE EXCEPTION 'Licenza non trovata'; END IF;
  IF v_owner != auth.uid() THEN RAISE EXCEPTION 'Non autorizzato'; END IF;

  SELECT COUNT(*) INTO v_count
  FROM team_members
  WHERE team_license_id = p_team_license_id AND removed_at IS NULL;

  IF v_count >= v_seats THEN
    RAISE EXCEPTION 'Seats limit reached (% seats)', v_seats;
  END IF;

  INSERT INTO team_members(team_license_id, user_id)
  VALUES (p_team_license_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
