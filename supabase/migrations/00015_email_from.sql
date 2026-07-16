-- Actualizar remitente de correos tras verificar dominio en Resend
-- Reemplazar 'info@ikmaglobal.com' con el correo verificado
update public.app_config
set value = 'info@ikmaglobal.com'
where key = 'email_from_email';

-- Si aun no existe la fila (por si acaso):
insert into public.app_config (key, value)
values ('email_from_email', 'info@ikmaglobal.com')
on conflict (key) do nothing;
