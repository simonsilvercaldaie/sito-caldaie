-- FORENSIC CLEANUP & STABILIZATION
-- 1. Remove "Materiali Didattici" related tables
DROP TABLE IF EXISTS educational_resources CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS educational_profiles CASCADE;

-- 2. Normalize Purchases Table
-- Strategy: course_id is deprecated for individual licenses. Truth is product_code.
UPDATE purchases 
SET course_id = NULL 
WHERE plan_type = 'individual';

-- 3. Add constraint to prevent regression (if possible without blocking team logic)
-- We add a comment to the column as a warning for future developers
COMMENT ON COLUMN purchases.course_id IS 'DEPRECATED for individual plans. MUST be NULL. Only used for specific legacy or team overrides if needed.';
