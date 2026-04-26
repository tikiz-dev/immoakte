'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTenancy } from '@/lib/local-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Loader2, User, Home, Check } from 'lucide-react'

export default function NewTenancy() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    tenant_salutation: 'Herr',
    tenant_first_name: '',
    tenant_last_name: '',
    tenant_email: '',
    tenant_phone: '',
    tenant_street: '',
    tenant_house_number: '',
    tenant_zip_code: '',
    tenant_city: '',
    street: '',
    house_number: '',
    zip_code: '',
    city: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }

    setLoading(true)
    try {
      const { tenancy } = createTenancy(form)
      toast.success('Mietverhältnis angelegt')
      router.push(`/tenancy/${tenancy.id}`)
    } catch (err: any) {
      toast.error('Fehler: ' + (err.message || 'Unbekannter Fehler'))
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { label: 'Mieter', icon: User },
    { label: 'Immobilie', icon: Home },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">Neues Mietverhältnis</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 motion-page-in">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => {
            const Icon = s.icon
            const done = i + 1 < step
            const active = i + 1 === step
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    done ? 'bg-emerald-500 text-white' :
                    active ? 'bg-ink-700 text-background ring-4 ring-ink-700/20' :
                    'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`mb-5 h-px w-20 mx-3 transition-all ${done ? 'bg-emerald-400' : 'bg-border'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-ink p-6 md:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600 mb-1">
              Schritt {step} von {steps.length}
            </p>
            <h1 className="font-heading text-2xl text-foreground">
              {step === 1 ? 'Mieterdaten' : 'Immobilie'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? 'Diese Angaben werden in alle Dokumente automatisch eingesetzt.'
                : 'Adresse der vermieteten Wohnung oder des Hauses.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Anrede</Label>
                    <Select value={form.tenant_salutation} onValueChange={v => { if (v) set('tenant_salutation', v) }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Herr">Herr</SelectItem>
                        <SelectItem value="Frau">Frau</SelectItem>
                        <SelectItem value="Divers">Divers</SelectItem>
                        <SelectItem value="Firma">Firma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Vorname</Label>
                    <Input required placeholder="Max" value={form.tenant_first_name}
                      onChange={e => set('tenant_first_name', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nachname</Label>
                    <Input required placeholder="Mustermann" value={form.tenant_last_name}
                      onChange={e => set('tenant_last_name', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>E-Mail <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                    <Input type="email" placeholder="max@beispiel.de" value={form.tenant_email}
                      onChange={e => set('tenant_email', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefon <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                    <Input type="tel" placeholder="+49 123 456789" value={form.tenant_phone}
                      onChange={e => set('tenant_phone', e.target.value)} />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-3">
                    Aktuelle Adresse des Mieters <span className="normal-case font-normal">(optional, für Mietvertrag)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Straße</Label>
                      <Input placeholder="Hauptstraße" value={form.tenant_street}
                        onChange={e => set('tenant_street', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hausnr.</Label>
                      <Input placeholder="5b" value={form.tenant_house_number}
                        onChange={e => set('tenant_house_number', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1.5">
                      <Label>PLZ</Label>
                      <Input placeholder="12345" value={form.tenant_zip_code}
                        onChange={e => set('tenant_zip_code', e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Ort</Label>
                      <Input placeholder="Musterstadt" value={form.tenant_city}
                        onChange={e => set('tenant_city', e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <AddressAutocomplete
                  onAddressSelect={(addr) => setForm(f => ({
                    ...f,
                    street: addr.street,
                    house_number: addr.houseNumber,
                    zip_code: addr.zipCode,
                    city: addr.city,
                  }))}
                />
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Straße</Label>
                    <Input required placeholder="Musterstraße" value={form.street}
                      onChange={e => set('street', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Hausnr.</Label>
                    <Input required placeholder="1a" value={form.house_number}
                      onChange={e => set('house_number', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>PLZ</Label>
                    <Input required placeholder="12345" value={form.zip_code}
                      onChange={e => set('zip_code', e.target.value)} />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Ort</Label>
                    <Input required placeholder="Musterstadt" value={form.city}
                      onChange={e => set('city', e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-2">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Zurück
                </Button>
              ) : <div />}
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 1 ? (
                  <>Weiter <ArrowRight className="h-4 w-4" /></>
                ) : (
                  'Mietverhältnis anlegen'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
