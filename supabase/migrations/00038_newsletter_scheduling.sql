alter table public.newsletters
  add column if not exists status text not null default 'sent',
  add column if not exists scheduled_at timestamptz;

-- backfill: existing rows have no status column → they were sent
update public.newsletters set status = 'sent' where status is null;

create index if not exists idx_newsletters_scheduled
  on public.newsletters (status, scheduled_at)
  where status = 'scheduled';
