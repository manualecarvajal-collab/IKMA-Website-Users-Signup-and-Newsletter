-- Create storage bucket for revista PDFs
insert into storage.buckets (id, name, public)
values ('revistas-pdf', 'revistas-pdf', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload PDFs
create policy "Authenticated users can upload PDFs"
on storage.objects for insert
with check (
  bucket_id = 'revistas-pdf'
  and auth.role() = 'authenticated'
);

-- Allow public read access (for download links in emails)
create policy "Anyone can view PDFs"
on storage.objects for select
using (bucket_id = 'revistas-pdf');

-- Allow owners to delete
create policy "Owners can delete PDFs"
on storage.objects for delete
using (
  bucket_id = 'revistas-pdf'
  and auth.uid() = owner
);
