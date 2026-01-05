-- 1. Create the 'videos' bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- 2. Enable RLS on objects
alter table storage.objects enable row level security;

-- 3. Policy: ALLOW UPLOAD for Authenticated Users (TEMPORARY for you to upload)
-- In production, restrict this to specific admin email
create policy "Allow Uploads for Authenticated Users"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'videos' );

-- 4. Policy: ALLOW VIEW/DOWNLOAD checking 'purchases' table
-- This is the MAGIC part. It checks if the user has bought the course.
-- We assume the video filename matches the course_id or we use a metadata strategy.
-- simple version: allow access implies you are authenticated. 
-- Complex logic: verify exists record in purchases.
create policy "Allow View if Purchased"
on storage.objects for select
to authenticated
using (
  bucket_id = 'videos'
  and 
  exists (
    select 1 from public.purchases
    where purchases.user_id = auth.uid()
    -- This assumes we will verify the mapping later, or for now we allow All purchased users to see All videos?
    -- Better: Strict check. But course_id in 'purchases' is a Title ("Sostituzione...").
    -- Filename will likely be different.
    -- For this stage, let's allow ALL authenticated users who have AT LEAST ONE purchase to view, 
    -- OR simplify to "Authenticated Users" for viewing until we link filename <-> product.
  )
);

-- REFINED POLICY FOR VIEWING (More Secure approach later):
-- We need to map 'Sostituzione Scambiatore...' -> 'video_scambiatore.mp4'.
-- For now, let's make it visible to Authenticated users so we can build the player.
check ( bucket_id = 'videos' );
