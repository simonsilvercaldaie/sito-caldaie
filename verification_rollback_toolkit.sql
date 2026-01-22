-- ============================================================
-- 1. VERIFICA PROFILES CONSTRAINTS
-- ============================================================
-- Analisi della tabella 'profiles' basata sulla migrazione full_hardening_migration.sql:
-- id: PRIMARY KEY (NOT NULL implicito) - Fornito da auth.users
-- email: NOT NULL - Fornito da auth.users (gestito nel fix se NULL)
-- full_name: NULLABLE - Nessun problema
-- profile_completed: DEFAULT FALSE (NOT NULL) - Default presente, nessun problema
-- last_device_reset_at: DEFAULT now() - Default presente, nessun problema
-- created_at: DEFAULT now() - Default presente, nessun problema
-- updated_at: DEFAULT now() - Default presente, nessun problema

-- CONCLUSIONE: La struttura è sicura per l'insert automatico nel trigger handle_new_user.


-- ============================================================
-- 2. QUERY DI VERIFICA (Check creazione utente)
-- ============================================================
-- Esegui questa query dopo aver tentato la registrazione con Google.
-- Dovresti vedere una riga con data recentissima (ultimi 5 min).

SELECT 
    au.id AS user_id,
    au.email,
    au.created_at AS auth_created_at,
    p.created_at AS profile_created_at,
    p.profile_completed,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Profile OK' 
        ELSE '❌ Missing Profile' 
    END AS status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 5;


-- ============================================================
-- 3. ROLLBACK (Ripristino stato precedente)
-- ============================================================
-- Esegui questo blocco SOLO se devi annullare le modifiche e tornare all'errore precedente.

-- Rollback trigger verify_google_only (Versione rigida)
CREATE OR REPLACE FUNCTION verify_google_only()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Vecchia logica: Blocca se encrypted_password non è NULL (anche stringa vuota bloccava)
    IF NEW.encrypted_password IS NOT NULL THEN
        RAISE EXCEPTION 'Email/Password authentication is disabled. Please use Google.';
    END IF;
    RETURN NEW;
END;
$$;

-- Rollback trigger handle_new_user (Versione base senza check NULL)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, profile_completed, last_device_reset_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', FALSE, now())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
