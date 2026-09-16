-- 00043: Snapshot of deleted accounts for the admin panel
--
-- Deleting an account must honour the request completely: the auth user, the
-- profile, the membership applications and the charge reminders all cascade
-- away. What survives is this minimal audit row, so an admin can still see WHO
-- left, WHY (their own decision or an admin action) and whether the Stripe
-- subscription could be stopped.
--
-- Billing: deletion never depends on Stripe being reachable, so
-- `suscripcion_cancelada = false` marks a subscription that still needs to be
-- cancelled. The daily cron retries it from the stored customer id, and the
-- admin panel shows the outstanding ones.
--
-- Only the service role writes here (no INSERT/UPDATE policies on purpose);
-- admins can read, and the panel marks rows as seen through `visto_at`.

create table if not exists public.usuarios_eliminados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null,
  email text,
  nombre_completo text,
  rol text,
  motivo text not null check (motivo in ('usuario', 'admin')),
  eliminado_por uuid,
  eliminado_por_nombre text,
  tipo_miembro int,
  region text,
  estado_solicitud text,
  stripe_customer_id text,
  suscripcion_cancelada boolean not null default true,
  detalle text,
  visto_at timestamptz,
  -- When the account was created, so the admin lists can still sort and label
  -- the row by the date the member joined instead of the date they left.
  usuario_created_at timestamptz,
  deleted_at timestamptz not null default now()
);

-- Panel listing: newest first.
create index if not exists usuarios_eliminados_deleted_at_idx
  on public.usuarios_eliminados (deleted_at desc);

-- Pending Stripe cancellations: rare, so a partial index keeps it tiny.
create index if not exists usuarios_eliminados_pendientes_idx
  on public.usuarios_eliminados (deleted_at)
  where suscripcion_cancelada = false;

-- Unseen notifications for the admin dashboard.
create index if not exists usuarios_eliminados_no_vistos_idx
  on public.usuarios_eliminados (deleted_at desc)
  where visto_at is null;

alter table public.usuarios_eliminados enable row level security;

drop policy if exists "Admins leen usuarios eliminados" on public.usuarios_eliminados;
create policy "Admins leen usuarios eliminados"
  on public.usuarios_eliminados for select
  to authenticated
  using (public.es_admin());
