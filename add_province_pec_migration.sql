-- ============================================================
-- MIGRATION: Aggiunta campi Provincia e PEC a billing_profiles
-- Data: 2026-04-13
-- ============================================================

-- 1. Aggiunge colonna Provincia (sigla 2 lettere, es. "BS", "MI")
ALTER TABLE billing_profiles
ADD COLUMN IF NOT EXISTS province TEXT;

-- 2. Aggiunge colonna PEC (separata dal codice SDI)
ALTER TABLE billing_profiles
ADD COLUMN IF NOT EXISTS pec TEXT;

-- 3. Constraint: provincia deve essere 2 caratteri uppercase
ALTER TABLE billing_profiles
ADD CONSTRAINT chk_province_format
CHECK (province IS NULL OR province ~ '^[A-Z]{2}$');

-- 4. Constraint: PEC deve essere formato email
ALTER TABLE billing_profiles
ADD CONSTRAINT chk_pec_format
CHECK (pec IS NULL OR pec ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- NOTA: Esegui questa migration su Supabase SQL Editor
-- Dopo l'esecuzione, il form potrà salvare provincia e PEC separatamente
