alter table public.newsletters
  add column if not exists failed_emails jsonb default null;
