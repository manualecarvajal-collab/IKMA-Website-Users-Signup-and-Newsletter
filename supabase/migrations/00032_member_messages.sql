-- 00032: Individual member message history
-- Stores every email the admin sends to a member ("enviado") and every reply
-- captured by the Resend Inbound webhook ("recibido"), linked to the membership
-- application.

create table if not exists public.mensajes_miembro (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid references public.solicitudes_membresia on delete cascade not null,
  direccion text not null check (direccion in ('enviado','recibido')),
  asunto text not null default '',
  contenido text,
  es_html boolean not null default false,
  de text,
  para text,
  created_at timestamptz default now()
);

create index if not exists mensajes_miembro_solicitud_idx
  on public.mensajes_miembro (solicitud_id, created_at desc);

alter table public.mensajes_miembro enable row level security;

drop policy if exists "Admins ven mensajes de miembros" on public.mensajes_miembro;
create policy "Admins ven mensajes de miembros"
  on public.mensajes_miembro for select
  using ((select rol from public.perfiles where id = auth.uid()) = 'administrador');

drop policy if exists "Admins insertan mensajes de miembros" on public.mensajes_miembro;
create policy "Admins insertan mensajes de miembros"
  on public.mensajes_miembro for insert
  with check ((select rol from public.perfiles where id = auth.uid()) = 'administrador');
