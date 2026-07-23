-- Create storage bucket for license files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('membership-licenses', 'membership-licenses', false, 10485760, '{"application/pdf","image/jpeg","image/png"}')
on conflict (id) do nothing;

-- Create membership applications table
create table if not exists public.solicitudes_membresia (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references auth.users on delete cascade not null,
  tipo_miembro int not null check (tipo_miembro between 1 and 4),
  region text not null,
  pais text not null,
  language text default 'en',
  genero text,
  direccion text,
  ciudad text,
  codigo_postal text,
  subgrupo_profesional text,
  otra_profesion text,
  username text,
  telefono text,
  sitio_web text,
  anio_grado int,
  anio_residencia int,
  archivo_licencia_url text,
  estado text not null default 'pendiente' check (estado in ('pendiente','aprobada','rechazada','pagada')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.solicitudes_membresia enable row level security;

drop policy if exists "Usuarios ven sus propias solicitudes" on public.solicitudes_membresia;
create policy "Usuarios ven sus propias solicitudes"
  on public.solicitudes_membresia for select
  using (usuario_id = auth.uid());

drop policy if exists "Administradores ven todas las solicitudes" on public.solicitudes_membresia;
create policy "Administradores ven todas las solicitudes"
  on public.solicitudes_membresia for select
  using (
    (select rol from public.perfiles where id = auth.uid()) = 'administrador'
  );

drop policy if exists "Administradores actualizan solicitudes" on public.solicitudes_membresia;
create policy "Administradores actualizan solicitudes"
  on public.solicitudes_membresia for update
  using (
    (select rol from public.perfiles where id = auth.uid()) = 'administrador'
  );
