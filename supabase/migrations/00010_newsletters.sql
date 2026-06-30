create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  contenido_html text not null,
  imagen_url text,
  enviado_por uuid references auth.users,
  destinatarios integer default 0,
  created_at timestamptz default now()
);

alter table public.newsletters enable row level security;

-- admins can read all newsletters
create policy "admins can read newsletters"
  on public.newsletters for select
  to authenticated
  using (
    (select rol from public.perfiles where id = auth.uid()) = 'administrador'
  );

-- admins can insert newsletters
create policy "admins can insert newsletters"
  on public.newsletters for insert
  to authenticated
  with check (
    (select rol from public.perfiles where id = auth.uid()) = 'administrador'
  );

-- admins can delete newsletters
create policy "admins can delete newsletters"
  on public.newsletters for delete
  to authenticated
  using (
    (select rol from public.perfiles where id = auth.uid()) = 'administrador'
  );
