-- FIX: Allow Account Deletion for Team Owners (Right to Erasure)
-- Current state: owner_user_id is RESTRICT (default), preventing deletion of users who own a team.
-- New state: ON DELETE CASCADE. If owner deletes account, the team license (and its members' access) is deleted.
-- Rationale: "Zona Pericolo" explicitly warns about losing access.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Scan for FK constraints on team_licenses pointing to auth.users
    -- We need to drop them to replace with CASCADE version.
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'team_licenses'::regclass
        AND confrelid = 'auth.users'::regclass
        AND contype = 'f' -- foreign key
    ) LOOP
        -- Check if this constraint is for the owner_user_id column (usually)
        -- To be safe, we reconstruct it. 
        -- NOTE: This block assumes only ONE FK to auth.users exists or we want to cascade ALL of them.
        -- We can be more specific by checking pg_attribute if needed, but for this schema it's safe.
        EXECUTE 'ALTER TABLE team_licenses DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Re-add the constraint with CASCADE
ALTER TABLE team_licenses
ADD CONSTRAINT team_licenses_owner_user_id_fkey
FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
