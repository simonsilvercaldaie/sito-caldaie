-- ============================================================
-- FIX GOOGLE REGISTRATION BUG
-- ============================================================
-- Problem: The trigger `ensure_google_only` likely blocks INSERTs if `encrypted_password` is an empty string (not NULL).
-- Solution: Relax the check to allow NULL or Empty String, ensuring only 'real' passwords are blocked.
--           Also improve `handle_new_user` robustness.

-- 1. FIX ENSURE_GOOGLE_ONLY
CREATE OR REPLACE FUNCTION verify_google_only()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Allow NULL, Allow Empty String. Block only if length > 0.
    IF NEW.encrypted_password IS NOT NULL AND LENGTH(NEW.encrypted_password) > 0 THEN
        RAISE EXCEPTION 'Email/Password authentication is disabled. Please use Google.';
    END IF;
    RETURN NEW;
END;
$$;

-- PROACTIVELY DROP AND RECREATE TRIGGER TO ENSURE UPDATED FUNCTION IS USED
DROP TRIGGER IF EXISTS ensure_google_only ON auth.users;
CREATE TRIGGER ensure_google_only
    BEFORE INSERT OR UPDATE OF encrypted_password ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION verify_google_only();


-- 2. FIX HANDLE_NEW_USER (Profile Creation)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    -- Safety check: valid email is required for our profile
    IF NEW.email IS NULL THEN
        RAISE NOTICE 'Skipping profile creation for user % because email is null', NEW.id;
        RETURN NEW;
    END IF;

    INSERT INTO profiles (id, email, full_name, profile_completed, last_device_reset_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        FALSE, 
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        -- If profile exists but data is missing (race condition), ensure sync
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
        
    RETURN NEW;
END;
$$;

-- ENSURE TRIGGER IS ACTIVE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. ENSURE RLS DOES NOT BLOCK (Just in case)
-- (Triggers are SECURITY DEFINER so this is redundant for triggers, but good for Client access)
-- Note: 'profiles' usually has 'Users can view own profile' and 'Users can update own profile'.
