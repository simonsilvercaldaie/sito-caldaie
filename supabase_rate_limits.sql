-- Rate Limits Table for Security Hardening
create table if not exists rate_limits (
  key text primary key,
  count int not null default 1,
  expires_at timestamp with time zone not null
);

alter table rate_limits enable row level security;
create index if not exists idx_rate_limits_expires_at on rate_limits(expires_at);

-- Atomic Increment Function
create or replace function increment_rate_limit(row_key text, window_seconds int)
returns json
language plpgsql
security definer
as $$
declare
  current_count int;
  new_count int;
  current_expires_at timestamptz;
  now_ts timestamptz := now();
begin
  -- Try to lock the row
  select count, expires_at into current_count, current_expires_at
  from rate_limits
  where key = row_key
  for update;

  if not found then
    -- Insert new
    insert into rate_limits (key, count, expires_at)
    values (row_key, 1, now_ts + (window_seconds || ' seconds')::interval);
    return json_build_object('success', true, 'count', 1);
  end if;

  if current_expires_at < now_ts then
    -- Expired, reset
    update rate_limits
    set count = 1,
        expires_at = now_ts + (window_seconds || ' seconds')::interval
    where key = row_key;
    return json_build_object('success', true, 'count', 1);
  else
    -- Increment
    new_count := current_count + 1;
    update rate_limits
    set count = new_count
    where key = row_key;
    return json_build_object('success', true, 'count', new_count);
  end if;
end;
$$;
