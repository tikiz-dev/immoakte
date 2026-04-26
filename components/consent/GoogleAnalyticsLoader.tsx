'use client'

import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { useConsent } from '@/lib/consent'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

/**
 * Lädt das GA-Script ausschließlich, wenn:
 *  - eine Measurement-ID gesetzt ist UND
 *  - der Nutzer Statistik aktiv eingewilligt hat.
 *
 * Reagiert live auf `immoakte:consent-change` Events — wenn der Nutzer
 * auf der Cookie-Einstellungen-Seite seine Wahl ändert, lädt/entlädt
 * sich GA ohne Reload.
 */
export function GoogleAnalyticsLoader() {
  const { consent, hydrated } = useConsent()
  if (!hydrated) return null
  if (!GA_ID) return null
  if (!consent?.analytics) return null
  return <GoogleAnalytics measurementId={GA_ID} />
}
