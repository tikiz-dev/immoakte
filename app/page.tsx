'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ClipboardCheck, ShieldCheck, Zap, Smartphone, Camera, FileSignature, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Landing() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  if (user) return null

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-white to-white" />
          <div className="mx-auto max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <ClipboardCheck className="h-3.5 w-3.5" /> 1. Protokoll kostenlos
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-tight">
              Professionelle Übergabe&shy;protokolle –{' '}
              <span className="text-primary">in wenigen Minuten.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              Mängel fotografieren, Zählerstände erfassen, digital unterschreiben.
              Fertig als rechtssicheres PDF – direkt auf dem Smartphone.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login?mode=signup">
                <Button size="lg" className="px-8">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" size="lg">Preise ansehen</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-100 bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-slate-900 mb-12">So einfach geht's</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: '1', icon: ClipboardCheck, title: 'Daten erfassen', desc: 'Mieter, Wohnung und Räume in wenigen Klicks anlegen.' },
                { step: '2', icon: Camera, title: 'Mängel dokumentieren', desc: 'Fotos aufnehmen, Zählerstände eintragen, Schlüssel notieren.' },
                { step: '3', icon: FileSignature, title: 'Unterschreiben & fertig', desc: 'Beide Parteien unterschreiben digital. PDF sofort verfügbar.' },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 sm:right-auto sm:-top-2 sm:left-12 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl grid gap-10 sm:grid-cols-3">
            {[
              { icon: Smartphone, title: 'Mobil optimiert', desc: 'Designed für die Nutzung vor Ort – ohne Laptop, ohne Papier.' },
              { icon: ShieldCheck, title: 'Rechtssicher', desc: 'Digitale Signaturen und lückenlose Dokumentation für den Streitfall.' },
              { icon: Zap, title: 'Sofort einsatzbereit', desc: 'Kein Download, kein Setup. Einfach anmelden und loslegen.' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-start">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <feature.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-primary px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Ihr erstes Protokoll ist kostenlos.</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-md mx-auto">
            Registrieren Sie sich jetzt und überzeugen Sie sich selbst – ohne Kreditkarte.
          </p>
          <div className="mt-8">
            <Link href="/login?mode=signup">
              <Button size="lg" variant="secondary" className="px-8">
                Jetzt kostenlos testen
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
