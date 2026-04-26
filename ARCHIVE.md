# Immo Akte — Projekt-Archiv

> **Status: eingestampft (April 2026).**
> Dieses Dokument konserviert alles, was außerhalb des Codes nur noch in
> Chat-Verläufen und Köpfen lebt — Kontext, Strategie, Entscheidungen,
> Personen, offene Threads. Wenn das Projekt jemals wiederbelebt wird,
> startet man hier.

---

## 1. Projekt-Identität

| Feld | Wert |
|---|---|
| **Produktname** | Immo Akte |
| **Vorgängername** | Protokoll-Pro (siehe Commit `4b26a0c` — Rebrand) |
| **Domain** | `immoakte.app` (gesichert; Markenrecherche zum Zeitpunkt des Stopps: keine Kollision gefunden, **DPMA-Anmeldung wurde nicht mehr durchgeführt**) |
| **Repo** | `github.com/tikiz-dev/immoakte` |
| **Branch zum Zeitpunkt des Stopps** | `main` @ `6c4ebec` (Speed up hero phone carousel rotation) |
| **Hosting** | Vercel (EU-Region, DSGVO) |
| **Backend** | Supabase |
| **Stack** | Next.js (App Router) + TypeScript + Tailwind + Framer Motion |
| **Brand-Look** | Seriös, dezent — Gold-Akzent („nicht zu verspielt, muss vertrauensvoll wirken"), nicht zu „kurdisch-glänzend" |
| **Logo-Status** | KI-generierter Entwurf in der App, Final-Logo war Martynas To-do — nicht abgeschlossen |

---

## 2. Team

| Person | Rolle | Anmerkung |
|---|---|---|
| **Öz** (otikiz) | Founder, Solo-Dev, Code-Lead | Eigentümer / Vollzeitjob + DAA + Energieberater-Schulung |
| **Carsten** | Co-Founder | Sollte Bugs/Features mit übernehmen — keine Kapazität |
| **Martyna** | Co-Founder | Logo, Flyer, Persona — keine Kapazität |

> Gegen Ende April 2026 hat Öz entschieden, alleine weiterzumachen — und
> dann das Projekt komplett einzustampfen, weil neben Vollzeitjob, eigener
> Reinigungsfirma (DAA) und Energieberater-Schulung schlicht keine Bandbreite blieb.

---

## 3. Zielgruppe & Use-Case (wie zuletzt definiert)

- **Primäre Persona:** Privatvermieter mit 1–5 Einheiten, 45–60 Jahre, hasst Papierkram
- **Sekundär:** kleine Hausverwaltungen
- **Explizit NICHT:** Mieter — Vermieter organisiert alles, Mieter bekommt nur Kopien
- **Versteckte Zielgruppe:** Wohnungsmieter mit eigener Auslandsimmobilie (z. B. Türkei) — schwer zu targeten, aber relevant
- **Jobs-to-be-done:**
  - Mietverträge erstellen (E-Sign-Lizenz war offen — bewusst nicht angeboten)
  - Übergabeprotokolle (Einzug/Auszug) digital
  - Schlüsselverwaltung
  - DSGVO-konforme Archivierung
  - Mieterkommunikation

---

## 4. Pricing-Modell (Stand ROADMAP.md)

| Plan | Preis | Inhalt |
|---|---|---|
| **Free / Test** | 0 € | 1 Protokoll einmalig, Basis-PDF |
| **On-Demand** | 9,90 € / Protokoll | Voller Funktionsumfang, kein Abo — Zielgruppe Privatvermieter |
| **Pro (Solo)** | 14,99 € / Monat | Volles Set + eigenes Logo + digitale Signatur + Cloud, **30–50 Protokolle/Monat** als Missbrauchsschutz |
| **Business** *(geplant)* | 39,90 € / Monat | 3 Nutzer-Lizenzen, Team-Verwaltung, API-Export |

---

## 5. Geplante Killer-Features (nicht umgesetzt)

- **KI-Zählerstand (OCR):** Strom/Wasser/Gas per Foto erkennen — wäre 2026 Standard gewesen
- **Team-Verwaltung:** Multi-User pro Account
- **API-Export:** ERP-/Hausverwalter-Software-Anbindung
- **Aktive DSGVO-Vermarktung:** „Bußgeld-Schutz" als Vertrauensanker
- **Internationalisierung:** Englisch + bis zu 40 Sprachen via KI (war Phase-6-Thema)

---

## 6. Was technisch fertig war (Commit-Historie als Beleg)

- Vollständige Landingpage mit Hero-Carousel + animierten Mockups
- Auth-Flow (Login, Passwort-Reset)
- Mietvertrags-Wizard mit eigenen Vorlagen, abschnittbasierter Editor
- Digitale Unterschriften (mit Modus-Wahl)
- DSGVO-Pflichtelemente: Vercel-EU, Consent, Self-Delete
- Datenexport, Widerrufsbelehrung, AVV, Speicherfristen
- Checkout-Confirm-Dialog mit Widerrufsverzicht
- Mobile-Optimierung
- Test-Agent-Prompt + `.bugs/` Reporting-Protokoll
- Modulare Komponenten-Struktur
- Hero-Carousel-Speed-Tuning (letzter Commit)

## Was offen blieb

- **Cookie-Banner** (war Top-Punkt im 14.04.-Meeting, nie eingebaut)
- **Markenanmeldung DPMA** (nur informelle Recherche)
- **DPMA/EU-IPO finale Prüfung**
- **Logo-Final**
- **Marketing/Persona** (im Gespräch erarbeitet, nie ausgeführt)
- **Social-Media-Kanäle** (Instagram/Facebook nie erstellt)
- **Pricing-Live-Schaltung** + Stripe-Anbindung jenseits Test
- **OCR-Zählerstand**
- **Empfehlungs-QR-Code in der App** (Idee aus dem 14.04.-Meeting)

---

## 7. Meeting-Historie

### Meeting 1 — 14.04.2026 (Öz + Carsten + Martyna)

**Kernfokus:** Marketingstrategie, Aufgabenverteilung, technische Weiterentwicklung. Wegkommen vom Lokal-Bias (Hameln) hin zu deutschlandweit.

**Beschlossene Themen:**
- Persona Buyer als nächster essenzieller Schritt
- Social Media: Instagram + Facebook zuerst, TikTok später
- Canva-Automation + Mockup-basierte Posts
- Gewinnspiele (Test-Abos) zur Datensammlung
- Flyer für Einfamilienhäuser
- DVG-Prinzip („Wer kennt wen") — nicht aggressiv
- In-App-Empfehlung mit QR-Code (Werber + Geworbener bekommen Freimonat)
- E-Mail-Marketing **verworfen** wegen Abmahn-/DSGVO-Risiko
- Internationalisierung später via KI-Übersetzung

**Aufgabenverteilung (To-dos):**
- Martyna: Logo + Flyer-Design
- Martyna: Persona Bias + Konkurrenz-/Marktpotenzialanalyse
- Öz: Komplette Code-Seite, Bugfixing, Domain-Verfügbarkeit, Marken-Vorprüfung
- Alle: App testen + Bug-Reports in WhatsApp-Gruppe „Bugs"

**Nächster Termin** war **25.04.2026, 16:00 Uhr** — fand de-facto nicht produktiv statt, weil Carsten + Martyna keine Kapazität hatten.

### Meeting 2 — 25./26.04.2026 (Öz alleine, Entscheidung)

- Carsten + Martyna hatten keine Zeit
- Öz hat versucht, das Projekt solo weiterzuführen
- **Entscheidung:** Projekt einstampfen — neben Vollzeitjob, DAA und Energieberater-Schulung nicht stemmbar

---

## 8. Solo-Go-To-Market-Plan (final ausgearbeitet, **nicht ausgeführt**)

> Konserviert für den Fall, dass Öz oder ein anderer das Projekt
> wiederbelebt. Annahme war: ~5–10 h/Woche solo.

### Leitprinzipien

1. Automatisierung vor Fleiß
2. Traffic vor Umsatz (erste 90 Tage)
3. Bundesweit denken, lokal testen (Hameln als Test-Lab)
4. Build in Public (Solo-Dev-Story als Gratis-Marketing)
5. Eine Zielgruppe, ein Use-Case

### Phasen

| Phase | Dauer | Ziel |
|---|---|---|
| **0 — Foundation** | Wo 1–2 (~10 h) | Cookie-Banner, Impressum/DSE/AGB, Marken-Anmeldung DPMA (~290 €), Logo final, Analytics (Plausible/PostHog), Beta-Disclaimer |
| **1 — Persona & Positionierung** | Wo 2 (~6 h) | 1 Persona, 3 Konkurrenten analysiert (Hausmagazin, Vermietet.de, Smartlandlord), One-Liner-Pitch, Schmerzpunkte aus FB-Gruppen sammeln |
| **2 — Content-Maschine** | Wo 3–4 (~12 h einmalig + 2 h/Wo) | N8N-Pipeline Insta+FB, 5 Canva-Templates, Mockup-Pack (8–10 Screens), Reels-Skript, 5 Content-Pillars |
| **3 — Soft Launch** | Wo 5–6 (~8 h) | DVG-Mindmap solo, FB-Vermietergruppen, Reddit (r/Finanzen, r/Immobilien), 200 Flyer Hameln, In-App-QR-Empfehlung live |
| **4 — Feedback-Loop** | Wo 7–10 fortlaufend | 14-tägige Beta-Calls, In-App-NPS, Bug-Triage, A/B-Tests, erste Pricing-Hypothese |
| **5 — Bezahlte Reichweite** | ab Wo 11, nur wenn Conversion ≥ 5 % & Retention ≥ 30 % | Meta Ads 5 €/Tag, Google-Search-Ads, Mikro-Influencer |
| **6 — Skalierung** | Q3 2026+ | TikTok, B2B-Hausverwaltungen, E-Sign-Lizenz, AT/CH, dann EN |

### KPI-Ziele

| Phase | Metrik | Ziel |
|---|---|---|
| 0–1 | Landing-Page-Visits | 200/Woche |
| 2 | Sign-up-Conversion | ≥ 5 % |
| 3 | Beta-Tester aktiv | 50 |
| 4 | 14-Tage-Retention | ≥ 30 % |
| 5 | CAC | < 15 € |
| 6 | Zahlende Nutzer | 100 |

### Wöchentlicher Solo-Rhythmus (vorgeschlagen)

| Tag | Slot | Aufgabe |
|---|---|---|
| Mo Abend | 1 h | Content-Pipeline füttern |
| Mi Abend | 1 h | DMs / Community-Engagement |
| Sa Vormittag | 2–3 h | Bugfix + Feature-Sprint |
| So Abend | 30 min | Wochen-Review (KPIs) |

**Hartes Limit:** > 6 h/Wochenende → Plan ist kaputt (zu manuell oder zu unklar).

### Tooling-Stack (alles solo-tauglich)

- Code: Next.js + Supabase
- Analytics: Plausible / PostHog
- Content: Canva Pro + Mockuuups Studio + Buffer (oder N8N → Meta-API)
- Automation: N8N
- Feedback: Tally Forms + Calendly
- Issues: Linear (Free) / GitHub Issues
- Knowledge: Notion

---

## 9. Verworfene Optionen (mit Begründung)

| Option | Warum verworfen |
|---|---|
| **B2B/B2C E-Mail-Marketing** | DSGVO + Abmahnrisiko — selbst gekaufte Leads sind verbrannt |
| **Lokal-Marketing als Hauptkanal** | Reichweite zu klein; ab Insta nur deutschlandweit denken |
| **TikTok in Phase 1** | Content-Aufwand zu hoch für Solo-Setup |
| **E-Sign sofort** | Erfordert Lizenz, nur 2 zugelassene Verfahren — auf später verschoben |
| **Pricing live ohne Validierung** | Erst Retention ≥ 30 % nachweisen, dann Pricing-Test |

---

## 10. Reactivation-Notes — was bräuchte es für einen Restart?

Wenn Öz (oder jemand anderes) das Projekt wieder aufgreifen will:

1. **Repo läuft sofort:** `npm install && npm run dev`. `.env.local` neu befüllen (Supabase-Keys, Gemini-Key — siehe `.env.example`).
2. **Erster harter Tag:** Cookie-Banner + Impressum/DSE/AGB einbauen. Vorher kein öffentlicher Launch.
3. **Markenrecherche & DPMA-Anmeldung** als Allererstes — bevor man Reichweite aufbaut, sollte die Marke sicher sein.
4. **Co-Founder-Frage ehrlich stellen:** Solo geht nur mit aggressiver Automatisierung — sonst wieder erstickt es im Alltag.
5. **Phasenplan oben (§ 8) ist die Blaupause** — Phase 0 reicht für den ersten Monat.
6. **Bestehende Beta-Tester-Liste:** existierte nicht, weil nie öffentlich gelaunched wurde. Persönliches Netzwerk ist der erste Anlauf.
7. **Domain `immoakte.app`** verlängern, falls noch im Besitz. Sonst neu registrieren — war zum Stop-Zeitpunkt frei.
8. **Lessons Learned dieses Versuchs:**
   - Ein Trio ohne klare Stundenverpflichtung skaliert nicht — entweder bezahlte Rollen oder Solo
   - Nicht erst die App komplett bauen und dann Marketing nachschieben — Marketing-Kanal-Aufbau parallel zum letzten Code-Drittel starten
   - Persona-Definition gehört VOR die ersten UI-Entscheidungen, nicht erst nach dem Launch

---

## 11. Wo sonst noch Spuren liegen

- `ROADMAP.md` — Pricing & Killer-Features (Original-Snapshot)
- `README.md` — minimaler Setup-Hinweis
- `TEST_AGENT_PROMPT.md` — automatisierter Test-Agent-Prompt
- `.bugs/` — Bug-Report-Sammlung aus Test-Durchläufen
- `_src_old/` — Vorgängerversion vor Redesign (Commit `fa0a532`)
- WhatsApp-Gruppen: Haupt-Gruppe „Immo Akte" + „Bugs"-Gruppe (nicht im Repo)
- Apple Notes (Öz' Aufzeichnungen)

---

---

## 12. Technische Konservierung — was beim Mothballing entfernt wird

Im April 2026 wurde die Live-Variante so umgebaut, dass sie **ohne Supabase
und ohne Stripe** läuft (alle Daten im Browser-Cache). Damit ein späterer
Restart nicht von vorne raten muss, hier alles, was rausgeflogen ist:

### 12.1 Environment-Variablen (Original-Setup vor Mothball)

```env
# Supabase (entfernt)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Stripe (entfernt)
STRIPE_SECRET_KEY=sk_live_… / sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_… / pk_test_…

# Stripe-Preis-IDs (in DEINEM Stripe-Dashboard angelegt — IDs hier nie eingecheckt)
NEXT_PUBLIC_STRIPE_PRICE_ONDEMAND=price_…   # 9,99 € einmalig pro Protokoll
NEXT_PUBLIC_STRIPE_PRICE_10PACK=price_…     # 19,99 €/Monat, 10 Protokolle
NEXT_PUBLIC_STRIPE_PRICE_50PACK=price_…     # 39,99 €/Monat, 50 Protokolle

# Gemini (für KI-Features wie OCR-Zähler — war geplant, nie ausgerollt)
GEMINI_API_KEY=…
```

### 12.2 Pricing-Modell, das in `app/pricing/page.tsx` live war

| Plan | Preis | Stripe-Mode | Inhalt |
|---|---|---|---|
| **Gratis** | 0 € | — (kein Checkout) | 1 Protokoll abschließen, alle Vorlagen lesen |
| **Flex** | 9,99 € | `payment` (einmalig) | 1 Protokoll on-demand, kein Abo |
| **Standard** *(meistgewählt)* | 19,99 €/Monat | `subscription` | 10 Protokolle/Monat, alle Vorlagen, monatlich kündbar |
| **Pro** | 39,99 €/Monat | `subscription` | 50 Protokolle/Monat, Prioritäts-Support |
| **Enterprise** | individuell | mailto: hallo@immoakte.app | > 50 Protokolle, Onboarding |

Alle Pläne enthielten: Mietverhältnisse verwalten, Einzugs-/Auszugsprotokolle,
PDF-Export, digitale Unterschriften beider Parteien, Fotos & Zählerstände.

### 12.3 Stripe-Checkout-Flow (Compliance war eingebaut)

1. Nutzer klickt Plan → `CheckoutConfirmDialog` öffnet (Button-Lösung § 312j BGB)
2. Nutzer bestätigt **AGB**, **Widerrufsbelehrung**, **Widerrufsverzicht** (§ 356 Abs. 5 BGB)
3. POST `/api/stripe/checkout` → Stripe-Session mit `customer_email`, `metadata.userId`, ggf. `metadata.protocolId`
4. Redirect auf Stripe Checkout
5. Webhook `/api/stripe/webhook` empfängt `checkout.session.completed`:
   - `subscription` → `users.subscription_status = 'active'`, `users.stripe_customer_id` setzen
   - `payment` mit `protocolId` → einzelnes Protokoll auf `final` setzen
6. `customer.subscription.deleted` → `subscription_status = 'cancelled'`

Beta-Mode-Schalter: `app_settings.beta_mode = 'true'` ließ alle Checkouts
auf `/beta` umleiten — fürs Pre-Launch-Marketing gedacht.

### 12.4 Auth-Flow (Supabase Auth)

- E-Mail+Passwort + Google OAuth (`signInWithOAuth({ provider: 'google' })`)
- Cookie-basierte Session via `@supabase/ssr` Middleware (`middleware.ts` → `lib/supabase/middleware.ts`)
- Bei Signup: `terms_accepted_at` in `raw_user_meta_data` → DB-Trigger `handle_new_user()` legt `users`-Profil an
- Admin-Rolle: hardcoded für `info@weserbergland-dienstleistungen.de` im Trigger
- Forgot-Password / Reset-Password Flow via Supabase Magic Link
- Account-Löschung: `/api/account/delete` → `supabaseAdmin.auth.admin.deleteUser(userId)` (kaskadiert via `ON DELETE CASCADE`)
- DSGVO-Export: `/api/account/export` → ZIP mit allen User-Daten

### 12.5 Vollständiges DB-Schema (10 Migrations)

Liegt in `supabase/migrations/001_initial.sql` … `010_document_signatures.sql`.
**Kurzfassung der Tabellen:**

```
users               (id, email, name, company, role['user'|'admin'], stripe_customer_id,
                     subscription_status, street, house_number, zip_code, city,
                     phone, email_contact, iban, bank_name, created_at)
properties          (id, owner_id→users, address, street, house_number, zip_code, city)
tenancies           (id, owner_id, property_id, tenant_salutation/first/last/email/phone,
                     tenant_street/house_number/zip_code/city,
                     start_date, end_date,
                     rent_cold, utilities, deposit, sqm, rooms, floor,
                     contract_duration['unbefristet'|'befristet'], contract_end_date,
                     notice_period_months, rent_due_day)
protocols           (id, tenancy_id, property_id, owner_id, type['Einzug'|'Auszug'],
                     status['draft'|'final'], date, finalized_at,
                     tenant_salutation/first/last/email/phone, linked_protocol_id,
                     rooms jsonb, meters jsonb, keys jsonb,
                     general_condition, tenant_new_address, witnesses,
                     landlord_signature, tenant_signature)
documents           (id, owner_id, tenancy_id, protocol_id, property_id, template_id,
                     name, type['wohnungsgeberbestaetigung'|'mietvertrag'|
                              'kautionsbescheinigung'|'sonstiges'],
                     content text, status['draft'|'final'], finalized_at, pdf_url,
                     tenant_salutation/first/last/email,
                     signature_mode['handwritten'|'digital'], signatures jsonb)
document_templates  (id, owner_id, name, type, content, is_default)
feedback            (id, user_id, type['bug'|'feature'|'error'], message, error_details,
                     url, image_url, status['new'|'resolved'])
app_settings        (key text PK, value text)   -- z.B. beta_mode='true'/'false'
```

**RLS-Pattern überall:** `owner_id = auth.uid()` — User sieht nur eigene Daten.
**Admin-Bypass:** `public.is_admin()` als SECURITY DEFINER Function.

**Storage-Buckets:**
- `feedback` (public): Screenshots aus Bug-Reports
- `protocol-images` (private, ab Migration 007): Fotos in Übergabeprotokollen, Pfad-Format `{user_id}/...`

**Wichtige RPC-Function:**
- `finalize_protocol(p_protocol_id, p_owner_id)` — atomar mit `FOR UPDATE`-Lock,
  prüft ob User Abo hat (`subscription_status='active'`) ODER ob er sein
  Gratis-Protokoll noch nicht verbraucht hat. Returnt `{error:'payment_required'}`
  wenn Limit erreicht, sonst setzt `status='final'`.

### 12.6 API-Routes (alle Supabase-/Stripe-gestützt)

```
GET    /api/health                      → einfacher Liveness-Check
GET    /api/tenancies                   → alle Mietverhältnisse + Properties
POST   /api/tenancies                   → neues Mietverhältnis + Property anlegen
GET    /api/tenancies/[id]              → Detail + Protokolle + Dokumente
PATCH  /api/tenancies/[id]              → Update mit strikter Allowlist (kein owner_id)
DELETE /api/tenancies/[id]
POST   /api/duplicate-tenancy           → Mietverhältnis klonen (für Auszug)
GET    /api/documents                   → alle Dokumente, optional ?tenancy_id
POST   /api/documents                   → neues Dokument
GET    /api/documents/[id]
PATCH  /api/documents/[id]
DELETE /api/documents/[id]
GET    /api/templates                   → eigene Templates, optional ?type
POST   /api/templates
PATCH  /api/templates/[id]
DELETE /api/templates/[id]
POST   /api/finalize                    → ruft RPC finalize_protocol
POST   /api/protocol/save-pdf           → PDF nach Storage hochladen
POST   /api/stripe/checkout             → Stripe Checkout Session
POST   /api/stripe/webhook              → Stripe Webhook-Handler
GET    /api/account/export              → DSGVO-Datenexport ZIP
POST   /api/account/delete              → Account + alle Daten löschen
GET    /api/admin/users                 → Admin: alle User
PATCH  /api/admin/users
GET    /api/admin/feedback
PATCH  /api/admin/feedback
GET    /api/admin/settings              → app_settings Tabelle
PATCH  /api/admin/settings              → z.B. Beta-Mode an/aus
```

### 12.7 Komponenten/Pages, die rückbaubar sind

- `app/login/page.tsx` — E-Mail/Passwort + Google-Login
- `app/forgot-password/page.tsx` — Magic Link
- `app/reset-password/page.tsx` — Passwort-Reset
- `app/beta/page.tsx` — Pre-Launch-Wartelistenseite
- `app/admin/page.tsx` — Admin-Dashboard (User, Feedback, Settings)
- `app/feedback/page.tsx` — Bug-Report-Formular
- `app/pricing/page.tsx` — siehe 12.2
- `components/checkout/CheckoutConfirmDialog.tsx` — Compliance-Dialog vor Stripe
- `components/account/DeleteAccountDialog.tsx` — DSGVO-Account-Löschung
- `components/FeedbackButton.tsx` — Floating Bug-Report-Button
- `contexts/AuthContext.tsx` — `useAuth()` Hook
- `lib/supabase/{client,server,middleware}.ts` — SSR-Wrapper
- `middleware.ts` — globaler Session-Refresh

### 12.8 Restart-Anleitung (vom Mothball-Stand zurück zur Vollversion)

1. **Supabase-Projekt anlegen**, alle Migrations aus `supabase/migrations/` einspielen
2. `.env.local` mit allen 12.1 Variablen befüllen
3. `npm install @supabase/ssr @supabase/supabase-js stripe @stripe/stripe-js`
4. Aus dem Backup-Branch `lib/supabase/`, `contexts/AuthContext.tsx`, `middleware.ts`, `app/api/`, `app/login`, `app/admin`, `app/pricing`, `app/forgot-password`, `app/reset-password`, `app/beta`, `app/feedback`, `components/checkout/` zurückspielen
5. Stripe-Produkte + Preise im Dashboard anlegen, IDs in env eintragen
6. Stripe-Webhook auf `https://<deine-domain>/api/stripe/webhook` zeigen, Signing-Secret in env
7. **Datenmigration:** ein Mini-Skript schreiben, das aus `localStorage` die JSON-Snapshots liest und in Supabase importiert (Felder mappen `tenancies`, `protocols`, `documents`, `document_templates`).

> Backup vor dem Mothballing: liegt bei Öz lokal als Kopie (nicht im Repo).

---

*Letzter Eintrag: April 2026 — Öz, im Alleingang, beim Einstampfen.*
*Wenn jemand das hier liest und das Ding wieder aufmacht: viel Glück.* 🍀
