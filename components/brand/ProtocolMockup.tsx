import { Check, Home, Key, Zap, ChevronRight, FileSignature, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * A fake but authentic-looking protocol screen, rendered inside a PhoneFrame.
 * Layout mirrors the real /protocol/[id] flow.
 */
export function ProtocolMockup() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* App header */}
      <div className="px-4 pt-3 pb-3 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Einzugsprotokoll</span>
        </div>
        <h2 className="font-heading text-[18px] leading-tight text-foreground">Max Mustermann</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Musterstraße 12, 31785 Hameln</p>
      </div>

      {/* Progress stepper */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1">
          {['Räume', 'Zähler', 'Schlüssel', 'Signatur'].map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full ${i < 2 ? 'bg-ink-700' : i === 2 ? 'bg-brass-400' : 'bg-muted'}`} />
              <span className={`text-[9px] font-medium ${i <= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Room cards */}
      <div className="flex-1 overflow-hidden px-4 py-3 space-y-2.5 bg-muted/30">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">Räume · 3/5 erfasst</p>

        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Wohnzimmer</span>
            </div>
            <Badge variant="final" size="sm"><Check className="h-2.5 w-2.5" />OK</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Keine Mängel</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Küche</span>
            </div>
            <Badge variant="alert" size="sm"><AlertCircle className="h-2.5 w-2.5" />Mangel</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug">Fliesenfuge beschädigt am Spülbecken</p>
          <div className="mt-2 flex gap-1">
            <div className="h-10 w-10 rounded bg-muted" />
            <div className="h-10 w-10 rounded bg-muted" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Schlafzimmer</span>
            </div>
            <Badge variant="final" size="sm"><Check className="h-2.5 w-2.5" />OK</Badge>
          </div>
        </div>

        <div className="bg-card/60 rounded-xl border border-dashed border-border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-sm">Badezimmer</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-4 py-3 border-t border-border bg-background">
        <div className="flex gap-2">
          <button className="flex-1 h-9 rounded-lg bg-ink-700 text-background text-xs font-medium flex items-center justify-center gap-1.5">
            Weiter zu Zählern
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
