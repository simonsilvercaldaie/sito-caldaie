-- Script SQL per Supabase: tabella accettazioni ToS
-- Eseguire in Supabase Dashboard > SQL Editor
-- Versione: 2026-01-18-v1

-- ============================================
-- CREAZIONE TABELLA (prima installazione)
-- ============================================

CREATE TABLE IF NOT EXISTS tos_acceptances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tos_version TEXT NOT NULL DEFAULT '2026-01-18-v1',
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    
    CONSTRAINT unique_user_version UNIQUE (user_id, tos_version)
);

-- Abilita Row Level Security
ALTER TABLE tos_acceptances ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICY RLS - COPERTURA COMPLETA
-- ============================================

-- Policy INSERT: utenti possono inserire le proprie accettazioni
CREATE POLICY "Users can insert own acceptances"
ON tos_acceptances FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy SELECT: utenti possono leggere le proprie accettazioni
CREATE POLICY "Users can read own acceptances"
ON tos_acceptances FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy UPDATE: NEGATA - le accettazioni non possono essere modificate
-- Un utente NON può cambiare retroattivamente i dati di accettazione
CREATE POLICY "No update allowed"
ON tos_acceptances FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Policy DELETE: NEGATA - le accettazioni non possono essere cancellate
-- Un utente NON può cancellare la prova di aver accettato i ToS
CREATE POLICY "No delete allowed"
ON tos_acceptances FOR DELETE
TO authenticated
USING (false);

-- ============================================
-- INDICI
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tos_acceptances_user_id 
ON tos_acceptances(user_id);

CREATE INDEX IF NOT EXISTS idx_tos_acceptances_version 
ON tos_acceptances(tos_version);

-- ============================================
-- MIGRAZIONE (se tabella già esiste)
-- ============================================

-- Aggiorna default a nuova versione
ALTER TABLE tos_acceptances 
ALTER COLUMN tos_version SET DEFAULT '2026-01-18-v1';

-- ============================================
-- VERIFICA
-- ============================================

SELECT 
    'Tabella tos_acceptances configurata.' AS status,
    '2026-01-18-v1' AS default_version,
    'INSERT/SELECT: permessi, UPDATE/DELETE: negati' AS rls_rules;
