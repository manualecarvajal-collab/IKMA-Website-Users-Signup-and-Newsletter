-- M9: Prevent authenticated users from inserting fake activity log entries
drop policy if exists "Authenticated users can insert activity"
  on public.actividad_admin;

-- No replacement: only service_role (admin client) can write to actividad_admin
