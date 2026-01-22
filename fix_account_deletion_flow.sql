-- FIX ACCOUNT DELETION FLOW (TEAM OWNERS)
-- Problem: Deleting a user who owns a team fails because of FK constraints in 'team_licenses' (owner_user_id) 
-- and 'purchases' (team_license_id).
--
-- Solution:
-- 1. team_licenses: ON DELETE CASCADE (If owner is deleted, team license is deleted).
-- 2. purchases: ON DELETE SET NULL (If team license is deleted, purchase record remains for accounting but loses license link).

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Modify team_licenses constraint (owner_user_id) -> CASCADE
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'team_licenses'::regclass
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f'
        -- We filter by column presence implicitly or relying on the single FK relationship usually found here
    ) LOOP
        -- Log and drop
        RAISE NOTICE 'Dropping constraint % on team_licenses', r.conname;
        EXECUTE 'ALTER TABLE team_licenses DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Add the new CASCADE constraint
    ALTER TABLE team_licenses
    ADD CONSTRAINT team_licenses_owner_user_id_fkey
    FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


    -- 2. Modify purchases constraint (team_license_id) -> SET NULL
    -- We need to find the constraint name first.
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'purchases'::regclass
        AND confrelid = 'team_licenses'::regclass
        AND contype = 'f'
    ) LOOP
        RAISE NOTICE 'Dropping constraint % on purchases', r.conname;
        EXECUTE 'ALTER TABLE purchases DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;

    -- Add the new SET NULL constraint
    ALTER TABLE purchases
    ADD CONSTRAINT purchases_team_license_id_fkey
    FOREIGN KEY (team_license_id) REFERENCES team_licenses(id) ON DELETE SET NULL;
    
    -- Note: team_members is already ON DELETE CASCADE in definition
    -- Note: team_invitations is already ON DELETE CASCADE in definition

END $$;
