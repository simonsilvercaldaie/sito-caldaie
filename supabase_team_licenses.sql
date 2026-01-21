-- TEAM LICENSES MIGRATION
-- Da eseguire nel SQL Editor di Supabase

-- 1. Create tables first to handle references
CREATE TABLE IF NOT EXISTS team_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    seats INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ,
    billing_cycle TEXT, -- 'monthly' | 'yearly'
    status TEXT DEFAULT 'active', -- 'active' | 'expired' | 'suspended'
    owner_user_id UUID REFERENCES auth.users(id),
    last_payment_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID REFERENCES team_licenses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    removed_at TIMESTAMPTZ
);

-- 2. Update purchases table
-- Aggiungi colonne, gestendo il backfill per 'plan_type' e 'seats'
ALTER TABLE purchases 
    ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'individual' NOT NULL,
    ADD COLUMN IF NOT EXISTS seats INT DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS billing_cycle TEXT, 
    ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS team_license_id UUID REFERENCES team_licenses(id),
    ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;

-- Rimuovi default per strictness futura (i record esistenti hanno 'individual')
ALTER TABLE purchases ALTER COLUMN plan_type DROP DEFAULT;

-- Constraints
ALTER TABLE purchases 
    ADD CONSTRAINT purchases_paypal_capture_id_key UNIQUE (paypal_capture_id);

-- 3. Security & Indexes
ALTER TABLE team_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Index per unicità membri attivi (gestisce storico rimozioni)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_team_members_active
    ON team_members(team_license_id, user_id)
    WHERE removed_at IS NULL;

-- Policies
CREATE POLICY "Owners can view own licenses" ON team_licenses
    FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Owners can view team members" ON team_members
    FOR SELECT USING (
        team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = auth.uid())
    );
    
-- Members allow read if they are part of the team (opzionale, per dashboard utente)
CREATE POLICY "Members can view own membership" ON team_members
    FOR SELECT USING (auth.uid() = user_id);

-- 4. RPC Function for Seat Enforcement
CREATE OR REPLACE FUNCTION add_team_member(p_team_license_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_seats INT;
  v_count INT;
  v_owner UUID;
BEGIN
  -- Verifica licenza e ownership/validità
  SELECT seats, owner_user_id INTO v_seats, v_owner
  FROM team_licenses 
  WHERE id = p_team_license_id AND status = 'active';

  IF v_seats IS NULL THEN 
    RAISE EXCEPTION 'Licenza non valida o non attiva'; 
  END IF;
  
  -- Check permission (solo owner può aggiungere, o logica custom)
  IF v_owner != auth.uid() THEN
    RAISE EXCEPTION 'Non autorizzato';
  END IF;

  -- Conta membri attivi
  SELECT COUNT(*) INTO v_count
  FROM team_members
  WHERE team_license_id = p_team_license_id AND removed_at IS NULL;

  IF v_count >= v_seats THEN
    RAISE EXCEPTION 'Numero massimo di utenti raggiunto (%/% seats)', v_count, v_seats;
  END IF;

  -- Inserisci
  INSERT INTO team_members(team_license_id, user_id)
  VALUES (p_team_license_id, p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
