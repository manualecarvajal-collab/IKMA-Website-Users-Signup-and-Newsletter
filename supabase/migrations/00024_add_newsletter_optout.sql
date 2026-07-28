-- Add newsletter opt-out column for CAN-SPAM / GDPR compliance
alter table public.perfiles
  add column if not exists newsletter_optout boolean not null default false;
