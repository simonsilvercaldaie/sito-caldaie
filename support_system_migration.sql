-- SUPPORT SYSTEM MIGRATION
-- 1. Create Tickets Table
create table if not exists tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'pending')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create Ticket Messages Table
create table if not exists ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references tickets(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete set null, -- Null if system message or weird deletion
  message text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table tickets enable row level security;
alter table ticket_messages enable row level security;

-- 4. RLS Policies for Tickets

-- Users see their own tickets
create policy "Users can view own tickets"
  on tickets for select
  using (auth.uid() = user_id);

-- Users can create tickets
create policy "Users can insert own tickets"
  on tickets for insert
  with check (auth.uid() = user_id);

-- Admins can view all tickets (using email check hack or separate admin role if available)
-- NOTE: For simplicity, we might strictly rely on service role in API for admin actions, 
-- but if we want client-side admin, we need a policy. 
-- Since we use 'app/api/admin' which uses SERVICE ROLE, we technically don't need Admin RLS for the admin panel parts if they go through that API.
-- BUT user dashboard uses client-side? No, we will likely use API routes for everything to be safe.
-- Let's keep strict RLS: User can only see theirs. Admin actions via API.

-- 5. RLS Policies for Messages

-- Users see messages of their tickets
create policy "Users can view messages of own tickets"
  on ticket_messages for select
  using (
    exists (
      select 1 from tickets
      where tickets.id = ticket_messages.ticket_id
      and tickets.user_id = auth.uid()
    )
  );

-- Users can insert messages to their own open tickets
create policy "Users can insert messages to own tickets"
  on ticket_messages for insert
  with check (
    exists (
      select 1 from tickets
      where tickets.id = ticket_messages.ticket_id
      and tickets.user_id = auth.uid()
    )
  );

-- 6. Indexes for performance
create index if not exists tickets_user_id_idx on tickets(user_id);
create index if not exists ticket_messages_ticket_id_idx on ticket_messages(ticket_id);
