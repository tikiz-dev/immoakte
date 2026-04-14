-- Digitale Signaturen: Modus + Metadaten pro unterschreibender Partei.
-- Die eigentlichen PNG-DataURLs werden direkt ins content HTML eingefügt;
-- hier nur Mode/Zeitstempel für Audit-Trail.

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS signature_mode text DEFAULT 'handwritten',
  ADD COLUMN IF NOT EXISTS signatures jsonb DEFAULT '{}'::jsonb;

-- signature_mode: 'handwritten' | 'digital'
-- signatures: { vermieter?: { signed_at, name }, mieter?: { signed_at, name } }
