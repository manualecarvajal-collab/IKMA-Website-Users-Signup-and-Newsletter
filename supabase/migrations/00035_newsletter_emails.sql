-- Store the actual recipient emails for each newsletter send
alter table public.newsletters
  add column if not exists destinatarios_emails text[] not null default '{}';
