-- =====================================================================
--  LÖGL Mattsee · Sortierung der Produkte (Reihenfolge im Shop & Aktionen)
--  Im Supabase SQL-Editor ausführen (New query -> einfügen -> Run).
--  Sicher & idempotent: verändert KEINE bestehenden Produktdaten
--  (Titel, Preis, Bilder etc.) und löscht nichts – es kommt nur eine
--  neue Spalte `sort_order` hinzu.
-- =====================================================================

-- 1) Neue Spalte für die manuelle Reihenfolge (kleiner Wert = weiter oben)
alter table public.products
  add column if not exists sort_order integer not null default 0;

-- 2) Startreihenfolge = bisherige Anzeige-Reihenfolge (nach Erstellzeit).
--    Nur Zeilen setzen, die noch auf dem Standardwert 0 stehen, damit ein
--    erneuter Lauf eine bereits angepasste Reihenfolge NICHT überschreibt.
with ranked as (
  select id, row_number() over (order by created_at asc) * 10 as rn
  from public.products
)
update public.products p
   set sort_order = r.rn
  from ranked r
 where p.id = r.id
   and p.sort_order = 0;

-- 3) Index für schnelles Sortieren
create index if not exists idx_products_sort_order
  on public.products (sort_order asc, created_at asc);
