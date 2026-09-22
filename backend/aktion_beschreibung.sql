-- =====================================================================
--  LÖGL Mattsee · Aktionsprodukt: Beschreibung auf der Kachel an/aus
--  Im Supabase SQL-Editor ausführen (New query -> einfügen -> Run).
--  Sicher & idempotent: fügt nur eine neue Spalte hinzu, verändert oder
--  löscht KEINE bestehenden Produktdaten.
--
--  aktion_show_desc = true  -> Beschreibung erscheint auf der Aktions-Kachel
--                     false -> Beschreibung nur in der Detailansicht (Standard)
-- =====================================================================

alter table public.products
  add column if not exists aktion_show_desc boolean not null default false;
