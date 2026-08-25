create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rol_es text,
  rol_en text,
  cita_es text not null,
  cita_en text not null,
  region text not null check (region in ('latin-america', 'north-america', 'africa', 'europe')),
  imagen_url text,
  orden int default 0,
  publicado boolean default false,
  created_at timestamptz default now()
);

alter table public.testimonios enable row level security;

create policy "Public can read published testimonios"
  on public.testimonios for select using (publicado = true);

create policy "Admins can read all testimonios"
  on public.testimonios for select using ((select rol from public.perfiles where id = auth.uid()) = 'administrador');

create policy "Admins can insert testimonios"
  on public.testimonios for insert with check (true);

create policy "Admins can update testimonios"
  on public.testimonios for update using (true);

create policy "Admins can delete testimonios"
  on public.testimonios for delete using (true);
