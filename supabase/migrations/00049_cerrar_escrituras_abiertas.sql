-- 00049: Cerrar las escrituras abiertas de testimonios, categorias y visitas
--
-- La auditoría de políticas (pg_policies) destapó que las migraciones 00040 y
-- 00014 crearon políticas con nombre "Admins can ..." pero con `using (true)` /
-- `with check (true)` y SIN la cláusula `to`. Sin `to`, PostgreSQL las aplica al
-- rol `public`, así que cualquiera —incluido un visitante anónimo con la clave
-- que viaja en el navegador— podía:
--
--   testimonios  INSERT / UPDATE / DELETE  →  using true, with check true
--   categorias   INSERT / UPDATE           →  using true, with check true
--
-- No es una política creada a mano en el dashboard: es un fallo del repositorio.
-- Verificado contra la base real con la clave pública: insertar y actualizar
-- llegaban hasta las restricciones de la tabla (error 23502 en vez del 42501
-- "new row violates row-level security policy" que devuelven las tablas bien
-- cerradas), y el listado de políticas confirma `using (true)` con rol `public`.
-- Impacto: cualquiera podía publicar testimonios falsos en la web (suplantando a
-- profesionales sanitarios), editar los existentes o borrarlos.
--
-- Se reemplazan por la comprobación de administrador que ya usa el resto del
-- esquema: public.es_admin(), que es SECURITY DEFINER con search_path vacío.
-- Las lecturas públicas legítimas se mantienen intactas.
--
-- `visitas` además tenía INSERT abierto a `anon`: la app no lo usa (solo escribe
-- /api/track con el service role), así que se elimina esa puerta lateral.

-- ── testimonios ────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert testimonios" on public.testimonios;
drop policy if exists "Admins can update testimonios" on public.testimonios;
drop policy if exists "Admins can delete testimonios" on public.testimonios;
drop policy if exists "Admins manage testimonios" on public.testimonios;
create policy "Admins manage testimonios"
  on public.testimonios for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── categorias ─────────────────────────────────────────────────────────────
drop policy if exists "Admins can insert categorias" on public.categorias;
drop policy if exists "Admins can update categorias" on public.categorias;
drop policy if exists "Admins can delete categorias" on public.categorias;
drop policy if exists "Admins manage categorias" on public.categorias;
create policy "Admins manage categorias"
  on public.categorias for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

-- ── visitas ────────────────────────────────────────────────────────────────
-- La analítica se registra desde /api/track con el service role, que no pasa por
-- RLS; esta política solo servía para que cualquiera pudiera inflar la tabla.
drop policy if exists "Anyone can insert visitas" on public.visitas;
