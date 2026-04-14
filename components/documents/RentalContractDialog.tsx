'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Home, Calendar, Euro, Shield, FileSignature, Sparkles, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface RentalContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenancyId: string
  propertyId?: string | null
}

interface RentalTerms {
  sqm: string
  rooms: string
  floor: string
  start_date: string
  contract_duration: 'unbefristet' | 'befristet'
  contract_end_date: string
  rent_cold: string
  utilities: string
  deposit: string
  notice_period_months: string
  rent_due_day: string
}

const emptyTerms: RentalTerms = {
  sqm: '',
  rooms: '',
  floor: '',
  start_date: '',
  contract_duration: 'unbefristet',
  contract_end_date: '',
  rent_cold: '',
  utilities: '',
  deposit: '',
  notice_period_months: '3',
  rent_due_day: '3',
}

// Parse "1.234,56" or "1234.56" or "1234" into number
const parseNum = (s: string): number | null => {
  if (!s) return null
  const normalized = s.replace(/\./g, '').replace(',', '.')
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : null
}

const fmtEuro = (n: number | null) => {
  if (n === null) return '—'
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €'
}

export function RentalContractDialog({ open, onOpenChange, tenancyId, propertyId }: RentalContractDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [terms, setTerms] = useState<RentalTerms>(emptyTerms)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [depositTouched, setDepositTouched] = useState(false)
  const [depositMultiplier, setDepositMultiplier] = useState<1 | 2 | 3>(3)
  const [templates, setTemplates] = useState<Array<{ id: string; name: string }>>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default')

  // Load user's mietvertrag templates
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/templates?type=mietvertrag')
        const { templates: list } = await res.json()
        if (!cancelled) setTemplates(list || [])
      } catch {
        // ignore
      }
    })()
    return () => { cancelled = true }
  }, [open])

  // Load existing tenancy data when dialog opens
  useEffect(() => {
    if (!open || !tenancyId) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data } = await supabase
        .from('tenancies')
        .select('sqm, rooms, floor, start_date, contract_duration, contract_end_date, rent_cold, utilities, deposit, notice_period_months, rent_due_day')
        .eq('id', tenancyId)
        .single()
      if (cancelled) return
      setTerms({
        sqm: data?.sqm != null ? String(data.sqm).replace('.', ',') : '',
        rooms: data?.rooms != null ? String(data.rooms).replace('.', ',') : '',
        floor: data?.floor || '',
        start_date: data?.start_date || '',
        contract_duration: (data?.contract_duration as 'unbefristet' | 'befristet') || 'unbefristet',
        contract_end_date: data?.contract_end_date || '',
        rent_cold: data?.rent_cold != null ? String(data.rent_cold).replace('.', ',') : '',
        utilities: data?.utilities != null ? String(data.utilities).replace('.', ',') : '',
        deposit: data?.deposit != null ? String(data.deposit).replace('.', ',') : '',
        notice_period_months: data?.notice_period_months != null ? String(data.notice_period_months) : '3',
        rent_due_day: data?.rent_due_day != null ? String(data.rent_due_day) : '3',
      })
      setDepositTouched(!!data?.deposit)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [open, tenancyId])

  // Derived values
  const rentCold = parseNum(terms.rent_cold)
  const utilities = parseNum(terms.utilities)
  const totalRent = rentCold !== null || utilities !== null ? (rentCold ?? 0) + (utilities ?? 0) : null
  const suggestedDeposit = rentCold !== null ? rentCold * depositMultiplier : null

  // Auto-suggest deposit = multiplier × Kaltmiete when user hasn't touched it
  useEffect(() => {
    if (!depositTouched && suggestedDeposit !== null) {
      setTerms(t => ({ ...t, deposit: suggestedDeposit.toFixed(2).replace('.', ',') }))
    }
  }, [suggestedDeposit, depositTouched])

  const handleSubmit = async () => {
    if (!rentCold) {
      toast.error('Bitte Kaltmiete angeben')
      return
    }
    setSubmitting(true)
    try {
      const rental_terms: Record<string, any> = {
        sqm: parseNum(terms.sqm),
        rooms: parseNum(terms.rooms),
        floor: terms.floor || null,
        start_date: terms.start_date || null,
        contract_duration: terms.contract_duration,
        contract_end_date: terms.contract_duration === 'befristet' ? terms.contract_end_date || null : null,
        rent_cold: rentCold,
        utilities: parseNum(terms.utilities),
        deposit: parseNum(terms.deposit),
        notice_period_months: parseInt(terms.notice_period_months) || 3,
        rent_due_day: parseInt(terms.rent_due_day) || 3,
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mietvertrag',
          tenancy_id: tenancyId,
          property_id: propertyId || null,
          rental_terms,
          ...(selectedTemplateId !== 'default' && { template_id: selectedTemplateId }),
        }),
      })
      const { document, error } = await res.json()
      if (error || !document) {
        toast.error('Fehler beim Erstellen: ' + (error || 'Unbekannt'))
        setSubmitting(false)
        return
      }
      toast.success('Mietvertrag erstellt — Daten gespeichert')
      onOpenChange(false)
      router.push(`/documents/${document.id}`)
    } catch (e) {
      toast.error('Fehler beim Erstellen')
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90dvh] overflow-y-auto p-0 w-full">
        {/* Header with brass accent */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass-400 via-brass-500 to-brass-400 rounded-t-xl" />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brass-50 dark:bg-brass-900/30 flex items-center justify-center shrink-0">
                <FileSignature className="h-5 w-5 text-brass-700 dark:text-brass-300" />
              </div>
              <div>
                <DialogTitle className="font-heading text-lg">Mietvertrag erstellen</DialogTitle>
                <DialogDescription className="text-xs">
                  Daten werden am Mietverhältnis gespeichert — auch für andere Dokumente nutzbar.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">Lade Daten…</div>
        ) : (
          <div className="px-4 sm:px-6 py-5 space-y-6">
            {/* Template Auswahl — nur anzeigen wenn der Nutzer eigene Vorlagen hat */}
            {templates.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-3.5 w-3.5 text-brass-600" />
                  <Label className="text-xs font-medium">Vorlage</Label>
                </div>
                <Select value={selectedTemplateId} onValueChange={(v) => v && setSelectedTemplateId(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Standard-Mietvertrag</SelectItem>
                    {templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Eigene Vorlagen erstellen Sie im Editor über das „Bookmark"-Symbol.
                </p>
              </div>
            )}

            {/* Mietobjekt */}
            <Section icon={Home} title="Mietobjekt" eyebrow="Abschnitt 1/4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Wohnfläche (m²)">
                  <Input
                    value={terms.sqm}
                    onChange={e => setTerms(t => ({ ...t, sqm: e.target.value }))}
                    placeholder="z.B. 72,5"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Zimmer">
                  <Input
                    value={terms.rooms}
                    onChange={e => setTerms(t => ({ ...t, rooms: e.target.value }))}
                    placeholder="z.B. 2,5"
                    inputMode="decimal"
                  />
                </Field>
              </div>
              <Field label="Stockwerk / Lage" hint="optional — z.B. '2. OG links'">
                <Input
                  value={terms.floor}
                  onChange={e => setTerms(t => ({ ...t, floor: e.target.value }))}
                  placeholder="2. OG links"
                />
              </Field>
            </Section>

            {/* Mietbeginn */}
            <Section icon={Calendar} title="Mietdauer" eyebrow="Abschnitt 2/4">
              <Field label="Mietbeginn">
                <Input
                  type="date"
                  value={terms.start_date}
                  onChange={e => setTerms(t => ({ ...t, start_date: e.target.value }))}
                />
              </Field>
              <Field label="Vertragsart">
                <Select
                  value={terms.contract_duration}
                  onValueChange={(v) => v && setTerms(t => ({ ...t, contract_duration: v as 'unbefristet' | 'befristet' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unbefristet">Unbefristet (empfohlen)</SelectItem>
                    <SelectItem value="befristet">Befristet (§ 575 BGB)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {terms.contract_duration === 'befristet' && (
                <Field label="Vertragsende">
                  <Input
                    type="date"
                    value={terms.contract_end_date}
                    onChange={e => setTerms(t => ({ ...t, contract_end_date: e.target.value }))}
                  />
                </Field>
              )}
              <Field label="Kündigungsfrist (Monate)" hint="gesetzlich 3 Monate für den Mieter">
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={terms.notice_period_months}
                  onChange={e => setTerms(t => ({ ...t, notice_period_months: e.target.value }))}
                />
              </Field>
            </Section>

            {/* Miete */}
            <Section icon={Euro} title="Miete & Nebenkosten" eyebrow="Abschnitt 3/4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kaltmiete (€ / Monat)" required>
                  <Input
                    value={terms.rent_cold}
                    onChange={e => setTerms(t => ({ ...t, rent_cold: e.target.value }))}
                    placeholder="z.B. 750,00"
                    inputMode="decimal"
                  />
                </Field>
                <Field label="Nebenkosten (€ / Monat)">
                  <Input
                    value={terms.utilities}
                    onChange={e => setTerms(t => ({ ...t, utilities: e.target.value }))}
                    placeholder="z.B. 180,00"
                    inputMode="decimal"
                  />
                </Field>
              </div>
              {totalRent !== null && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Gesamtmiete monatlich</span>
                  <span className="font-heading text-lg text-emerald-900 dark:text-emerald-100 whitespace-nowrap">{fmtEuro(totalRent)}</span>
                </div>
              )}
              <Field label="Fälligkeitstag" hint="Werktag im Monat, bis zu dem die Miete spätestens eingeht">
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={terms.rent_due_day}
                  onChange={e => setTerms(t => ({ ...t, rent_due_day: e.target.value }))}
                />
              </Field>
            </Section>

            {/* Kaution */}
            <Section icon={Shield} title="Kaution" eyebrow="Abschnitt 4/4">
              {/* Multiplikator-Auswahl */}
              <div className="space-y-1">
                <Label className="text-xs font-medium">Anzahl Kaltmieten</Label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setDepositMultiplier(m)
                        setDepositTouched(false)
                      }}
                      className={cn(
                        'flex-1 rounded-lg border py-2 text-sm font-medium transition-colors',
                        depositMultiplier === m
                          ? 'border-brass-500 bg-brass-50 dark:bg-brass-900/30 text-brass-800 dark:text-brass-200'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {m}×
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">Maximal 3 Monatskaltmieten (§ 551 BGB)</p>
              </div>

              <Field
                label="Kautionsbetrag (€)"
                hint={
                  suggestedDeposit !== null && !depositTouched
                    ? `Automatisch: ${fmtEuro(suggestedDeposit)} (${depositMultiplier}× Kaltmiete)`
                    : undefined
                }
              >
                <div className="relative">
                  <Input
                    value={terms.deposit}
                    onChange={e => { setTerms(t => ({ ...t, deposit: e.target.value })); setDepositTouched(true) }}
                    placeholder="z.B. 2.250,00"
                    inputMode="decimal"
                  />
                  {suggestedDeposit !== null && !depositTouched && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-brass-700 dark:text-brass-300 bg-brass-50 dark:bg-brass-900/40 px-1.5 py-0.5 rounded">
                      <Sparkles className="h-2.5 w-2.5" />
                      Auto
                    </div>
                  )}
                </div>
              </Field>
            </Section>
          </div>
        )}

        <DialogFooter className="px-4 sm:px-6 py-4 flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting} className="w-full sm:w-auto">
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading} className="gap-1.5 w-full sm:w-auto">
            {submitting ? 'Wird erstellt…' : (<><FileSignature className="h-4 w-4" /> Mietvertrag erstellen</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  icon: Icon,
  title,
  eyebrow,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brass-600 leading-none">{eyebrow}</p>}
          <h3 className="font-heading text-sm text-foreground leading-tight">{title}</h3>
        </div>
      </div>
      <div className={cn('space-y-3 pl-0 sm:pl-10')}>{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  )
}
