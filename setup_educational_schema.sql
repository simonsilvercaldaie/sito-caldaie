-- ============================================
-- SETUP EDUCATIONAL SCHEMA
-- Version: 2026-01-19-v1
-- ============================================

-- 1. ENUMS
-- ============================================
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'resource_type') then
    create type resource_type as enum ('scheda', 'checklist', 'quiz', 'caso_studio');
  end if;
  
  if not exists (select 1 from pg_type where typname = 'progress_status') then
    create type progress_status as enum ('locked', 'unlocked', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'course_level') then
    create type course_level as enum ('base', 'intermedio', 'avanzato');
  end if;
end $$;

-- 2. TABLE: EDUCATIONAL RESOURCES (Assets)
-- ============================================
create table if not exists educational_resources (
  id uuid default gen_random_uuid() primary key,
  video_id varchar(10) not null,             -- es. '01', '14', '27'
  type resource_type not null,               -- Tipo risorsa
  level course_level not null default 'base', -- Base / Intermedio / Avanzato
  title varchar(255) not null,               -- Titolo umano
  content jsonb not null,                    -- Contenuto JSON strutturato
  version int default 1,                     -- Versioning
  is_active boolean default true,            -- Soft delete
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Unicità: Un video può avere solo UNA risorsa attiva per tipo
  unique(video_id, type)
);

-- RLS: Public Read (authenticated)
alter table educational_resources enable row level security;

create policy "Authenticated Users can Read Resources"
  on educational_resources for select
  to authenticated
  using (true);

-- Admin Write (Assuming service role or specific admin users manage this)
-- For now we only define SELECT for users.

-- 3. TABLE: EDUCATIONAL PROFILES (Gamification State)
-- ============================================
-- Keeps track of global user state like unlocked levels or total score
create table if not exists educational_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  unlocked_levels course_level[] default array['base']::course_level[], -- Levels the user can access
  total_score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table educational_profiles enable row level security;

create policy "Users can read own profile"
  on educational_profiles for select
  to authenticated
  using (auth.uid() = user_id);
  
-- Trigger to create profile on signup is handled by app logic or separate trigger
-- We allow insert/update for self (or restrict update to server functions)
create policy "Users can update own profile"
  on educational_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
  
create policy "Users can insert own profile"
  on educational_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);


-- 4. TABLE: USER PROGRESS (Granular Tracking)
-- ============================================
create table if not exists user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_id uuid references educational_resources(id) on delete cascade not null,
  
  status progress_status default 'locked',
  
  state_data jsonb default '{}'::jsonb, -- Answers, checkboxes state
  score int,                            -- 0-100 (for quizzes)
  
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(user_id, resource_id)
);

alter table user_progress enable row level security;

create policy "Users can read own progress"
  on user_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on user_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_progress for update
  to authenticated
  using (auth.uid() = user_id);

-- 5. INDEXES for Performance
-- ============================================
create index if not exists idx_resources_video_type on educational_resources(video_id, type);
create index if not exists idx_progress_user_resource on user_progress(user_id, resource_id);
