-- =====================================================================
--  LÖGL Mattsee · Mehrere Produktbilder (Galerie)
--  Im Supabase SQL-Editor ausführen: New query -> einfügen -> Run.
-- =====================================================================

-- Zusätzliche Spalte: geordnete Liste aller Produktbilder (das Hauptbild
-- bleibt weiterhin in "img"). Standard: leere Liste.
alter table public.products add column if not exists images jsonb not null default '[]'::jsonb;

-- Bestehende Produkte: vorhandenes Einzelbild in die Bilder-Liste übernehmen,
-- damit die Galerie sofort etwas anzeigt.
update public.products
set images = jsonb_build_array(img)
where (images is null or jsonb_array_length(images) = 0) and img is not null and img <> '';
