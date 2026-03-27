-- ============================================================
-- RECONCILIATION: Fix purchases without access grants
-- 
-- This function finds purchases in `purchases` table that have
-- no corresponding rows in `user_access` and grants the missing
-- access levels.
--
-- Run this periodically (e.g. daily cron, or manually from admin)
-- to catch edge cases where purchase insert succeeded but
-- grantAccessForProduct failed.
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent via ON CONFLICT DO NOTHING)
-- ============================================================

CREATE OR REPLACE FUNCTION reconcile_missing_access_grants()
RETURNS TABLE(
    user_id UUID,
    product_code TEXT,
    levels_granted TEXT[],
    purchase_id UUID
) AS $$
DECLARE
    rec RECORD;
    level_val TEXT;
    granted TEXT[];
    levels_for_product TEXT[];
BEGIN
    -- Find individual purchases that have NO corresponding user_access records
    FOR rec IN
        SELECT p.id AS purchase_id, p.user_id, p.product_code
        FROM purchases p
        WHERE p.plan_type IN ('individual')
          AND NOT EXISTS (
              SELECT 1 FROM user_access ua
              WHERE ua.purchase_id = p.id
          )
          AND p.product_code IS NOT NULL
    LOOP
        granted := ARRAY[]::TEXT[];
        
        -- Map product_code to access levels
        CASE rec.product_code
            WHEN 'base' THEN levels_for_product := ARRAY['base'];
            WHEN 'intermediate' THEN levels_for_product := ARRAY['intermedio'];
            WHEN 'advanced' THEN levels_for_product := ARRAY['avanzato'];
            WHEN 'complete', 'complete_bundle' THEN levels_for_product := ARRAY['base', 'intermedio', 'avanzato'];
            ELSE levels_for_product := ARRAY[]::TEXT[];
        END CASE;

        -- Insert missing access grants
        FOREACH level_val IN ARRAY levels_for_product LOOP
            INSERT INTO user_access (user_id, access_level, source, purchase_id)
            VALUES (rec.user_id, level_val, 'purchase', rec.purchase_id)
            ON CONFLICT (user_id, access_level) DO NOTHING;
            
            granted := array_append(granted, level_val);
        END LOOP;

        IF array_length(granted, 1) > 0 THEN
            user_id := rec.user_id;
            product_code := rec.product_code;
            levels_granted := granted;
            purchase_id := rec.purchase_id;
            RETURN NEXT;
        END IF;
    END LOOP;

    -- Also handle team purchases: team owner access via team_license_id
    FOR rec IN
        SELECT p.id AS purchase_id, p.user_id, p.product_code, p.team_license_id
        FROM purchases p
        WHERE p.plan_type = 'team'
          AND p.team_license_id IS NOT NULL
          AND p.product_code LIKE 'multi_%' OR p.product_code LIKE 'scuola_%'
          AND NOT EXISTS (
              SELECT 1 FROM user_access ua
              WHERE ua.user_id = p.user_id
                AND ua.team_license_id = p.team_license_id
          )
    LOOP
        granted := ARRAY[]::TEXT[];
        levels_for_product := ARRAY['base', 'intermedio', 'avanzato'];

        FOREACH level_val IN ARRAY levels_for_product LOOP
            INSERT INTO user_access (user_id, access_level, source, team_license_id)
            VALUES (rec.user_id, level_val, 'team', rec.team_license_id)
            ON CONFLICT (user_id, access_level) DO NOTHING;
            
            granted := array_append(granted, level_val);
        END LOOP;

        IF array_length(granted, 1) > 0 THEN
            user_id := rec.user_id;
            product_code := rec.product_code;
            levels_granted := granted;
            purchase_id := rec.purchase_id;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- USAGE:
-- Run from Supabase SQL Editor or via a cron job:
--   SELECT * FROM reconcile_missing_access_grants();
--
-- Returns one row per fixed purchase with:
--   user_id, product_code, levels_granted[], purchase_id
-- 
-- If empty result = no orphaned purchases found (all healthy)
-- ============================================================
