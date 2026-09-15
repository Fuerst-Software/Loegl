# Lögl Mattsee · Backend-Setup (Supabase)

Einmalige Einrichtung. Dauert ~10 Minuten. Danach wire ich das Frontend an.

## 1. Supabase-Projekt anlegen
1. Auf **https://supabase.com** ein kostenloses Konto erstellen.
2. **New Project** → Name z. B. `loegl-mattsee`.
3. **Region: `Central EU (Frankfurt)`** wählen (wichtig für DSGVO / österreichische Kundendaten).
4. Ein Datenbank-Passwort vergeben (aufschreiben/speichern – wird selten gebraucht).
5. Projekt erstellen lassen (~2 Min.).

## 2. Datenbank-Schema einspielen
1. Im Projekt links auf **SQL Editor** → **New query**.
2. Den kompletten Inhalt von [`schema.sql`](schema.sql) hineinkopieren.
3. **Run** klicken. → Tabellen, Sicherheitsregeln und Demo-Daten sind angelegt.

## 3. Admin-Benutzer anlegen
1. Links auf **Authentication** → **Users** → **Add user** → **Create new user**.
2. E-Mail + Passwort für den Inhaber-Login vergeben (das ersetzt `admin/admin`).
3. Häkchen **Auto Confirm User** setzen.

## 4. Bild-Speicher einrichten
1. Links auf **Storage** → **New bucket**.
2. Name: `product-images`, **Public bucket** aktivieren → erstellen.

## 5. Zugangsdaten kopieren und mir schicken
1. Links auf **Project Settings** (Zahnrad) → **API**.
2. Kopiere zwei Werte:
   - **Project URL** (z. B. `https://xxxx.supabase.co`)
   - **anon public** API-Key (der lange Schlüssel unter „Project API keys" → `anon` `public`)

> ⚠️ Schick mir **nur** die **Project URL** und den **anon public**-Key.
> Den **`service_role`**-Key und das **Datenbank-Passwort** NIEMALS weitergeben –
> die bleiben geheim. Der `anon`-Key ist für den Browser gedacht und durch die
> Sicherheitsregeln (Row Level Security) abgesichert.

## Danach übernehme ich:
- Frontend (Shop, Aktionen, Startseite, Admin-Dashboard) an Supabase anbinden
- Echten Admin-Login statt `admin/admin`
- Bild-Upload im Admin ans Storage anbinden
- Alles lokal am Live-Server testen (Reservierung → Lagerbestand → Abhol-Code → Admin sieht Reservierung)

## Kosten
Free-Tier: 500 MB Datenbank, 1 GB Bilder, unbegrenzte API-Aufrufe. Für ~15 Produkte
und ~5 Angebote **dauerhaft kostenlos**. Erst bei sehr viel mehr Daten: Pro-Plan 25 $/Monat
(inkl. täglicher Backups – für ein Kundenprojekt später evtl. empfehlenswert).
