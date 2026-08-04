-- 00029: Free membership plan
-- Free members (tipo_miembro = 3) get: newsletter, the first magazine edition,
-- and all videos of groups flagged as gratis. They are NOT paid subscribers.

-- 1) perfiles: flag for approved free membership
alter table public.perfiles add column if not exists membresia_gratis boolean not null default false;

-- 2) grupos: flag that the whole group is included in the free membership
alter table public.grupos add column if not exists gratis boolean not null default false;

-- The January 2026 conference is free for Free members
update public.grupos set gratis = true where slug = 'conference-january-2026';

-- 3) Backfill: users with an approved free application become free members
update public.perfiles p set membresia_gratis = true
where exists (
  select 1 from public.solicitudes_membresia s
  where s.usuario_id = p.id and s.tipo_miembro = 3 and s.estado = 'aprobada'
);

-- Downgrade free members only if they have no paid-approved application
update public.perfiles p set suscripcion_activa = false
where p.membresia_gratis = true
  and not exists (
    select 1 from public.solicitudes_membresia s
    where s.usuario_id = p.id and s.tipo_miembro <> 3 and s.estado in ('aprobada', 'pagada')
  );
