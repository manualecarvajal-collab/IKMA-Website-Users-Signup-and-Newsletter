-- Create profiles table (mirrors auth.users)
create table if not exists public.perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombre_completo text,
  rol text default 'lector'::text check (rol in ('lector', 'autor', 'administrador')),
  suscripcion_activa boolean default false,
  updated_at timestamp with time zone default now()
);

-- Create articles table
create table if not exists public.articulos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  contenido_html text,
  resumen text,
  categoria text,
  imagen_url text,
  url_pdf_storage text,
  publicado boolean default false,
  fecha_publicacion timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.perfiles enable row level security;
alter table public.articulos enable row level security;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol, suscripcion_activa)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', ''),
    'lector',
    false
  );
  return new;
end;
$$;

-- Trigger the function on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS Policies: profiles
create policy "Users can view own profile"
  on public.perfiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.perfiles for update
  using (auth.uid() = id);

-- RLS Policies: articles
create policy "Anyone can read published articles"
  on public.articulos for select
  using (publicado = true);

create policy "Admins can manage articles"
  on public.articulos for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );
