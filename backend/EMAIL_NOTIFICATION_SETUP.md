# E-Mail-Benachrichtigung bei neuer Reservierung (Setup)

Ziel: Sobald eine Reservierung reinkommt, geht automatisch eine E-Mail an
**loegl@sbg.at** – auch wenn niemand die Website offen hat. Kostenlos.

Ablauf: Neue Reservierung → Supabase-Datenbank-Webhook → Edge Function → Resend → E-Mail.

---

## Schritt 1 – Resend-Konto (E-Mail-Versand)
1. Auf **https://resend.com** registrieren – **wichtig: mit der E-Mail `loegl@sbg.at`**
   (im Gratis-Modus darf ohne eigene Domain nur an die eigene Konto-Adresse gesendet werden).
2. Postfach von loegl@sbg.at öffnen und die Bestätigungsmail von Resend anklicken.
3. In Resend links auf **API Keys** → **Create API Key** → Name z. B. `loegl` → **Add**.
4. Den Key (beginnt mit `re_…`) **kopieren** und kurz sicher zwischenspeichern.

## Schritt 2 – Edge Function in Supabase anlegen
1. Supabase-Dashboard → links **Edge Functions** → **Deploy a new function** (bzw. „Create a function").
2. Name: **`notify-reservation`**
3. Den kompletten Code aus [`edge-functions/notify-reservation/index.ts`](edge-functions/notify-reservation/index.ts)
   in den Editor einfügen (vorhandenen Beispielcode ersetzen).
4. **Deploy** klicken.

## Schritt 3 – Secrets (geheime Werte) setzen
1. Bei der Function **notify-reservation** → **Secrets** (bzw. Settings → Secrets / Environment).
2. Zwei Secrets anlegen:
   - Name `RESEND_API_KEY` → Wert: dein `re_…`-Key aus Schritt 1
   - Name `OWNER_EMAIL` → Wert: `loegl@sbg.at`
3. Speichern.

## Schritt 4 – Datenbank-Webhook (Auslöser)
1. Supabase-Dashboard → links **Database** → **Webhooks** → **Create a new hook**.
2. Einstellen:
   - **Name:** `neue-reservierung-mail`
   - **Table:** `reservations`
   - **Events:** nur **Insert** ankreuzen
   - **Type of hook / Method:** **Supabase Edge Functions**
   - **Edge Function:** `notify-reservation` auswählen
3. **Create webhook** / **Confirm**.

## Schritt 5 – Test
1. Über den Shop eine Test-Reservierung anlegen (Name + Telefon).
2. Innerhalb weniger Sekunden sollte eine E-Mail bei **loegl@sbg.at** ankommen
   (ggf. Spam-Ordner prüfen).

---

## Kosten
Resend Free-Tier: 3.000 E-Mails/Monat, 100/Tag – für einen Shop dieser Größe
dauerhaft **kostenlos**. Supabase Edge Functions & Webhooks sind im Free-Tier inklusive.

## Hinweise
- Ohne eigene Domain sendet Resend von `onboarding@resend.dev` **nur an loegl@sbg.at**
  (die Konto-Adresse). Das genügt für die Inhaber-Benachrichtigung.
- Willst du später von einer eigenen Adresse senden oder an mehrere Empfänger:
  Domain (z. B. loegl.at) in Resend verifizieren – dann ist der Absender frei wählbar.
- Der geheime Resend-Key liegt nur als Secret am Server (Edge Function), nie im Browser.
