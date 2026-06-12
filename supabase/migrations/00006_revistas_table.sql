-- Create revistas (magazines) table
create table if not exists public.revistas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  archivo_url text not null,
  imagen_portada text,
  publicado boolean default false,
  fecha_publicacion timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.revistas enable row level security;

-- RLS: anyone can read published magazines
create policy "Anyone can read published magazines"
  on public.revistas for select
  using (publicado = true);

-- RLS: admins can manage magazines
create policy "Admins can manage magazines"
  on public.revistas for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );
