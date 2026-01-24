-- LIVE USERS PRESENCE TABLE
-- Executing this ensures the table exists even if the user made a mistake in previous manual steps.

create table if not exists user_presence (
  user_id uuid references auth.users(id) on delete cascade primary key,
  last_seen_at timestamptz default now()
);

-- Index for performance on range queries
create index if not exists user_presence_last_seen_at_idx on user_presence(last_seen_at);

-- RLS: Only service role can write (handled by API), but maybe read is needed?
-- The prompt said "Non usare RLS per user_presence: scrivere con service role".
-- So we can disable RLS or just not add policies (default deny).
alter table user_presence enable row level security;

-- If we want admin client to read it directly vs API, we'd need policy.
-- But we use /api/admin/route.ts which uses Service Role.
-- So no policies needed for now.
