-- 00046: Los buckets de contenido solo los llenan administradores
--
-- Las políticas originales (00003, 00005, 00009) permitían INSERTAR a cualquier
-- usuario autenticado. Como registrarse es abierto, cualquier cuenta —incluido un
-- estudiante gratis— podía usar el almacenamiento de IKMA como hosting gratuito:
-- subir archivos arbitrarios a los buckets públicos servidos desde el dominio de
-- Supabase del proyecto (phishing, malware, contenido ajeno) e inflar el costo de
-- almacenamiento y de tráfico.
--
-- Las subidas legítimas pasan por /api/upload, /api/upload-pdf y
-- /api/upload-license, que ya verifican la sesión y el rol en el servidor y
-- entregan una URL firmada con el service role. Es decir: restringir estas
-- políticas no afecta ningún flujo real, solo cierra la puerta lateral.

drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Admins can upload doctor images" on storage.objects;
create policy "Admins can upload doctor images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'doctor-images' and public.es_admin());

drop policy if exists "Authenticated users can upload article images" on storage.objects;
drop policy if exists "Admins can upload article images" on storage.objects;
create policy "Admins can upload article images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images' and public.es_admin());

drop policy if exists "Authenticated users can upload PDFs" on storage.objects;
drop policy if exists "Admins can upload PDFs" on storage.objects;
create policy "Admins can upload PDFs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'revistas-pdf' and public.es_admin());

-- Nota: `membership-licenses` no necesita política de INSERT. Las subidas de los
-- solicitantes las firma /api/upload-license con el service role usando una ruta
-- aleatoria dentro de la carpeta del propio usuario.
