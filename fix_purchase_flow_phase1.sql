-- ============================================================
-- FASE 1 — MESSA IN SICUREZZA IMMEDIATA
-- Fix bug: PGRST204 'paypal_order_id' column missing
-- Data: 2026-03-26
-- ============================================================
-- ISTRUZIONI: Eseguire nel Supabase Dashboard > SQL Editor
-- Le operazioni sono tutte idempotenti e non distruttive.
-- Nessun dato esistente viene modificato o cancellato.
-- ============================================================

-- ============================================================
-- STEP 0: BACKUP — Snapshot dello schema attuale
-- ============================================================
-- Questa query NON modifica nulla. Mostra lo stato attuale.
-- Copiare/salvare il risultato PRIMA di procedere.

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'purchases'
ORDER BY ordinal_position;

-- Mostra anche i constraint attivi
SELECT 
    conname AS constraint_name,
    contype AS type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint 
WHERE conrelid = 'purchases'::regclass
ORDER BY conname;

-- Mostra gli indici attivi
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'purchases'
ORDER BY indexname;

-- Conta record esistenti (per verifica post-fix)
SELECT COUNT(*) AS total_purchases FROM purchases;


-- ============================================================
-- STEP 1: AGGIUNTA COLONNE MANCANTI
-- ============================================================
-- ADD COLUMN IF NOT EXISTS: se la colonna già esiste, non fa nulla.
-- Nessun effetto su record esistenti (i nuovi campi saranno NULL).

-- 1a. paypal_order_id — L'Order ID PayPal (diverso dal Capture ID)
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

-- 1b. validated_at — Timestamp di validazione (usato da replay-purchase)
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;


-- ============================================================
-- STEP 2: INDICE UNIQUE PER IDEMPOTENZA
-- ============================================================
-- Impedisce inserimenti duplicati per lo stesso Order PayPal.
-- IF NOT EXISTS: se l'indice esiste già, non fa nulla.
-- WHERE paypal_order_id IS NOT NULL: non blocca i record senza order ID.

CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_paypal_order_id 
ON purchases(paypal_order_id) 
WHERE paypal_order_id IS NOT NULL;


-- ============================================================
-- STEP 3: RELOAD SCHEMA CACHE PostgREST
-- ============================================================
-- Forza Supabase/PostgREST a rileggere lo schema del database.
-- Senza questo, anche con la colonna presente, PostgREST potrebbe
-- continuare a restituire PGRST204 fino al prossimo restart.

NOTIFY pgrst, 'reload schema';


-- ============================================================
-- STEP 4: VERIFICA POST-FIX
-- ============================================================
-- Eseguire queste query per confermare che tutto è in ordine.

-- 4a. Verifica colonne — paypal_order_id e validated_at devono apparire
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'purchases'
ORDER BY ordinal_position;

-- 4b. Verifica indici — idx_purchases_paypal_order_id deve apparire
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'purchases'
ORDER BY indexname;

-- 4c. Verifica che il conteggio record sia invariato
SELECT COUNT(*) AS total_purchases FROM purchases;

-- 4d. Conferma finale
SELECT 
    'Fix Phase 1 completato' AS status,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'paypal_order_id'
    ) AS paypal_order_id_exists,
    EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'validated_at'
    ) AS validated_at_exists,
    EXISTS(
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'purchases' AND indexname = 'idx_purchases_paypal_order_id'
    ) AS unique_index_exists;
