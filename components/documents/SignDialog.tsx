'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SignaturePad } from './SignaturePad'
import { PenLine, Printer, ShieldCheck, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SignMode = 'handwritten' | 'digital'

export interface SignResult {
  mode: SignMode
  signatures: Record<string, string> // party → dataUrl
}

interface SignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  docType: string
  parties: Array<{ key: string; label: string; hint?: string }>
  onComplete: (result: SignResult) => Promise<void> | void
}

/**
 * Zweistufiger Signatur-Flow:
 * 1. Modus wählen (händisch / digital)
 * 2. Bei digital: für jede Partei ein Canvas
 * 3. Abschließen
 */
export function SignDialog({ open, onOpenChange, docType, parties, onComplete }: SignDialogProps) {
  const [step, setStep] = useState<'mode' | 'sign'>('mode')
  const [mode, setMode] = useState<SignMode | null>(null)
  const [signatures, setSignatures] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const isMietvertrag = docType === 'mietvertrag'
  const allSigned = parties.every(p => !!signatures[p.key])

  const reset = () => {
    setStep('mode')
    setMode(null)
    setSignatures({})
    setSubmitting(false)
  }

  const close = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  const pickMode = (m: SignMode) => {
    setMode(m)
    if (m === 'handwritten') {
      // Direkt abschließen, keine Canvas-Runde nötig
      void finalize('handwritten', {})
    } else {
      setStep('sign')
    }
  }

  const finalize = async (m: SignMode, sigs: Record<string, string>) => {
    setSubmitting(true)
    try {
      await onComplete({ mode: m, signatures: sigs })
      close(false)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className={cn(
        'max-h-[92vh] overflow-y-auto p-0',
        step === 'mode' ? 'sm:max-w-lg' : 'sm:max-w-2xl'
      )}>
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-border">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass-400 via-brass-500 to-brass-400 rounded-t-xl" />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brass-50 dark:bg-brass-900/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-brass-700 dark:text-brass-300" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="font-heading text-lg">
                  {step === 'mode' ? 'Dokument abschließen' : 'Digital unterschreiben'}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {step === 'mode'
                    ? 'Wie soll das Dokument unterzeichnet werden?'
                    : 'Alle Parteien unterschreiben nacheinander auf diesem Gerät.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {step === 'mode' ? (
          <div className="px-6 py-5 space-y-3">
            <ModeCard
              icon={Printer}
              title="Händisch auf Papier"
              description="PDF wird generiert mit leeren Unterschriftsfeldern. Sie drucken, unterschreiben und lassen händisch gegenzeichnen."
              recommended={isMietvertrag}
              recommendedReason={isMietvertrag ? 'Rechtssicher für Mietverträge > 1 Jahr (§ 550 BGB)' : undefined}
              onClick={() => pickMode('handwritten')}
            />
            <ModeCard
              icon={PenLine}
              title="Digital hier in der App"
              description="Beide Parteien unterschreiben direkt auf diesem Gerät (Finger, Maus, Stift). Ideal bei der Wohnungsübergabe vor Ort."
              recommended={!isMietvertrag}
              onClick={() => pickMode('digital')}
              warning={isMietvertrag ? 'Achtung: Für befristete Mietverträge oder Laufzeiten über 1 Jahr ist die Schriftform (§ 550 BGB) vorgeschrieben. Eine gezeichnete Signatur erfüllt nur die Textform — der Vertrag gilt dann als unbefristet.' : undefined}
            />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-5">
            <div className="rounded-xl border border-brass-200 bg-brass-50/50 dark:bg-brass-900/10 px-4 py-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-brass-700 shrink-0 mt-0.5" />
              <p className="text-xs text-brass-900 dark:text-brass-200 leading-relaxed">
                Jede Partei unterschreibt einzeln. Nach „Bestätigen" ist die Unterschrift gespeichert — mit „Zurücksetzen" können Sie neu zeichnen.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {parties.map(p => (
                <SignaturePad
                  key={p.key}
                  label={p.label}
                  hint={p.hint}
                  initialDataUrl={signatures[p.key]}
                  onSigned={(dataUrl) => setSignatures(s => ({ ...s, [p.key]: dataUrl }))}
                />
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4">
          {step === 'mode' ? (
            <Button variant="outline" onClick={() => close(false)}>Abbrechen</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep('mode')} className="gap-1.5" disabled={submitting}>
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
              <Button
                onClick={() => finalize('digital', signatures)}
                disabled={!allSigned || submitting}
                className="gap-1.5"
              >
                {submitting ? 'Schließt ab…' : (<>Abschließen<ArrowRight className="h-4 w-4" /></>)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ModeCard({
  icon: Icon,
  title,
  description,
  recommended,
  recommendedReason,
  warning,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  recommended?: boolean
  recommendedReason?: string
  warning?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border transition-all p-4 flex gap-3 items-start group',
        recommended
          ? 'border-ink-700 dark:border-ink-300 shadow-xs ring-1 ring-ink-700/5 hover:ring-ink-700/20'
          : 'border-border hover:border-brass-300 hover:bg-muted/30'
      )}
    >
      <div className={cn(
        'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
        recommended ? 'bg-ink-700 text-background' : 'bg-muted text-foreground/70'
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-heading text-sm text-foreground">{title}</span>
          {recommended && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brass-600 bg-brass-50 dark:bg-brass-900/30 px-1.5 py-0.5 rounded">
              Empfohlen
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground leading-snug">{description}</p>
        {recommendedReason && (
          <p className="text-[11px] text-ink-700 dark:text-ink-300 mt-1.5 italic">{recommendedReason}</p>
        )}
        {warning && (
          <div className="mt-2 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 px-2.5 py-1.5 flex gap-1.5">
            <AlertCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] text-destructive/90 leading-snug">{warning}</p>
          </div>
        )}
      </div>
    </button>
  )
}
