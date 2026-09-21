-- =====================================================================
--  LÖGL Mattsee · Aktionsprodukte
--  Im Supabase SQL-Editor ausführen (New query -> einfügen -> Run).
--  Idempotent: kann gefahrlos erneut ausgeführt werden.
--
--  Fügt der Produkt-Tabelle 3 Spalten hinzu, damit ein Shop-Artikel
--  zusätzlich im Aktionen-Bereich der Website erscheinen kann:
--    show_in_aktionen   -> Produkt auch bei den Aktionen anzeigen (ja/nein)
--    aktion_badge       -> kurzer Hinweis, z. B. "-20 %" oder "Aktionspreis"
--    aktion_valid_text  -> Gültigkeit als Text, z. B. "Gültig bis 31. Oktober 2026"
-- =====================================================================

alter table public.products
  add column if not exists show_in_aktionen  boolean not null default false,
  add column if not exists aktion_badge       text,
  add column if not exists aktion_valid_text  text;

-- Optional: schnellere Filterung der Aktionsprodukte
create index if not exists idx_products_show_in_aktionen
  on public.products (show_in_aktionen)
  where show_in_aktionen = true;
