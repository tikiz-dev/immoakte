'use client'

import { motion } from 'motion/react'
import { CheckCircle2, FileText, Download, Lock } from 'lucide-react'

/**
 * Signatur-Mockup: zeigt den Abschluss-Flow mit einer animiert
 * gezeichneten Unterschrift (stroke-dasharray). Wird in der Hero-
 * Carousel kurz eingeblendet — der Draw-Effekt spielt jedes Mal
 * neu ab, wenn der Screen sichtbar wird (weil motion beim Mount
 * animiert).
 */
export function SignatureMockup() {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* App header */}
      <div className="px-4 pt-3 pb-3 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Mietvertrag · § 11</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[9px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
            <Lock className="h-2.5 w-2.5" />Abgeschlossen
          </span>
        </div>
        <h2 className="font-heading text-[18px] leading-tight text-foreground">Unterschriften</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Beide Parteien bestätigt</p>
      </div>

      {/* Signature area */}
      <div className="flex-1 px-4 py-4 space-y-4 bg-muted/30">
        {/* Vermieter — continuous loop: draw → hold → erase → redraw */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Vermieter</p>
          <svg viewBox="0 0 240 56" className="w-full h-12 border-b border-foreground/70">
            <motion.path
              d="M 8 38 Q 18 14 30 32 T 58 30 Q 72 12 84 30 Q 96 48 110 28 T 142 28 Q 158 14 170 32 Q 184 48 200 30 T 232 32"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-900 dark:text-foreground"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, times: [0, 0.28, 0.85, 1], ease: 'easeInOut', repeat: Infinity }}
            />
          </svg>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-foreground font-medium">Özgür Tikiz</p>
            <p className="text-[9px] text-muted-foreground">15.04.2026, 14:32</p>
          </div>
        </div>

        {/* Mieter — same loop, offset by 0.9s */}
        <div className="bg-card rounded-xl border border-border p-3 shadow-xs">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Mieter</p>
          <svg viewBox="0 0 240 56" className="w-full h-12 border-b border-foreground/70">
            <motion.path
              d="M 10 36 Q 22 8 38 30 Q 54 50 70 24 T 102 34 Q 118 12 134 36 Q 150 48 164 26 T 198 30 Q 214 42 228 32"
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink-900 dark:text-foreground"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 6, times: [0, 0.28, 0.85, 1], ease: 'easeInOut', repeat: Infinity, delay: 0.9 }}
            />
          </svg>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] text-foreground font-medium">Sarah Meier</p>
            <p className="text-[9px] text-muted-foreground">15.04.2026, 14:33</p>
          </div>
        </div>

        {/* PDF success card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-emerald-900 dark:text-emerald-100 truncate">Mietvertrag_Meier.pdf</p>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80">9 Seiten · mit Signaturen</p>
          </div>
          <Download className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 shrink-0" />
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-3 border-t border-border bg-background flex items-center gap-2">
        <div className="flex-1 h-9 rounded-lg bg-emerald-500 text-white text-[12px] font-medium flex items-center justify-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          PDF herunterladen
        </div>
      </div>
    </div>
  )
}
