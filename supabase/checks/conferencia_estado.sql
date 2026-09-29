-- ============================================================
-- Conferencia IKMA — Comprobación de estado (SOLO LECTURA)
-- ------------------------------------------------------------
-- Pega este bloque completo en el SQL Editor de Supabase y
-- ejecútalo. Devuelve una única fila JSON con el estado real
-- del schema `conferencia` tras aplicar 00050..00053.
--
-- No crea, altera ni borra nada.
-- ============================================================

select jsonb_pretty(jsonb_build_object(

  -- 1. ¿Existe el schema?
  'schema_conferencia', (
    select to_jsonb(s.schema_name)
    from information_schema.schemata s
    where s.schema_name = 'conferencia'
  ),

  -- 2. ¿Existe la tabla?
  'tabla_registros', (
    select to_jsonb(t.table_type)
    from information_schema.tables t
    where t.table_schema = 'conferencia' and t.table_name = 'registros'
  ),

  -- 3. Columnas, en orden, con tipo / nulabilidad / default.
  --    Esperado tras 00053:
  --      id, nombre, email, telefono, ciudad, mensaje, estado,
  --      origen, created_at, consentimiento, consentimiento_at,
  --      perfil_profesional, pais
  --    NO debe aparecer: organizacion, cargo
  'columnas', (
    select jsonb_agg(
             jsonb_build_object(
               'columna', c.column_name,
               'tipo',    c.data_type,
               'nulo',    c.is_nullable,
               'default', c.column_default
             )
             order by c.ordinal_position
           )
    from information_schema.columns c
    where c.table_schema = 'conferencia' and c.table_name = 'registros'
  ),

  -- 4. Restricciones CHECK.
  --    Esperado: registros_estado_check + registros_perfil_profesional_check
  --    (NO debe quedar registros_cargo_check)
  'checks', (
    select jsonb_agg(con.conname order by con.conname)
    from pg_constraint con
    join pg_class     cl on cl.oid = con.conrelid
    join pg_namespace ns on ns.oid = cl.relnamespace
    where ns.nspname = 'conferencia'
      and cl.relname = 'registros'
      and con.contype = 'c'
  ),

  -- 5. Índices. Debe estar registros_email_unique sobre lower(email).
  'indices', (
    select jsonb_agg(i.indexdef order by i.indexname)
    from pg_indexes i
    where i.schemaname = 'conferencia' and i.tablename = 'registros'
  ),

  -- 6. RLS: debe estar activado (true) y SIN políticas (0).
  'rls_activado', (
    select to_jsonb(cl.relrowsecurity)
    from pg_class cl
    join pg_namespace ns on ns.oid = cl.relnamespace
    where ns.nspname = 'conferencia' and cl.relname = 'registros'
  ),
  'numero_de_politicas', (
    select to_jsonb(count(*))
    from pg_policies p
    where p.schemaname = 'conferencia' and p.tablename = 'registros'
  ),

  -- 7. Permisos (los que añade 00054). Si esto sale false/null, el
  --    insert desde el servidor fallará con:
  --        permission denied for schema conferencia  (42501)
  --    `anon`/`authenticated` DEBEN salir false.
  'permisos', (
    case
      when (select count(*) from pg_roles
            where rolname in ('anon', 'authenticated', 'service_role')) = 3
      then jsonb_build_object(
        'service_role_usage_schema',
          has_schema_privilege('service_role', 'conferencia', 'USAGE'),
        'service_role_select',
          has_table_privilege('service_role', 'conferencia.registros', 'SELECT'),
        'service_role_insert',
          has_table_privilege('service_role', 'conferencia.registros', 'INSERT'),
        'service_role_update',
          has_table_privilege('service_role', 'conferencia.registros', 'UPDATE'),
        'anon_usage_schema',
          has_schema_privilege('anon', 'conferencia', 'USAGE'),
        'anon_select',
          has_table_privilege('anon', 'conferencia.registros', 'SELECT'),
        'anon_insert',
          has_table_privilege('anon', 'conferencia.registros', 'INSERT'),
        'authenticated_usage_schema',
          has_schema_privilege('authenticated', 'conferencia', 'USAGE'),
        'default_privileges',
          (select jsonb_agg(jsonb_build_object(
                    'tipo', d.defaclobjtype,
                    'acl',  d.defaclacl::text))
           from pg_default_acl d
           join pg_namespace ns on ns.oid = d.defaclnamespace
           where ns.nspname = 'conferencia')
      )
      else jsonb_build_object(
        'aviso', 'roles de Supabase no encontrados (esto no parece el proyecto real)'
      )
    end
  ),

  -- 8. Config de PostgREST en los roles. Informativo: comprobado en
  --    el proyecto real, aquí NO aparece `pgrst.db_schemas` — Supabase
  --    configura PostgREST por su cuenta, no con la config in-database.
  --    Por eso los schemas expuestos se cambian SOLO desde el
  --    dashboard (Settings → API → Exposed schemas), no por SQL.
  'pgrst_rolconfig', (
    select jsonb_agg(jsonb_build_object('rol', r.rolname, 'config', r.rolconfig))
    from pg_roles r
    where r.rolname in ('authenticator', 'anon', 'authenticated', 'service_role')
  )

));

-- ------------------------------------------------------------
-- Filas existentes (por si ya has probado inserciones).
-- Va aparte porque fallaría si la tabla no existe: ejecútalo solo
-- si `tabla_registros` devolvió "BASE TABLE" arriba.
--
--   select count(*) as filas from conferencia.registros;
--
-- ------------------------------------------------------------
-- Schema expuesto a la API (la app usa supabase-js → PostgREST).
-- Si la API responde `PGRST106 Invalid schema: conferencia`, falta
-- este paso y hay que hacerlo desde el dashboard:
--
--   Project Settings → API → "Exposed schemas"
--     → añadir `conferencia` → Save
--
-- NO se puede hacer por SQL de forma fiable: verificado en este
-- proyecto, ningún rol tiene `pgrst.db_schemas`, así que Supabase
-- configura PostgREST con su propia config y no con la
-- configuración in-database de PostgREST.
--
-- Solo hace falta una vez. Comprobación definitiva, tras exponerlo,
-- desde la máquina de desarrollo:
--
--   curl -s -o /dev/null -w '%{http_code}\n' \
--     "$URL/rest/v1/registros?select=id&limit=1" \
--     -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \
--     -H "Accept-Profile: conferencia"
--
--   200 → todo correcto   401/403 → faltan permisos (00054)
--   406 → schema sin exponer
-- ------------------------------------------------------------
