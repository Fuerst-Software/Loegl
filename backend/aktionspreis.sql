-- =====================================================================
--  LÖGL Mattsee · Aktionspreis (zweiter Preis) für Produkte
--  Im Supabase SQL-Editor ausführen: New query -> einfügen -> Run.
-- =====================================================================

-- Zusätzliche, optionale Preis-Spalte:
--   price      = UVP (regulärer Preis)
--   sale_price = Aktionspreis (leer/NULL, wenn kein Aktionspreis)
alter table public.products add column if not exists sale_price numeric(10,2);
