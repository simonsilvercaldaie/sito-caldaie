-- Migration: Add Fatture in Cloud invoice tracking
-- Safe to run multiple times (IF NOT EXISTS)
-- This adds a column to track the FIC invoice ID for each purchase

-- Add fic_invoice_id column to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS fic_invoice_id integer;

-- Add a comment for documentation
COMMENT ON COLUMN purchases.fic_invoice_id IS 'Fatture in Cloud invoice ID (from API v2). NULL if no invoice was created (e.g. private customer or FIC disabled).';

-- Optional: index for quick lookup
CREATE INDEX IF NOT EXISTS idx_purchases_fic_invoice_id 
ON purchases(fic_invoice_id) 
WHERE fic_invoice_id IS NOT NULL;
