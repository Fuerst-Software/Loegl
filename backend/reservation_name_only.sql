-- =====================================================================
--  LÖGL Mattsee · Reservierung nur über Name + Telefon
--  (keine E-Mail-Pflicht, kein Abhol-Code)
--  Im Supabase SQL-Editor ausführen: New query -> einfügen -> Run.
-- =====================================================================

-- 1) Felder optional machen (E-Mail & Abhol-Code nicht mehr erforderlich)
alter table public.reservations alter column customer_email drop not null;
alter table public.reservations alter column pickup_code    drop not null;

-- 2) Alte Funktion (mit E-Mail + Code) entfernen
drop function if exists public.create_reservation(uuid, text, text, text);

-- 3) Neue Funktion: nur Name + Telefon, prüft Lager & zieht 1 ab (atomar)
create or replace function public.create_reservation(
  p_product_id uuid,
  p_name       text,
  p_phone      text
)
returns table (product_title text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock integer;
  v_title text;
begin
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

  update public.products set stock = stock - 1 where id = p_product_id;

  insert into public.reservations (product_id, product_title, customer_name, customer_phone)
  values (p_product_id, v_title, p_name, p_phone);

  return query select v_title;
end;
$$;

grant execute on function public.create_reservation(uuid, text, text) to anon, authenticated;
