# Immo Akte — Slim

Kostenlose Vermieter-App für Übergabeprotokolle, Mietverträge und
Wohnungsgeberbestätigungen. Läuft komplett im Browser, alle Daten
bleiben lokal im `localStorage` — kein Login, keine Cloud, kein Tracking.

## Features

- Mietverhältnisse anlegen + verwalten
- Einzugs- & Auszugsprotokolle mit Fotos, Zählerständen, Schlüsselübergabe
- Mietvertrag, Kautionsbescheinigung, Wohnungsgeberbestätigung mit
  automatischen Platzhaltern aus Stammdaten
- Digitale Unterschriften beider Parteien
- PDF-Export aller Dokumente
- JSON-Daten-Export aus dem Dashboard

## Lokal starten

```bash
npm install
npm run dev
```

Keine `.env`-Konfiguration nötig — die App braucht keine Backend-Services.

## Deploy

Lässt sich auf Vercel als statische Next.js-App deployen, ohne
Environment-Variablen oder Datenbank.

## Architektur

- **Datenhaltung:** `lib/local-store.ts` — schreibt nach `localStorage`
- **Auth:** synthetischer Lokal-User pro Browser, kein Login
- **Bilder:** als base64 Data-URLs inline in den Protokollen gespeichert
  (Browser-localStorage-Limit ~5–10 MB; bei sehr foto-reichen Protokollen
  irgendwann ein Thema)

## Voll-Version mit Supabase + Stripe

Liegt als eingefrorenes Archiv in einem Schwester-Repo. Siehe
[`ARCHIVE.md`](./ARCHIVE.md) für die Restart-Anleitung — speziell §12.8.
