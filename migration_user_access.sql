-- ============================================================
-- MIGRATION: user_access TABLE + BACKFILL
-- Eseguire nel Supabase SQL Editor DOPO il deploy del codice.
-- Questa migrazione è IDEMPOTENTE (safe to run multiple times).
-- ============================================================

-- 1. CREATE TABLE user_access
CREATE TABLE IF NOT EXISTS user_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL CHECK (access_level IN ('base', 'intermedio', 'avanzato')),
    source TEXT NOT NULL DEFAULT 'purchase' CHECK (source IN ('purchase', 'team', 'admin', 'upgrade')),
    purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
    team_license_id UUID REFERENCES team_licenses(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, access_level)
);

-- 2. ENABLE RLS
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users view own access" ON user_access;
    CREATE POLICY "Users view own access" ON user_access
        FOR SELECT USING (auth.uid() = user_id);
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_user_level ON user_access(user_id, access_level);

-- ============================================================
-- 3. BACKFILL: Migrate existing purchases → user_access
-- ============================================================

-- 3a. Individual purchases: base
INSERT INTO user_access (user_id, access_level, source, purchase_id)
SELECT p.user_id, 'base', 'purchase', p.id
FROM purchases p
WHERE p.product_code = 'base'
  AND p.plan_type = 'individual'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3b. Individual purchases: intermediate → intermedio
INSERT INTO user_access (user_id, access_level, source, purchase_id)
SELECT p.user_id, 'intermedio', 'purchase', p.id
FROM purchases p
WHERE p.product_code = 'intermediate'
  AND p.plan_type = 'individual'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3c. Individual purchases: advanced → avanzato
INSERT INTO user_access (user_id, access_level, source, purchase_id)
SELECT p.user_id, 'avanzato', 'purchase', p.id
FROM purchases p
WHERE p.product_code = 'advanced'
  AND p.plan_type = 'individual'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3d. Complete/bundle purchases → all 3 levels
INSERT INTO user_access (user_id, access_level, source, purchase_id)
SELECT p.user_id, level.val, 'purchase', p.id
FROM purchases p
CROSS JOIN (VALUES ('base'), ('intermedio'), ('avanzato')) AS level(val)
WHERE p.product_code IN ('complete', 'complete_bundle')
  AND p.plan_type = 'individual'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3e. Team purchases → all 3 levels for the OWNER
INSERT INTO user_access (user_id, access_level, source, team_license_id)
SELECT tl.owner_user_id, level.val, 'team', tl.id
FROM team_licenses tl
CROSS JOIN (VALUES ('base'), ('intermedio'), ('avanzato')) AS level(val)
WHERE tl.status = 'active'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3f. Team members → all 3 levels for each ACTIVE member
INSERT INTO user_access (user_id, access_level, source, team_license_id)
SELECT tm.user_id, level.val, 'team', tm.team_license_id
FROM team_members tm
JOIN team_licenses tl ON tl.id = tm.team_license_id
CROSS JOIN (VALUES ('base'), ('intermedio'), ('avanzato')) AS level(val)
WHERE tm.removed_at IS NULL
  AND tl.status = 'active'
ON CONFLICT (user_id, access_level) DO NOTHING;

-- 3g. Admin manual grants (product_code like 'corso-base' etc — legacy bug)
-- These may have failed due to CHECK constraint, but handle them just in case
INSERT INTO user_access (user_id, access_level, source, purchase_id)
SELECT p.user_id, 
    CASE 
        WHEN p.product_code ILIKE '%base%' THEN 'base'
        WHEN p.product_code ILIKE '%intermedi%' THEN 'intermedio'
        WHEN p.product_code ILIKE '%avanzat%' OR p.product_code ILIKE '%advanced%' THEN 'avanzato'
    END,
    'admin', p.id
FROM purchases p
WHERE p.product_code ILIKE 'corso-%'
  AND CASE 
        WHEN p.product_code ILIKE '%base%' THEN 'base'
        WHEN p.product_code ILIKE '%intermedi%' THEN 'intermedio'
        WHEN p.product_code ILIKE '%avanzat%' OR p.product_code ILIKE '%advanced%' THEN 'avanzato'
      END IS NOT NULL
ON CONFLICT (user_id, access_level) DO NOTHING;

-- ============================================================
-- 4. VERIFICATION
-- ============================================================
SELECT 
    'Migration completed' AS status,
    (SELECT COUNT(*) FROM user_access) AS total_access_records,
    (SELECT COUNT(DISTINCT user_id) FROM user_access) AS unique_users_with_access,
    (SELECT COUNT(*) FROM user_access WHERE access_level = 'base') AS base_count,
    (SELECT COUNT(*) FROM user_access WHERE access_level = 'intermedio') AS intermedio_count,
    (SELECT COUNT(*) FROM user_access WHERE access_level = 'avanzato') AS avanzato_count;
