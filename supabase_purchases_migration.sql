-- Migrazione: Aggiunge paypal_order_id a purchases per idempotenza
-- Eseguire in Supabase Dashboard > SQL Editor

-- 1. Aggiungi colonna paypal_order_id
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

-- 2. Aggiungi vincolo UNIQUE per idempotenza
-- Se un ordine PayPal è già stato processato, impedisce duplicati
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_paypal_order_id 
ON purchases(paypal_order_id) 
WHERE paypal_order_id IS NOT NULL;

-- Verifica
SELECT 
    'Migrazione completata' AS status,
    'paypal_order_id aggiunto con UNIQUE index' AS note;
