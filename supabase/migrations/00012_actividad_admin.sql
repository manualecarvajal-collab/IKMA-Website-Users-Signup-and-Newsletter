-- Create actividad_admin table for activity log
create table if not exists public.actividad_admin (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users on delete set null,
  usuario_nombre text,
  tipo text not null,         -- 'articulo_creado', 'revista_enviada', 'usuario_eliminado', etc.
  descripcion text not null,  -- Human-readable: "Created article 'Advances in Telemedicine'"
  ref_tabla text,             -- Table referenced: 'articulos', 'revistas', 'perfiles', etc.
  ref_id text,                -- ID of the referenced record
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.actividad_admin enable row level security;

-- RLS: Admins can read all activity; insert allowed for authenticated users
create policy "Admins can read activity"
  on public.actividad_admin for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );

create policy "Authenticated users can insert activity"
  on public.actividad_admin for insert
  with check (auth.role() = 'authenticated');

-- Index for efficient ordering on dashboard
create index idx_actividad_admin_created_at
  on public.actividad_admin (created_at desc);

-- Index for filtering by type
create index idx_actividad_admin_tipo
  on public.actividad_admin (tipo);
