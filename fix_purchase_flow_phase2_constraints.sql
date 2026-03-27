-- ============================================================
-- FASE 2 — Fix Constraint Obsoleti
-- Data: 2026-03-26
-- ============================================================
-- I CHECK constraint su product_code e plan_type sono troppo
-- restrittivi e non includono i codici usati dal codice attuale.
-- Questo potrebbe causare INSERT failures silenziosi.
-- ============================================================

-- STEP 1: Verifica constraint attuali (solo lettura)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass AND contype = 'c';

-- STEP 2: Rimuovi constraint product_code obsoleto
-- Il vecchio ammette solo: base, intermediate, advanced, complete, team_5, team_10, team_25
-- Mancano: complete_bundle, multi_5, multi_10, multi_25, scuola_10, upgrade_to_multi_*
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_product_code_check;

-- STEP 3: Rimuovi constraint plan_type troppo restrittivo
-- Il vecchio ammette solo: individual, team
-- Manca: team_upgrade (usato da upgrade-license)
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_plan_type_check;

-- STEP 4: Ricrea constraint con valori completi
ALTER TABLE purchases ADD CONSTRAINT purchases_product_code_check 
CHECK (product_code IN (
    'base', 'intermediate', 'advanced', 'complete', 'complete_bundle',
    'multi_5', 'multi_10', 'multi_25',
    'scuola_10',
    'upgrade_to_multi_5', 'upgrade_to_multi_10', 'upgrade_to_multi_25'
));

ALTER TABLE purchases ADD CONSTRAINT purchases_plan_type_check 
CHECK (plan_type IN ('individual', 'team', 'team_upgrade'));

-- STEP 5: Reload schema cache
NOTIFY pgrst, 'reload schema';

-- STEP 6: Verifica
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass AND contype = 'c';
