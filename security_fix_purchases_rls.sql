-- SECURITY MIGRATION: RLS ON PURCHASES
-- Objective: Protect purchase data from unauthorized access.
-- Strategy: 
-- 1. Enable RLS.
-- 2. Allow Users to SELECT their own rows.
-- 3. DENY all other operations (INSERT/UPDATE/DELETE) to Users.
-- 4. Service Role (Server) maintains full access automatically (Bypass RLS).

BEGIN;

-- 1. Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to be clean (IF EXISTS)
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete own purchases" ON purchases;

-- 3. Create SELECT Policy (Strict Isolation)
CREATE POLICY "Users can view own purchases" 
ON purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Do NOT create INSERT/UPDATE/DELETE policies.
-- This ensures that legitimate users CANNOT create fake purchases via client-side libraries.
-- Purchases must go through the /api/complete-purchase endpoint (Service Role).

COMMIT;
