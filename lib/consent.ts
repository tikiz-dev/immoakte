'use client'

import { useEffect, useState } from 'react'

/**
 * Consent-State + Helpers — orientiert sich am Schwester-Projekt
 * weserbergland-dienstleistungen.de, damit beide Seiten dieselbe
 * UX/Mechanik nutzen.
 *
 * Speicherort: `localStorage` unter `immoakte_consent_v1`.
 * Re-Ask-Intervall: 12 Monate (TTDSG-konform).
 */

export type ConsentState = {
  analytics: boolean
  /** Timestamp der Entscheidung — nach ~12 Monaten erneut fragen. */
  decidedAt: number
}

const STORAGE_KEY = 'immoakte_consent_v1'
const RENEW_AFTER_MS = 1000 * 60 * 60 * 24 * 365 // 1 Jahr

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConsentState
    if (Date.now() - parsed.decidedAt > RENEW_AFTER_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeConsent(state: Omit<ConsentState, 'decidedAt'>) {
  if (typeof window === 'undefined') return
  const full: ConsentState = { ...state, decidedAt: Date.now() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
  window.dispatchEvent(new CustomEvent('immoakte:consent-change', { detail: full }))
}

export function clearConsent() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('immoakte:consent-change', { detail: null }))
}

/** Reaktiver Hook — hört auf Consent-Änderungen und triggert Re-Render. */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConsent(readConsent())
    setHydrated(true)
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ConsentState | null
      setConsent(detail)
    }
    window.addEventListener('immoakte:consent-change', handler)
    return () => window.removeEventListener('immoakte:consent-change', handler)
  }, [])

  return { consent, hydrated } as const
}
