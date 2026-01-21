-- LIFETIME LICENSES FINAL MIGRATION (STRICT)
-- Esegui questo script nel Supabase SQL Editor.

-- 1. Create Team Tables (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS team_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id),
    seats INT NOT NULL CHECK (seats IN (5, 10, 25)),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_license_id UUID NOT NULL REFERENCES team_licenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    removed_at TIMESTAMPTZ
);

-- 2. Align Purchases Table (Safely ADD ONLY)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS plan_type TEXT; -- 'individual' | 'team'
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS product_code TEXT; 
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS amount_cents INT; 
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paypal_capture_id TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS team_license_id UUID REFERENCES team_licenses(id);
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS seats INT;

-- 3. Constraints (Idempotent)

-- CHECK Constraints
DO $$
BEGIN
    -- Check plan_type
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchases_plan_type_check') THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_plan_type_check 
        CHECK (plan_type IN ('individual', 'team'));
    END IF;

    -- Check product_code
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchases_product_code_check') THEN
        ALTER TABLE purchases ADD CONSTRAINT purchases_product_code_check 
        CHECK (product_code IN (
            'base', 'intermediate', 'advanced', 'complete',
            'team_5', 'team_10', 'team_25'
        ));
    END IF;
END $$;

-- Indexes (If Not Exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_paypal_capture_id
    ON purchases(paypal_capture_id)
    WHERE paypal_capture_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_team_members_active
    ON team_members(team_license_id, user_id)
    WHERE removed_at IS NULL;

-- 4. RLS (Security)
ALTER TABLE team_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Idempotent Policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Owner view licenses" ON team_licenses;
    CREATE POLICY "Owner view licenses" ON team_licenses
        FOR SELECT USING (auth.uid() = owner_user_id);

    DROP POLICY IF EXISTS "Owner view members" ON team_members;
    CREATE POLICY "Owner view members" ON team_members
        FOR SELECT USING (
            team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = auth.uid())
        );

    DROP POLICY IF EXISTS "Member view self" ON team_members;
    CREATE POLICY "Member view self" ON team_members
        FOR SELECT USING (auth.uid() = user_id);
END $$;
