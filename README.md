# Lögl Haus- & Küchengeräte · Mattsee

Demo-Website für **Lögl Mattsee** – Haus- & Küchengeräte seit 1914.
Statische Website (HTML/CSS/JS, kein Backend), inklusive **Click & Collect Shop**
und **Inhaber-Dashboard**. Alle Daten werden clientseitig im Browser
(`localStorage`) gehalten – ideal für eine Demo ohne Server.

> ⚠️ **Demo-Modus:** Alle Bestellungen, Reservierungen und Login-Daten sind
> Beispieldaten. Es werden keine echten Daten übertragen oder gespeichert.

## Seiten

| Seite | Datei | Beschreibung |
|-------|-------|--------------|
| Startseite | `index.html` | Hauptseite mit Sortiment-Überblick |
| Click & Collect | `click-and-collect.html` | Shop mit Artikel-Reservierung & Abhol-Code |
| Aktionen | `aktionen.html` | Aktuelle Angebote |
| News | `news.html` | Neuigkeiten |
| Kontakt | `kontakt.html` | Kontaktformular & Öffnungszeiten |
| Impressum / Datenschutz | `impressum.html`, `datenschutz.html` | Rechtliches |
| **Inhaber-Dashboard** | `admin/` | Produkt- & Aktionsverwaltung |

## Inhaber-Dashboard (Demo)

Erreichbar unter **`/admin/`**

- **Benutzername:** `admin`
- **Passwort:** `admin`

Im Dashboard lassen sich Produkte und Aktionen anlegen, bearbeiten und
aktivieren/deaktivieren. Änderungen wirken sich sofort auf den Click & Collect
Shop aus (gemeinsamer `localStorage`).

## Lokal starten

Da es sich um eine statische Website handelt, genügt ein einfacher Webserver:

```bash
python -m http.server 8099
```

Anschließend im Browser öffnen: `http://localhost:8099`

## Hosting

Die Seite kann direkt über **GitHub Pages** oder jeden statischen Webhost
ausgeliefert werden – keine Serverkonfiguration nötig.

---

© Fürst Systems – Demo für Lögl Mattsee
