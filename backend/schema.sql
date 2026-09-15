-- =====================================================================
--  LÖGL Mattsee · Datenbank-Schema (Supabase / PostgreSQL)
--  Ausführen im Supabase SQL-Editor (Dashboard → SQL Editor → New query).
--  Idempotent: kann bei Bedarf erneut ausgeführt werden.
-- =====================================================================

-- ---------- Erweiterungen ----------
create extension if not exists "pgcrypto";   -- für gen_random_uuid()

-- ---------- Hilfsfunktion: updated_at automatisch pflegen ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
--  TABELLE: products
-- =====================================================================
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  sku         text unique,                 -- z. B. 'WMF-101' (optional, menschenlesbar)
  title       text not null,
  brand       text,
  category    text,                        -- Freitext-Slugs, z. B. 'haushalt wmf'
  price       numeric(10,2) not null default 0,  -- in Euro, z. B. 249.00
  stock       integer not null default 0 check (stock >= 0),
  active      boolean not null default true,
  img         text,                        -- URL oder Storage-Pfad
  description text,
  specs       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- =====================================================================
--  TABELLE: aktionen (Angebote)
-- =====================================================================
create table if not exists public.aktionen (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        text not null default 'angebot',   -- 'angebot' | 'saisonal'
  valid_text  text,                              -- z. B. 'Gültig bis 31. August 2026'
  valid_until date,                              -- optional maschinenlesbar
  active      boolean not null default true,
  img         text,
  description text,
  badge       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_aktionen_updated on public.aktionen;
create trigger trg_aktionen_updated before update on public.aktionen
  for each row execute function public.set_updated_at();

-- =====================================================================
--  TABELLE: reservations (Click & Collect)
-- =====================================================================
create table if not exists public.reservations (
  id             uuid primary key default gen_random_uuid(),
  pickup_code    text unique not null,
  product_id     uuid references public.products(id) on delete set null,
  product_title  text,                       -- Snapshot des Titels zum Zeitpunkt der Reservierung
  quantity       integer not null default 1 check (quantity > 0),
  customer_name  text not null,
  customer_phone text not null,
  customer_email text not null,
  status         text not null default 'offen',  -- 'offen' | 'abgeholt' | 'storniert'
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists trg_reservations_updated on public.reservations;
create trigger trg_reservations_updated before update on public.reservations
  for each row execute function public.set_updated_at();

create index if not exists idx_reservations_status  on public.reservations(status);
create index if not exists idx_reservations_created on public.reservations(created_at desc);

-- =====================================================================
--  ATOMARE RESERVIERUNG
--  Prüft Lagerbestand, zieht 1 ab, legt Reservierung an, gibt Code zurück.
--  Läuft in EINER Transaktion → kein Überverkauf möglich.
--  Aufruf vom Frontend: supabase.rpc('create_reservation', {...})
-- =====================================================================
create or replace function public.create_reservation(
  p_product_id uuid,
  p_name       text,
  p_phone      text,
  p_email      text
)
returns table (pickup_code text, product_title text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock  integer;
  v_title  text;
  v_code   text;
begin
  -- Zeile sperren, damit parallele Reservierungen nicht überverkaufen
  select stock, title into v_stock, v_title
  from public.products
  where id = p_product_id and active = true
  for update;

  if not found then
    raise exception 'Produkt nicht gefunden oder nicht verfügbar.' using errcode = 'P0002';
  end if;

  if v_stock < 1 then
    raise exception 'Dieser Artikel ist derzeit nicht mehr auf Lager.' using errcode = 'P0001';
  end if;

  -- Eindeutigen Abhol-Code erzeugen (LÖGL-CC-XXXXX)
  loop
    v_code := 'LÖGL-CC-' || lpad((floor(random() * 90000) + 10000)::text, 5, '0');
    exit when not exists (select 1 from public.reservations where reservations.pickup_code = v_code);
  end loop;

  update public.products set stock = stock - 1 where id = p_product_id;

  insert into public.reservations (pickup_code, product_id, product_title, customer_name, customer_phone, customer_email)
  values (v_code, p_product_id, v_title, p_name, p_phone, p_email);

  return query select v_code, v_title;
end;
$$;

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.products     enable row level security;
alter table public.aktionen     enable row level security;
alter table public.reservations enable row level security;

-- ---- products ----
drop policy if exists "products_public_read"  on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated using (active = true or auth.role() = 'authenticated');

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated using (true) with check (true);

-- ---- aktionen ----
drop policy if exists "aktionen_public_read" on public.aktionen;
create policy "aktionen_public_read" on public.aktionen
  for select to anon, authenticated using (active = true or auth.role() = 'authenticated');

drop policy if exists "aktionen_admin_write" on public.aktionen;
create policy "aktionen_admin_write" on public.aktionen
  for all to authenticated using (true) with check (true);

-- ---- reservations ----
-- Kunden dürfen KEINE Reservierungen direkt einfügen/lesen — das läuft
-- ausschließlich über die geprüfte Funktion create_reservation() (security definer).
-- Nur eingeloggte Admins dürfen Reservierungen sehen/verwalten.
drop policy if exists "reservations_admin_all" on public.reservations;
create policy "reservations_admin_all" on public.reservations
  for all to authenticated using (true) with check (true);

-- create_reservation für anonyme Besucher ausführbar machen
grant execute on function public.create_reservation(uuid, text, text, text) to anon, authenticated;

-- =====================================================================
--  SEED-DATEN (aktueller Demo-Stand — später im Admin erweiterbar)
-- =====================================================================
insert into public.products (sku, title, brand, category, price, stock, active, img, description, specs) values
 ('WMF-101',     'WMF Gourmet Plus Topf-Set 4-teilig',        'WMF',     'haushalt wmf',    249.00, 6,  true, 'assets/products/wmf_topfset.jpg',       'Das WMF Gourmet Plus Topfset vereint höchste Verarbeitungsqualität mit zeitloser Eleganz. Gefertigt aus rostfreiem Cromargan® Edelstahl 18/10 mit TransTherm®-Allherdboden.', 'Material: Cromargan® Edelstahl 18/10 | Inhalt: 3x Fleischtopf, 1x Bratentopf'),
 ('ROWENTA-301', 'Rowenta Silence Force Elektro-Staubsauger', 'Rowenta', 'elektro rowenta', 199.90, 4,  true, 'assets/stock/sortiment-elektro.jpg',    'Extrem leise und leistungsstark: Der Rowenta Silence Force vereint erstklassige Reinigungsleistung auf allen Böden mit flüsterleisem Betrieb.', 'Leistung: 750 Watt | Lautstärke: 57 dB(A) | Aktionsradius: 12 Meter'),
 ('RIESS-601',   'Riess Classic Emaille-Kasserolle 20cm',     'Riess',   'haushalt riess',   54.90, 8,  true, 'assets/products/riess_emaille.jpg',     'Traditionelles Emaille-Geschirr aus dem Mostviertel in Österreich. Ideal für schonendes Kochen, Braten und Servieren.', 'Material: Porzellan-Emaille auf Stahlkern | Durchmesser: 20 cm'),
 ('KAISER-501',  'Kaiser Inspiration Springform 26cm',        'Kaiser',  'backen kaiser',    29.95, 12, true, 'assets/products/kaiser_form.jpg',       'Hochwertige Backform für feinste Kuchen und Torten. Der auslaufsichere Rand verhindert ein Überlaufen im Backofen.', 'Durchmesser: 26 cm | Beschichtung: KeraVis 2-fach Antihaft')
on conflict (sku) do nothing;

insert into public.aktionen (title, type, valid_text, active, img, description, badge) values
 ('WMF Alt-gegen-Neu Eintauschaktion',        'angebot',  'Gültig bis 31. August 2026',        true, 'assets/products/wmf_topfset.jpg',    'Bringen Sie Ihr altes Kochgeschirr (egal welcher Marke) zu uns ins Fachgeschäft nach Mattsee und sichern Sie sich sofort 20% Eintausch-Rabatt auf ein neues WMF Topfset!', '-20% Eintausch-Rabatt auf WMF Topfsets'),
 ('Rowenta & Krups Elektro-Aktionswochen',    'angebot',  'Gültig bis 15. September 2026',     true, 'assets/stock/sortiment-elektro.jpg', 'Beim Kauf eines ausgewählten Rowenta oder Krups Elektrogeräts schenken wir Ihnen 30 € Direkt-Gutschrift an der Kassa in Mattsee.', '30 € Direkt-Gutschrift vor Ort'),
 ('Sommer-Kochgeschirr Aktionswochen',        'saisonal', 'Gültig solange der Vorrat reicht',  true, 'assets/products/riess_emaille.jpg',  'Zu jeder Riess Emaille Kasserolle oder WMF Gourmet-Pfanne erhalten Sie ein hochwertiges 3-teiliges Edelstahl-Silikon Küchenhelfer-Set gratis dazu.', 'Gratis Küchenhelfer-Set dazu')
on conflict do nothing;
