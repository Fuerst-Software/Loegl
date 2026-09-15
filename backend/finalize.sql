-- =====================================================================
--  LÖGL Mattsee · Abschluss-SQL
--  Im Supabase SQL-Editor ausführen (New query -> einfügen -> Run).
--  Behebt: doppelte Aktionen + Bild-Upload-Rechte im Storage.
-- =====================================================================

-- 1) Doppelte Aktionen entfernen (jüngere Kopie löschen, älteste je Titel behalten)
delete from public.aktionen a
using public.aktionen b
where a.title = b.title
  and a.created_at > b.created_at;

-- 2) Storage-Rechte für den Bucket 'product-images'
--    Öffentliches Lesen (Bilder anzeigen) + Hochladen/Ändern/Löschen nur für eingeloggte Admins.
drop policy if exists "product_images_read"   on storage.objects;
drop policy if exists "product_images_insert" on storage.objects;
drop policy if exists "product_images_update" on storage.objects;
drop policy if exists "product_images_delete" on storage.objects;

create policy "product_images_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

create policy "product_images_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "product_images_update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

create policy "product_images_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');
