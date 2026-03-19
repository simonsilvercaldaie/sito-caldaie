-- ============================================
-- RESET ACQUISTI TEST per simonsilvercaldaie@gmail.com
-- Incolla in Supabase SQL Editor e clicca RUN
-- ============================================

-- 1. Trova l'user_id dell'admin
DO $$
DECLARE
    admin_uid UUID;
BEGIN
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'simonsilvercaldaie@gmail.com';

    IF admin_uid IS NULL THEN
        RAISE NOTICE 'Utente non trovato!';
        RETURN;
    END IF;

    RAISE NOTICE 'User ID trovato: %', admin_uid;

    -- 2. Rimuovi inviti team
    DELETE FROM team_invitations
    WHERE team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = admin_uid);

    -- 3. Rimuovi membri team
    DELETE FROM team_members
    WHERE team_license_id IN (SELECT id FROM team_licenses WHERE owner_user_id = admin_uid);

    -- 4. Rimuovi licenze team
    DELETE FROM team_licenses WHERE owner_user_id = admin_uid;

    -- 5. Rimuovi tutti gli acquisti
    DELETE FROM purchases WHERE user_id = admin_uid;

    -- 6. Reset TOS acceptance (opzionale)
    -- DELETE FROM tos_acceptances WHERE user_id = admin_uid;

    RAISE NOTICE 'Reset completato! Account pronto per nuovi test.';
END $$;
