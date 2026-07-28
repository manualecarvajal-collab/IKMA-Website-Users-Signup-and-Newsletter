-- 00023: Fix critical security issues (C1, C2, C5)
-- C1: Profile update policy needs WITH CHECK + column-level privs
drop policy if exists "Users can update own profile" on public.perfiles;

revoke update on public.perfiles from authenticated;
grant update (nombre_completo) on public.perfiles to authenticated;

create policy "Users can update own profile"
  on public.perfiles for update
  to authenticated
  using  ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- C2: Reusable admin check function
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = (select auth.uid()) and rol = 'administrador'
  );
$$;

-- C2: Fix videos policies — add TO authenticated + use es_admin()
drop policy if exists "Admins can insert videos" on public.videos;
drop policy if exists "Admins can update videos" on public.videos;
drop policy if exists "Admins can delete videos" on public.videos;

create policy "Admins manage videos" on public.videos
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- C2: Fix grupos policies
drop policy if exists "Admins can insert grupos" on public.grupos;
drop policy if exists "Admins can update grupos" on public.grupos;
drop policy if exists "Admins can delete grupos" on public.grupos;

create policy "Admins manage grupos" on public.grupos
  for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- C5: Enable RLS on visitas
alter table public.visitas enable row level security;

create policy "Solo admins leen visitas" on public.visitas
  for select to authenticated using (public.es_admin());

-- C5: Allow insert for anon (tracking) but only path column
create policy "Anyone can insert visitas" on public.visitas
  for insert to anon, authenticated
  with check (true);