-- Rimuove l'assegnazione automatica di last_device_reset_at alla creazione dell'utente

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    -- Safety check: valid email is required for our profile
    IF NEW.email IS NULL THEN
        RAISE NOTICE 'Skipping profile creation for user % because email is null', NEW.id;
        RETURN NEW;
    END IF;

    -- INSERISCE NULL come last_device_reset_at invece di now()
    INSERT INTO profiles (id, email, full_name, profile_completed, last_device_reset_at)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        FALSE, 
        NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
        
    RETURN NEW;
END;
$$;
