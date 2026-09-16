-- 00048: Quitar a `anon` los privilegios de escritura que nunca debe usar
--
-- La auditoría de privilegios por columna (information_schema.column_privileges)
-- mostró que `anon` conserva INSERT y UPDATE sobre TODAS las columnas de
-- `perfiles`, incluidas `rol`, `suscripcion_activa`, `membresia_gratis` y
-- `stripe_customer_id`. La migración 00023 se ocupó de `authenticated`
-- (revoke + grant solo de `nombre_completo`), pero no de `anon`.
--
-- Hoy es inerte: no existe ninguna política de UPDATE para `anon`, así que la
-- sentencia afecta a 0 filas. Verificado contra la base real con la clave
-- pública: un PATCH de `rol` a un perfil real devolvió 200 con 0 filas, mientras
-- que el mismo PATCH con el service role llegó hasta el CHECK de la columna
-- (error 23514). Es decir, la barrera que corta es RLS, no el privilegio.
--
-- Pero es una barrera única: si algún día se crea una política desde el dashboard
-- y se deja el rol por defecto `public` —justo lo que pasó con la política de
-- `videos` de la migración 00047—, `anon` tendría todo lo necesario para
-- ascenderse a administrador.
--
-- Se revoca solo la escritura; el SELECT se deja como está (RLS ya devuelve cero
-- filas, y así una lectura legítima futura no falla con un 401 en vez de con una
-- lista vacía). El alta de usuarios no usa estos privilegios: el perfil lo crea
-- el trigger handle_new_user(), que es SECURITY DEFINER y escribe como el
-- propietario de la tabla, sin pasar por RLS ni por estos grants.

revoke insert, update on public.perfiles from anon;
revoke insert on public.perfiles from authenticated;
