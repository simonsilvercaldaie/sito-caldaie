-- ============================================================
-- EMERGENCY FIX: DISABLE BLOCKING TRIGGER
-- ============================================================
-- Il trigger `ensure_google_only` sta bloccando TUTTI gli INSERT su auth.users,
-- inclusi quelli legittimi da Google OAuth.
--
-- SOLUZIONE TEMPORANEA: Disabilitare il trigger completamente
-- per permettere la registrazione di nuovi utenti.

-- STEP 1: DISABILITA IL TRIGGER (ESEGUI QUESTO SUBITO)
DROP TRIGGER IF EXISTS ensure_google_only ON auth.users;


-- ============================================================
-- DOPO IL TEST: SE FUNZIONA, RICREA IL TRIGGER CON LOGICA CORRETTA
-- ============================================================
-- Google OAuth non imposta MAI un password. Il campo encrypted_password
-- sarà NULL. Questo trigger deve SOLO bloccare tentativi di impostare
-- una password tramite signup email/password (che comunque è disabilitato
-- in Supabase Dashboard).

-- STEP 2: RICREA TRIGGER CON CHECK PIÙ PERMISSIVO (SOLO DOPO TEST OK)
CREATE OR REPLACE FUNCTION verify_google_only()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Per INSERT: permetti sempre (Google OAuth non imposta password)
    -- Per UPDATE: blocca solo se si sta tentando di AGGIUNGERE una password
    IF TG_OP = 'UPDATE' THEN
        -- Se prima era NULL e ora ha un valore, qualcuno sta cercando di impostare password
        IF OLD.encrypted_password IS NULL AND NEW.encrypted_password IS NOT NULL AND LENGTH(NEW.encrypted_password) > 0 THEN
            RAISE EXCEPTION 'Email/Password authentication is disabled. Please use Google.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_google_only
    BEFORE UPDATE OF encrypted_password ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION verify_google_only();

-- NOTA: Il trigger ora si attiva SOLO su UPDATE, non su INSERT.
-- Questo permette la creazione di nuovi utenti via Google OAuth,
-- ma blocca qualsiasi tentativo futuro di aggiungere una password.
