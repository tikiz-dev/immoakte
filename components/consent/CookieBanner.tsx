'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { readConsent, writeConsent } from '@/lib/consent'

/**
 * Cookie-Banner — am Stil von weserbergland-dienstleistungen.de orientiert.
 * Breit, dunkel, am unteren Rand, drei Optionen: Akzeptieren / Nur notwendige
 * / Einstellungen anpassen. Dezent, konventionell, nicht aufdringlich.
 *
 * Wir laden GA nicht selbst — das macht <GoogleAnalyticsLoader />, der auf
 * Consent-Events reagiert. Hier nur die Zustimmungs-UI.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [details, setDetails] = useState(false)
  const [analyticsChoice, setAnalyticsChoice] = useState(false)

  useEffect(() => {
    // Kurz verzögern, damit nichts während der Hydration aufflackert.
    const t = setTimeout(() => {
      if (!readConsent()) setVisible(true)
    }, 400)
    return () => clearTimeout(t)
  }, [])

  function acceptAll() {
    writeConsent({ analytics: true })
    setVisible(false)
  }
  function rejectAll() {
    writeConsent({ analytics: false })
    setVisible(false)
  }
  function saveCustom() {
    writeConsent({ analytics: analyticsChoice })
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          role="dialog"
          aria-label="Cookie-Einwilligung"
          className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
        >
          <div className="mx-auto max-w-[1100px] rounded-2xl bg-ink-900 text-background shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:gap-10 gap-5">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    Wir verwenden Cookies, um die App zu verbessern.
                  </h2>
                  <p className="mt-2 text-sm text-background/70 leading-relaxed">
                    Technisch notwendige Daten bleiben ohne Einwilligung in
                    deinem Browser. Für anonymisierte Statistik via Google
                    Analytics benötigen wir deine Zustimmung. Du kannst sie
                    jederzeit in den{' '}
                    <Link
                      href="/cookie-einstellungen"
                      className="underline underline-offset-2 hover:text-background"
                    >
                      Cookie-Einstellungen
                    </Link>{' '}
                    widerrufen. Mehr in der{' '}
                    <Link
                      href="/datenschutz"
                      className="underline underline-offset-2 hover:text-background"
                    >
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>

                  {details && (
                    <div className="mt-6 space-y-3">
                      <CategoryRow
                        title="Notwendig"
                        text="Erforderlich für den Betrieb der App (Browser-Speicher für deine Mietverhältnisse, Routing)."
                        locked
                      />
                      <CategoryToggle
                        title="Statistik (Google Analytics 4)"
                        text="Anonymisierte Nutzungsdaten, damit wir die App verbessern können."
                        checked={analyticsChoice}
                        onChange={setAnalyticsChoice}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 lg:w-[260px] shrink-0">
                  {!details ? (
                    <>
                      <Button
                        size="lg"
                        onClick={acceptAll}
                        className="w-full bg-brass-400 text-ink-900 hover:bg-brass-300 shadow-brass font-semibold"
                      >
                        Alle akzeptieren
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={rejectAll}
                        className="w-full bg-transparent border-white/20 text-background hover:bg-white/10 hover:text-background"
                      >
                        Nur notwendige
                      </Button>
                      <button
                        type="button"
                        className="text-xs text-background/60 hover:text-background underline underline-offset-2 mt-2 self-center"
                        onClick={() => setDetails(true)}
                      >
                        Einstellungen anpassen
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="lg"
                        onClick={saveCustom}
                        className="w-full bg-brass-400 text-ink-900 hover:bg-brass-300 shadow-brass font-semibold"
                      >
                        Auswahl speichern
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={rejectAll}
                        className="w-full bg-transparent border-white/20 text-background hover:bg-white/10 hover:text-background"
                      >
                        Nur notwendige
                      </Button>
                      <button
                        type="button"
                        className="text-xs text-background/60 hover:text-background underline underline-offset-2 mt-2 self-center"
                        onClick={() => setDetails(false)}
                      >
                        Zurück
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CategoryRow({
  title,
  text,
  locked,
}: {
  title: string
  text: string
  locked?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-white/5 border border-white/10 p-4">
      <div>
        <div className="text-sm font-semibold text-background">{title}</div>
        <div className="text-xs text-background/60 mt-0.5">{text}</div>
      </div>
      <div className="shrink-0 text-xs font-semibold text-background/60 select-none">
        Aktiv{locked && ' (erforderlich)'}
      </div>
    </div>
  )
}

function CategoryToggle({
  title,
  text,
  checked,
  onChange,
}: {
  title: string
  text: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl bg-white/5 border border-white/10 p-4 cursor-pointer hover:bg-white/[0.07] transition-colors">
      <div>
        <div className="text-sm font-semibold text-background">{title}</div>
        <div className="text-xs text-background/60 mt-0.5">{text}</div>
      </div>
      <div className="shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`relative h-6 w-11 rounded-full transition-colors ${
            checked ? 'bg-brass-400' : 'bg-white/20'
          }`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </label>
  )
}
