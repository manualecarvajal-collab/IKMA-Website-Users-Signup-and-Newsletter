-- 00034: Invoice charge reminders (sent once per billing period)
-- Dedup table: unique (subscription_id, period_end) so the daily cron only
-- emails a user once per charge, even if it runs several times in the window.

create table if not exists public.recordatorios_cobro (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users on delete cascade not null,
  subscription_id text not null,
  period_end timestamptz not null,
  sent_at timestamptz default now(),
  unique (subscription_id, period_end)
);

alter table public.recordatorios_cobro enable row level security;
