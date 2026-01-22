-- ============================================================
-- SIMONSILVERCALDAIE.IT - RLS SECURITY AUDIT
-- ============================================================
-- ISTRUZIONI:
-- 1. Esegui le query nella sezione 1 per ottenere gli UUID degli utenti reali
-- 2. Sostituisci i placeholder USER_A_ID e USER_B_ID con gli UUID ottenuti
-- 3. Esegui ogni sezione di test e annota PASS/FAIL
-- ============================================================

-- ============================================================
-- SEZIONE 1: OTTIENI GLI UUID DEGLI UTENTI DI TEST
-- ============================================================
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('simonsilvercaldaie@gmail.com', 'simonsilvermotocross@gmail.com')
ORDER BY email;

-- COPIA GLI UUID QUI SOTTO (dopo aver eseguito la query sopra):
-- USER_A_ID (simonsilvercaldaie): ________________________________
-- USER_B_ID (simonsilvermotocross): ______________________________


-- ============================================================
-- SEZIONE 2: VERIFICA RLS ABILITATO SU TUTTE LE TABELLE
-- ============================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 
    'purchases', 
    'licenses', 
    'billing_profiles',
    'team_licenses', 
    'team_members', 
    'team_invitations',
    'educational_resources',
    'user_progress',
    'active_sessions',
    'trusted_devices',
    'security_events'
)
ORDER BY tablename;


-- ============================================================
-- SEZIONE 3: LISTA TUTTE LE POLICY RLS ATTIVE
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ============================================================
-- SEZIONE 4: TEST RLS - PROFILES
-- ============================================================
-- Sostituisci USER_A_ID e USER_B_ID con gli UUID reali

-- TEST 4.1: User A può vedere SOLO il proprio profilo
-- (Esegui come User A via Supabase client o impersonation)
-- EXPECTED: 1 riga (solo il proprio profilo)
-- SELECT * FROM profiles;

-- TEST 4.2: User A NON può vedere profilo di User B
-- EXPECTED: 0 righe
-- SELECT * FROM profiles WHERE id = 'USER_B_ID';

-- TEST 4.3: Anon NON può vedere nessun profilo
-- EXPECTED: 0 righe (o errore RLS)
-- SET request.jwt.claims = '{"role": "anon"}';
-- SELECT * FROM profiles;


-- ============================================================
-- SEZIONE 5: TEST RLS - PURCHASES
-- ============================================================
-- Verifica che esista la tabella e le policy
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'purchases'
) as purchases_table_exists;

-- Lista policy su purchases
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'purchases';


-- ============================================================
-- SEZIONE 6: TEST RLS - BILLING_PROFILES
-- ============================================================
-- TEST 6.1: User può vedere solo proprio billing
-- TEST 6.2: User può inserire solo proprio billing
-- TEST 6.3: User può aggiornare solo proprio billing
-- TEST 6.4: Anon non può fare nulla

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'billing_profiles';


-- ============================================================
-- SEZIONE 7: TEST RLS - TEAM_LICENSES
-- ============================================================
-- TEST 7.1: Owner vede solo le proprie licenze team
-- TEST 7.2: Non-owner non vede licenze altrui

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'team_licenses';


-- ============================================================
-- SEZIONE 8: TEST RLS - TEAM_MEMBERS
-- ============================================================
-- TEST 8.1: Owner vede i membri del proprio team
-- TEST 8.2: Member vede solo la propria membership
-- TEST 8.3: Non-owner/non-member non vede nulla

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'team_members';


-- ============================================================
-- SEZIONE 9: TEST RLS - EDUCATIONAL_RESOURCES
-- ============================================================
-- Verifica esistenza tabella
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'educational_resources'
) as educational_resources_exists;

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'educational_resources';


-- ============================================================
-- SEZIONE 10: TEST RLS - USER_PROGRESS
-- ============================================================
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_progress'
) as user_progress_exists;

SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_progress';


-- ============================================================
-- SEZIONE 11: SECURITY_EVENTS (ADMIN ONLY)
-- ============================================================
-- Questa tabella dovrebbe NON avere policy pubbliche
-- Solo service_role deve poter accedere
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'security_events';
-- EXPECTED: 0 righe (nessuna policy pubblica = solo service_role)


-- ============================================================
-- SEZIONE 12: RIEPILOGO VULNERABILITÀ
-- ============================================================
-- Tabelle con RLS DISABILITATO (CRITICO!)
SELECT tablename, 'RLS DISABLED - CRITICAL!' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false
AND tablename IN (
    'profiles', 'purchases', 'licenses', 'billing_profiles',
    'team_licenses', 'team_members', 'team_invitations',
    'educational_resources', 'user_progress', 'active_sessions',
    'trusted_devices', 'security_events'
);

-- Tabelle SENZA policy (possibile problema)
SELECT t.tablename, 'NO POLICIES FOUND' as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
AND t.rowsecurity = true
AND p.policyname IS NULL
AND t.tablename IN (
    'profiles', 'purchases', 'licenses', 'billing_profiles',
    'team_licenses', 'team_members', 'team_invitations',
    'educational_resources', 'user_progress'
);
