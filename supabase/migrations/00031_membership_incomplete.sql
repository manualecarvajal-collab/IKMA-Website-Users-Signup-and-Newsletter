-- 00031: "Incomplete Registration" state
-- A paid-membership application whose checkout was never completed must NOT be
-- confused with a submitted application awaiting verification. Card applicants
-- create a solicitud the moment they reach the payment step; if they never pay
-- it stays "incompleta" and grants no membership access.
--
-- State machine after this migration:
--   card applicant reaches payment step      -> incompleta (no access)
--   card payment confirmed (webhook)          -> pagada     (admin approves)
--   zelle applicant submits transfer ref      -> pendiente  (manual verification)
--   admin approves / rejects                  -> aprobada / rechazada

-- 1) Allow the new state
alter table public.solicitudes_membresia
  drop constraint if exists solicitudes_membresia_estado_check;

alter table public.solicitudes_membresia
  add constraint solicitudes_membresia_estado_check
  check (estado in ('pendiente','aprobada','rechazada','pagada','incompleta'));

-- 2) Backfill: card (or unspecified) + pendiente => incompleta.
-- Zelle applications keep "pendiente" (transfer reference awaiting manual review),
-- and STUDENT applications (tipo 3) always stay "pendiente" — they have no
-- metodo_pago and must remain in the manual-review flow.
update public.solicitudes_membresia
set estado = 'incompleta', updated_at = now()
where estado = 'pendiente'
  and tipo_miembro <> 3
  and coalesce(metodo_pago, 'card') = 'card';

-- 3) Guard: nobody whose only application is incomplete may hold active access.
-- Fixes users wrongly recognized as paid (suscripcion_activa = true without payment).
update public.perfiles p
set suscripcion_activa = false, updated_at = now()
where suscripcion_activa = true
  and exists (
    select 1 from public.solicitudes_membresia s
    where s.usuario_id = p.id and s.estado = 'incompleta'
  )
  and not exists (
    select 1 from public.solicitudes_membresia s2
    where s2.usuario_id = p.id and s2.estado in ('aprobada', 'pagada')
  );
