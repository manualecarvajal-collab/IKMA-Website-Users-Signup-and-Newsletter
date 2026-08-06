-- 00030: Student membership manual review
-- Students (tipo_miembro = 3) no longer auto-activate on registration.
-- Their application starts as "pendiente" (en revision) and the admin
-- approves/denies it manually. No DB change to the estado flow is needed;
-- this migration only adds the fields collected by the new student form.

alter table public.solicitudes_membresia
  add column if not exists universidad text;

alter table public.solicitudes_membresia
  add column if not exists carrera text;

alter table public.solicitudes_membresia
  add column if not exists anio_ingreso int;

alter table public.solicitudes_membresia
  add column if not exists anio_egreso int;