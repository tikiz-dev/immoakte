'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { listTemplates, deleteTemplate } from '@/lib/local-store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Bookmark, FileSignature, Home, Key, FileText, Trash2, Clock, Plus, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { toast } from 'sonner'

interface Template {
  id: string
  name: string
  type: string
  content: string
  created_at: string
  updated_at: string
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  mietvertrag:               { label: 'Mietvertrag',               icon: FileSignature, color: 'text-brass-700 bg-brass-50' },
  wohnungsgeberbestaetigung: { label: 'Wohnungsgeberbestätigung',  icon: Home,          color: 'text-ink-700 bg-ink-50' },
  kautionsbescheinigung:     { label: 'Kautionsbescheinigung',     icon: Key,           color: 'text-emerald-700 bg-emerald-50' },
  sonstiges:                 { label: 'Sonstiges',                 icon: FileText,      color: 'text-muted-foreground bg-muted' },
  contract_section:          { label: 'Vertragsabschnitt',         icon: Bookmark,      color: 'text-stone-700 bg-stone-100' },
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [toDelete, setToDelete] = useState<Template | null>(null)

  useEffect(() => {
    setTemplates(listTemplates() as Template[])
    setLoading(false)
  }, [])

  const confirmDelete = () => {
    if (!toDelete) return
    const ok = deleteTemplate(toDelete.id)
    if (!ok) { toast.error('Fehler beim Löschen'); return }
    setTemplates(prev => prev.filter(t => t.id !== toDelete.id))
    setToDelete(null)
    toast.success('Vorlage gelöscht')
  }

  // Group by type
  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    (acc[t.type] ||= []).push(t)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-4xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">Einstellungen</p>
            <h1 className="font-heading text-lg text-foreground leading-tight">Eigene Vorlagen</h1>
          </div>
          {!loading && (
            <span className="text-xs text-muted-foreground">{templates.length} {templates.length === 1 ? 'Vorlage' : 'Vorlagen'}</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8 motion-page-in">
        {/* Info card */}
        <div className="relative overflow-hidden bg-card rounded-3xl border border-border shadow-ink p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass-400 via-brass-500 to-brass-400" />
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brass-50 flex items-center justify-center shrink-0">
              <Bookmark className="h-5 w-5 text-brass-700" />
            </div>
            <div>
              <h2 className="font-heading text-base text-foreground">Ihre persönlichen Vorlagen</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Passen Sie einen Mietvertrag oder eine andere Vorlage einmal exakt so an, wie Sie es brauchen,
                und speichern Sie ihn per „Bookmark"-Symbol im Editor als eigene Vorlage. Bei jedem neuen Mietverhältnis
                können Sie dann auf Ihre Vorlagen zurückgreifen — Mieterdaten und Mietbedingungen werden automatisch eingefügt.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Lade Vorlagen…</div>
        ) : templates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <Bookmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-heading text-foreground">Noch keine eigenen Vorlagen</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Öffnen Sie einen Mietvertrag oder ein anderes Dokument und klicken Sie auf das Bookmark-Symbol, um es als Vorlage zu speichern.
            </p>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Zum Dashboard
            </Button>
          </div>
        ) : (
          Object.entries(grouped).map(([type, list]) => {
            const meta = TYPE_META[type] || TYPE_META.sonstiges
            const Icon = meta.icon
            return (
              <section key={type} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${meta.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading text-base text-foreground">{meta.label}</h2>
                  <span className="text-xs text-muted-foreground">· {list.length}</span>
                </div>
                <div className="space-y-2">
                  {list.map(tpl => (
                    <div key={tpl.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:border-brass-300/60 hover:shadow-xs transition-all">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{tpl.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(tpl.updated_at), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        </div>
                      </div>
                      <button
                        className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => setToDelete(tpl)}
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vorlage löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie die Vorlage „{toDelete?.name}" wirklich löschen?
              Bestehende Dokumente sind nicht betroffen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>Abbrechen</Button>
            <Button variant="destructive" onClick={confirmDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
