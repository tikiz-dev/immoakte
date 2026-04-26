'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTenancy, updateTenancy } from '@/lib/local-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddressAutocomplete } from '@/components/AddressAutocomplete'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function EditTenancy() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

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

  useEffect(() => {
    const tenancy = getTenancy(id)
    if (!tenancy) { toast.error('Nicht gefunden'); router.push('/dashboard'); return }
    const prop = tenancy.properties
    setForm({
      tenant_salutation: tenancy.tenant_salutation || 'Herr',
      tenant_first_name: tenancy.tenant_first_name || '',
      tenant_last_name: tenancy.tenant_last_name || '',
      tenant_email: tenancy.tenant_email || '',
      tenant_phone: tenancy.tenant_phone || '',
      tenant_street: tenancy.tenant_street || '',
      tenant_house_number: tenancy.tenant_house_number || '',
      tenant_zip_code: tenancy.tenant_zip_code || '',
      tenant_city: tenancy.tenant_city || '',
      street: prop?.street || '',
      house_number: prop?.house_number || '',
      zip_code: prop?.zip_code || '',
      city: prop?.city || '',
    })
    setInitialLoading(false)
  }, [id])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const ok = updateTenancy(id, form)
      if (!ok) throw new Error('Nicht gefunden')
      toast.success('Änderungen gespeichert')
      router.push(`/tenancy/${id}`)
    } catch (err: any) {
      toast.error('Fehler: ' + (err.message || 'Unbekannter Fehler'))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Lade Daten…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-2xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/tenancy/${id}`)} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">Mietverhältnis bearbeiten</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 motion-page-in">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mieter-Sektion */}
          <div className="bg-card rounded-3xl border border-border shadow-ink p-6 md:p-8 space-y-5">
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600 mb-1">Abschnitt 1</p>
              <h2 className="font-heading text-xl text-foreground">Mieter</h2>
            </div>

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
          </div>

          {/* Immobilien-Sektion */}
          <div className="bg-card rounded-3xl border border-border shadow-ink p-6 md:p-8 space-y-5">
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600 mb-1">Abschnitt 2</p>
              <h2 className="font-heading text-xl text-foreground">Immobilie</h2>
            </div>

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
          </div>

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => router.push(`/tenancy/${id}`)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
