-- 00047: Una política de `videos` creada FUERA del repositorio dejaba leer todo
--
-- La auditoría de RLS destapó esta política, que no existe en ninguna migración
-- (se creó a mano en el dashboard, con el rol por defecto `public` pese a
-- llamarse "Authenticated"):
--
--   videos [SELECT] "Authenticated can read all videos"  →  roles: public
--
-- Al convivir con "Anyone can read published videos", cualquier visitante podía
-- leer TODAS las filas de `videos`, publicadas o no: el primer borrador que se
-- guardara quedaba expuesto en la API pública (título, descripción, imagen de
-- previsualización y banderas `gratis`). Hoy no hay borradores, así que no hubo
-- filtración real, pero la puerta estaba abierta.
--
-- Basta con eliminarla: el panel ya lee todo (incluidos los borradores) por la
-- política "Admins manage videos", que es `FOR ALL` y por tanto cubre SELECT, y
-- los listados públicos filtran `publicado = true` en la consulta.

drop policy if exists "Authenticated can read all videos" on public.videos;
