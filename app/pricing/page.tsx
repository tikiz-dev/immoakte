'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Building2, Zap, Star } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const HIGHLIGHTS = [
  { icon: Building2, title: 'Mietverhältnisse', desc: 'Mieter, Immobilien und Verträge an einem Ort verwalten.' },
  { icon: Zap, title: 'Übergabeprotokolle', desc: 'Einzug und Auszug digital — mit Fotos, Zählerständen und Unterschriften.' },
  { icon: Star, title: 'Rechtliche Dokumente', desc: 'Mietvertrag, Wohnungsgeberbestätigung, Kautionsbescheinigung — automatisch befüllt.' },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20 sm:py-28 border-b border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-600 dark:text-brass-400 mb-3">
              Open Beta
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground leading-[1.05] mb-5">
              Komplett kostenlos.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Keine Anmeldung. Keine Cloud. Keine Werbung. Alle Daten bleiben in deinem Browser.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-6 shadow-ink gap-2">
                  Jetzt loslegen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="h-10 w-10 rounded-xl bg-brass-50 dark:bg-brass-900/30 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-brass-700 dark:text-brass-300" />
                  </div>
                  <h2 className="font-heading text-lg text-foreground mb-1">{title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <p className="mt-12 text-center text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Open für Tester. Kein Login, kein Tracking, kein Bezahlsystem. Daten lassen sich als JSON-Export sichern.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
