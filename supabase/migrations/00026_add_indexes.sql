-- M11: Missing indexes for query performance

create index if not exists idx_perfiles_stripe_customer
  on public.perfiles (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_perfiles_suscripcion
  on public.perfiles (suscripcion_activa)
  where suscripcion_activa = true;

create index if not exists idx_videos_grupo_pub
  on public.videos (grupo_id, publicado);

create index if not exists idx_articulos_pub
  on public.articulos (publicado, fecha_publicacion desc);

create index if not exists idx_solicitudes_usuario
  on public.solicitudes_membresia (usuario_id);

create index if not exists idx_solicitudes_estado
  on public.solicitudes_membresia (estado);
