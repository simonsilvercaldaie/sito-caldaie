-- HARDENED BACKFILL MIGRATION: Sync user_metadata to billing_profiles
-- Strategy: Insert into billing_profiles if not exists.
-- Idempotency: ON CONFLICT DO NOTHING ensures safe re-run.

INSERT INTO billing_profiles (
    user_id,
    customer_type,
    first_name,
    last_name,
    company_name,
    vat_number,
    sdi_code,
    address,
    city,
    postal_code,
    country,
    fiscal_code
)
SELECT 
    u.id as user_id,
    COALESCE(u.raw_user_meta_data->>'customer_type', 'private') as customer_type,
    COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 1), 'Utente') as first_name,
    COALESCE(u.raw_user_meta_data->>'last_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 2), '') as last_name,
    u.raw_user_meta_data->>'company_name',
    u.raw_user_meta_data->>'piva', 
    COALESCE(u.raw_user_meta_data->>'sdi', u.raw_user_meta_data->>'pec'),
    COALESCE(u.raw_user_meta_data->>'address', 'Da completare'),
    COALESCE(u.raw_user_meta_data->>'city', 'Da completare'),
    COALESCE(u.raw_user_meta_data->>'cap', '00000'),
    'IT',
    u.raw_user_meta_data->>'cf'
FROM auth.users u
WHERE u.raw_user_meta_data->>'address' IS NOT NULL -- filter useful data
ON CONFLICT (user_id) DO NOTHING; -- Safe idempotency
