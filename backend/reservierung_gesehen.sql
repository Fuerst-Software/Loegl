-- =====================================================================
--  LÖGL Mattsee · Geteilter Admin-Zustand (z. B. "Reservierungen gesehen")
--  Im Supabase SQL-Editor ausführen (New query -> einfügen -> Run).
--  Sicher & idempotent. Speichert den "zuletzt gesehen"-Zeitpunkt der
--  Reservierungen zentral (account-/shopweit) statt pro Browser, damit der
--  "neu"-Zähler auf allen Geräten gleich ist.
-- =====================================================================

create table if not exists public.admin_state (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.admin_state enable row level security;

-- Nur eingeloggte Admins dürfen lesen/schreiben (Besucher haben keinen Zugriff)
drop policy if exists "admin_state_all" on public.admin_state;
create policy "admin_state_all" on public.admin_state
  for all to authenticated using (true) with check (true);
