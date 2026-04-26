'use client'

import { useEffect, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { readConsent, writeConsent, clearConsent } from '@/lib/consent'

export default function CookieSettingsPage() {
  const [analytics, setAnalytics] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const c = readConsent()
    setAnalytics(!!c?.analytics)
    setHydrated(true)
  }, [])

  function save() {
    writeConsent({ analytics })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function reset() {
    clearConsent()
    setAnalytics(false)
    setSaved(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-600 dark:text-brass-400 mb-3">
              Deine Wahl
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight text-foreground leading-[1.05]">
              Cookie-Einstellungen
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Du kannst deine Einwilligung jederzeit ändern oder widerrufen.
              Änderungen werden sofort wirksam.
            </p>
          </div>
        </section>

        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-3">
              <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 flex items-start justify-between gap-5">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    Notwendig
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Erforderlich für den Betrieb der App: Browser-Speicher
                    (<code className="text-xs">localStorage</code>) für deine
                    Mietverhältnisse, Routing, technische Sicherheits-Logs des
                    Hosters. Lassen sich nicht deaktivieren.
                  </p>
                </div>
                <div className="text-sm font-semibold text-muted-foreground shrink-0">
                  Aktiv
                </div>
              </div>

              <label className="flex items-start justify-between gap-5 rounded-2xl bg-card border border-border p-6 sm:p-8 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    Statistik (Google Analytics 4)
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Anonymisierte Nutzungsdaten, damit wir verstehen, welche
                    Funktionen geholfen haben und wo es hakt. IP-Adressen
                    werden anonymisiert, kein Cross-Device-Tracking, keine
                    Werbe-Personalisierung.
                  </p>
                </div>
                <div className="shrink-0">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => {
                      setAnalytics(e.target.checked)
                      setSaved(false)
                    }}
                    className="sr-only peer"
                    disabled={!hydrated}
                  />
                  <div
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      analytics ? 'bg-brass-500' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                        analytics ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button onClick={save} size="lg" className="h-11 px-5">
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Gespeichert
                  </>
                ) : (
                  'Auswahl speichern'
                )}
              </Button>
              <Button onClick={reset} size="lg" variant="outline" className="h-11 px-5">
                <RotateCcw className="h-4 w-4" />
                Einwilligung zurücksetzen
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
