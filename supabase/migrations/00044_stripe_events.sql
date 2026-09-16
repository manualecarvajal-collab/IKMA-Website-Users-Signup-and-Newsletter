-- 00044: Processed Stripe events (idempotency)
--
-- Stripe delivers webhooks at-least-once: a redelivery (retry after a timeout,
-- or a manual resend from the dashboard) would otherwise re-run the side
-- effects, duplicating "payment received" emails and re-flipping access flags.
--
-- The webhook marks an event as processed only AFTER its side effects
-- succeeded, so a failed attempt still returns 500 and Stripe keeps retrying.
-- The table doubles as an audit trail of what billing events the site saw.

create table if not exists public.stripe_events (
  event_id text primary key,
  type text not null,
  livemode boolean not null default true,
  resumen text,
  procesado_at timestamptz not null default now()
);

create index if not exists stripe_events_procesado_idx
  on public.stripe_events (procesado_at desc);

alter table public.stripe_events enable row level security;

-- Only the service role writes (the webhook); admins may read for support.
drop policy if exists "Admins leen eventos de stripe" on public.stripe_events;
create policy "Admins leen eventos de stripe"
  on public.stripe_events for select
  to authenticated
  using (public.es_admin());
