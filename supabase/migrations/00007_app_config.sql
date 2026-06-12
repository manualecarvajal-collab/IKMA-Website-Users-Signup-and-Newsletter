-- Create app_config table for email and general settings
create table if not exists public.app_config (
  key text primary key,
  value text not null
);

-- Enable RLS
alter table public.app_config enable row level security;

-- RLS: admins can manage config
create policy "Admins can manage config"
  on public.app_config for all
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'administrador'
    )
  );

-- Insert default email config
insert into public.app_config (key, value) values
  ('email_from_name', 'IKMA'),
  ('email_from_email', 'onboarding@resend.dev'),
  ('email_subject_template', 'New Magazine: {{titulo}}')
on conflict (key) do nothing;
