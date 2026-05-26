-- Migration: Add snapshot_province and snapshot_pec to purchases table
-- These columns store a snapshot of billing data at purchase time for audit trail
-- Date: 2026-05-26

-- Add snapshot_province column
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS snapshot_province TEXT;

-- Add snapshot_pec column  
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS snapshot_pec TEXT;

-- Backfill existing purchases with current billing data
UPDATE purchases p
SET 
    snapshot_province = bp.province,
    snapshot_pec = bp.pec
FROM billing_profiles bp
WHERE p.user_id = bp.user_id
  AND p.snapshot_province IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN purchases.snapshot_province IS 'Province code (2 letters, e.g. FI) at time of purchase';
COMMENT ON COLUMN purchases.snapshot_pec IS 'PEC email address at time of purchase';
