CREATE TABLE IF NOT EXISTS debug_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now(), message text, data jsonb); 
