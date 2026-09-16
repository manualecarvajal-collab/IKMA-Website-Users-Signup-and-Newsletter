-- 00045: El embed de un video deja de ser público
--
-- `videos` tiene RLS con una política de lectura pública (`publicado = true`), y
-- RLS es por fila: no puede ocultar una columna. Resultado: el `embed_url` de
-- TODOS los videos publicados, incluidos los 15 de pago, era legible con la
-- clave pública que va en el navegador. El muro de pago era solo de interfaz.
--
-- El contenido se mueve a su propia tabla, que no es legible ni por `anon` ni por
-- usuarios autenticados: el reproductor lo sirve el servidor con el service role,
-- y solo después de que la página haya comprobado el acceso en código (el mismo
-- patrón que ya usan los PDF privados de las revistas).
--
-- Seguro en cualquier orden de despliegue:
--  · El código nuevo lee de aquí y cae al valor heredado si esta tabla aún no
--    existe (desplegar antes de migrar no rompe nada).
--  · La columna antigua se vacía con cadena vacía, NO con NULL: el código que
--    hoy está en producción hace `valor.match(...)` sin comprobar nulos, así que
--    un NULL le lanzaría una excepción y rompería la página del video. Una cadena
--    vacía lo deja mostrando "Video no disponible" y, sobre todo, cierra el hueco
--    en cuanto se aplica esta migración, sin esperar al despliegue.

create table if not exists public.videos_contenido (
  video_id uuid primary key references public.videos(id) on delete cascade,
  embed_url text not null,
  updated_at timestamptz not null default now()
);

alter table public.videos_contenido enable row level security;

drop policy if exists "Admins leen el contenido de videos" on public.videos_contenido;
create policy "Admins leen el contenido de videos"
  on public.videos_contenido for select
  to authenticated
  using (public.es_admin());

-- Traslado del contenido existente.
insert into public.videos_contenido (video_id, embed_url)
select id, embed_url
from public.videos
where embed_url is not null and embed_url <> ''
on conflict (video_id) do nothing;

-- La columna antigua queda opcional y vacía: nadie puede leerla desde la API.
-- Nullable porque los videos nuevos ya no envían esta columna.
alter table public.videos alter column embed_url drop not null;

-- Se vacía (cadena vacía, no NULL) para que ningún cliente pueda leer el embed.
update public.videos set embed_url = '' where embed_url is not null and embed_url <> '';
