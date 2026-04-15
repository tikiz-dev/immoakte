import { Home, Plus, Search, FileText, CheckCircle2, Clock } from 'lucide-react'

/**
 * Dashboard-Mockup für die Landingpage-Hero.
 * Zeigt eine gefüllte Akten-Liste, so wie Nutzer sie nach ein paar Wochen sehen.
 */
export function DashboardMockup() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* App header */}
      <div className="px-4 pt-3 pb-3 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brass-600">ImmoAkte</span>
        </div>
        <h2 className="font-heading text-[20px] leading-tight text-foreground">Meine Akten</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">4 Mietverhältnisse · 2 aktiv</p>
      </div>

      {/* Search + add */}
      <div className="px-4 py-3 border-b border-border flex gap-2">
        <div className="flex-1 h-8 rounded-lg bg-muted flex items-center gap-1.5 px-2.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">Mieter suchen…</span>
        </div>
        <button className="h-8 w-8 rounded-lg bg-ink-700 text-background flex items-center justify-center">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-border flex gap-1 text-[11px]">
        <span className="px-2.5 py-1 rounded-full bg-ink-900 text-background font-medium">Alle <span className="opacity-60">4</span></span>
        <span className="px-2.5 py-1 rounded-full text-muted-foreground">Aktiv <span className="opacity-60">2</span></span>
        <span className="px-2.5 py-1 rounded-full text-muted-foreground">Abgeschlossen</span>
      </div>

      {/* Tenancy cards */}
      <div className="flex-1 overflow-hidden px-4 py-3 space-y-2.5 bg-muted/30">
        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] font-semibold text-emerald-700 dark:text-emerald-200">SM</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">Sarah Meier</p>
              <p className="text-[10px] text-muted-foreground truncate">Ringstraße 8, Hannover</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">Aktiv</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />Mietvertrag</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />Einzug</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />Kaution</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-full bg-brass-100 dark:bg-brass-900/40 flex items-center justify-center text-[10px] font-semibold text-brass-700 dark:text-brass-200">MM</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">Max Mustermann</p>
              <p className="text-[10px] text-muted-foreground truncate">Musterstraße 12, Hameln</p>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brass-50 dark:bg-brass-900/30 text-brass-700 dark:text-brass-300 font-medium">Einzug</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />Mietvertrag</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brass-50 text-brass-700 dark:bg-brass-900/30 dark:text-brass-300 inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Protokoll offen</span>
          </div>
        </div>

        <div className="bg-card/70 rounded-xl border border-border p-3 shadow-xs opacity-90">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] font-semibold text-stone-600 dark:text-stone-300">AB</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">Anna Bergmann</p>
              <p className="text-[10px] text-muted-foreground truncate">Gartenstraße 12, Hannover</p>
            </div>
            <FileText className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Bottom stat */}
      <div className="px-4 py-2.5 border-t border-border bg-background flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Home className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">4 Akten · 12 Dokumente</span>
        </div>
        <span className="text-[10px] font-medium text-brass-600">Heute</span>
      </div>
    </div>
  )
}
