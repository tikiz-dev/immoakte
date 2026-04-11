'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Check, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/layout/Header'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    description: 'Zum Kennenlernen',
    price: '0 €',
    period: null,
    count: '1 Protokoll',
    perProtocol: null,
    savings: null,
    features: [
      '1 Protokoll inklusive',
      'PDF-Export',
      'Digitale Signatur',
      'Fotos & Zählerstände',
    ],
    cta: 'Kostenlos starten',
    ctaVariant: 'outline' as const,
    href: '/login?mode=signup',
    priceKey: null,
    mode: null,
    popular: false,
  },
  {
    id: 'single',
    name: 'Einzeln',
    description: 'Ohne Abonnement',
    price: '9,99 €',
    period: 'pro Protokoll',
    count: '1 Protokoll',
    perProtocol: null,
    savings: null,
    features: [
      '1 Protokoll',
      'PDF-Export',
      'Digitale Signatur',
      'Fotos & Zählerstände',
      'Einmalzahlung',
    ],
    cta: 'Kaufen',
    ctaVariant: 'outline' as const,
    href: null,
    priceKey: 'NEXT_PUBLIC_STRIPE_PRICE_ONDEMAND',
    mode: 'payment' as const,
    popular: false,
  },
  {
    id: '10pack',
    name: '10er-Abo',
    description: 'Monatliches Abonnement',
    price: '19,99 €',
    period: 'pro Monat',
    count: '10 Protokolle / Monat',
    perProtocol: '2,00 €',
    savings: '80 %',
    features: [
      '10 Protokolle pro Monat',
      'PDF-Export',
      'Digitale Signatur',
      'Fotos & Zählerstände',
      'Monatlich kündbar',
    ],
    cta: 'Abo abschließen',
    ctaVariant: 'default' as const,
    href: null,
    priceKey: 'NEXT_PUBLIC_STRIPE_PRICE_10PACK',
    mode: 'subscription' as const,
    popular: true,
  },
  {
    id: '50pack',
    name: '50er-Abo',
    description: 'Monatliches Abonnement',
    price: '39,99 €',
    period: 'pro Monat',
    count: '50 Protokolle / Monat',
    perProtocol: '0,80 €',
    savings: '92 %',
    features: [
      '50 Protokolle pro Monat',
      'PDF-Export',
      'Digitale Signatur',
      'Fotos & Zählerstände',
      'Monatlich kündbar',
    ],
    cta: 'Abo abschließen',
    ctaVariant: 'outline' as const,
    href: null,
    priceKey: 'NEXT_PUBLIC_STRIPE_PRICE_50PACK',
    mode: 'subscription' as const,
    popular: false,
  },
]

export default function Pricing() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (priceKey: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      toast.error('Bitte melden Sie sich an, um ein Paket zu buchen.')
      return
    }
    const priceId = process.env[priceKey as keyof typeof process.env] as string
    try {
      setLoading(priceKey)
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode }),
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Weiterleiten zu Stripe.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-3">
            Preisübersicht
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto">
            Ein kostenloses Testprotokoll, ein Einzelkauf oder ein monatliches Abonnement – je nach Bedarf.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white shadow-sm ${
                plan.popular
                  ? 'border-primary border-2 shadow-md shadow-primary/10'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow whitespace-nowrap">
                    Meistgewählt
                  </span>
                </div>
              )}

              <div className={`p-6 flex flex-col flex-1 ${plan.popular ? 'pt-8' : ''}`}>

                {/* Name & description */}
                <div className="mb-4">
                  <h2 className="text-base font-bold text-slate-900">{plan.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-slate-400 text-sm ml-1.5">{plan.period}</span>
                  )}
                </div>

                {/* Per-protocol info with savings */}
                {plan.perProtocol ? (
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-xs text-slate-500">
                      = <span className="font-semibold text-slate-700">{plan.perProtocol} / Protokoll</span>
                    </span>
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                      -{plan.savings} günstiger
                    </span>
                  </div>
                ) : (
                  <div className="mb-5">
                    <span className="text-xs text-slate-400">{plan.count}</span>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.href ? (
                  <Link href={plan.href}>
                    <Button variant={plan.ctaVariant} className="w-full">{plan.cta}</Button>
                  </Link>
                ) : (
                  <Button
                    variant={plan.ctaVariant}
                    className="w-full"
                    onClick={() => plan.priceKey && plan.mode && handleSubscribe(plan.priceKey, plan.mode)}
                    disabled={loading === plan.priceKey}
                  >
                    {loading === plan.priceKey ? 'Lädt...' : plan.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-6 max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Mehr als 50 Protokolle pro Monat</p>
            <h3 className="text-lg font-semibold text-white">Individuelles Angebot</h3>
            <p className="text-slate-400 text-sm mt-1">
              Für Hausverwaltungen und Immobilienbüros erstellen wir ein passendes Angebot.
            </p>
          </div>
          <a href="mailto:hallo@protokoll-pro.de" className="shrink-0">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 font-medium gap-2">
              <Mail className="h-4 w-4" />
              Anfragen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Alle Preise zzgl. gesetzl. MwSt. · Abonnements monatlich kündbar
        </p>
      </main>
    </div>
  )
}
