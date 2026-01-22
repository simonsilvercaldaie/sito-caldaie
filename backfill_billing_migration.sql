-- BACKFILL MIGRATION: Sync user_metadata to billing_profiles
-- Strategy: Insert into billing_profiles if not exists, using data from valid profiles/metadata
-- This is a best-effort sync for existing users.

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
    -- Attempt to split full_name if first/last not present (simplistic)
    COALESCE(u.raw_user_meta_data->>'first_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 1), 'Utente') as first_name,
    COALESCE(u.raw_user_meta_data->>'last_name', split_part(u.raw_user_meta_data->>'full_name', ' ', 2), '') as last_name,
    u.raw_user_meta_data->>'company_name',
    u.raw_user_meta_data->>'piva', -- map piva to vat_number
    COALESCE(u.raw_user_meta_data->>'sdi', u.raw_user_meta_data->>'pec'),
    COALESCE(u.raw_user_meta_data->>'address', 'Da complotare'),
    COALESCE(u.raw_user_meta_data->>'city', 'Da completare'),
    COALESCE(u.raw_user_meta_data->>'cap', '00000'),
    'IT',
    u.raw_user_meta_data->>'cf'
FROM auth.users u
LEFT JOIN billing_profiles bp ON u.id = bp.user_id
WHERE bp.id IS NULL -- Only for users without a billing profile
  AND u.raw_user_meta_data->>'address' IS NOT NULL; -- Only if they have some data to sync

-- Ensure RLS allows upsert functionality (Users can insert own billing)
-- (Already exists in full_hardening_migration.sql but verifying idempotency is good practice)
-- "Users can insert own billing" ON billing_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
-- "Users can update own billing" ON billing_profiles FOR UPDATE USING (auth.uid() = user_id);
