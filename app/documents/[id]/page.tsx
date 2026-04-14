'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentEditor } from '@/components/DocumentEditor'
import { SignDialog, type SignResult } from '@/components/documents/SignDialog'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, Download, CheckCircle2, FileText,
  Tag, Trash2, AlertCircle, Lock, X, BookmarkPlus,
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { PLACEHOLDER_LABELS } from '@/lib/document-templates'

const TYPE_LABELS: Record<string, string> = {
  wohnungsgeberbestaetigung: 'Wohnungsgeberbestätigung',
  mietvertrag: 'Mietvertrag',
  kautionsbescheinigung: 'Kautionsbescheinigung',
  sonstiges: 'Leeres Dokument',
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()

  const [doc, setDoc] = useState<any>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [showPlaceholders, setShowPlaceholders] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [saveTplOpen, setSaveTplOpen] = useState(false)
  const [tplName, setTplName] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)
  const [signOpen, setSignOpen] = useState(false)

  useEffect(() => {
    if (!user) { router.replace('/login'); return }
    fetch(`/api/documents/${id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(({ document, error }) => {
        if (error) { toast.error('Dokument nicht gefunden'); router.replace('/dashboard'); return }
        setDoc(document)
        setName(document.name)
        setContent(document.content)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Dokument konnte nicht geladen werden')
        router.replace('/dashboard')
      })
  }, [id, user])

  const save = useCallback(async (opts?: { finalize?: boolean; contentOverride?: string; signatures?: any; signatureMode?: string }) => {
    setSaving(true)
    const updates: any = { name, content: opts?.contentOverride ?? content }
    if (opts?.finalize) {
      updates.status = 'final'
      updates.finalized_at = new Date().toISOString()
      if (opts.signatureMode) updates.signature_mode = opts.signatureMode
      if (opts.signatures) updates.signatures = opts.signatures
    }
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      setIsDirty(false)
      if (opts?.contentOverride) setContent(opts.contentOverride)
      if (opts?.finalize) {
        setDoc((prev: any) => ({
          ...prev,
          status: 'final',
          finalized_at: updates.finalized_at,
          signature_mode: updates.signature_mode ?? prev.signature_mode,
          signatures: updates.signatures ?? prev.signatures,
        }))
        toast.success('Dokument abgeschlossen')
      } else {
        toast.success('Gespeichert')
      }
    } else {
      toast.error('Fehler beim Speichern')
    }
    setSaving(false)
  }, [id, name, content])

  /** Embeds signature images into the HTML content at markers like <div data-signature="vermieter"> */
  const embedSignatures = (html: string, sigs: Record<string, string>): string => {
    if (typeof window === 'undefined') return html
    const doc = new DOMParser().parseFromString(html, 'text/html')
    Object.entries(sigs).forEach(([key, dataUrl]) => {
      const markers = doc.querySelectorAll(`[data-signature="${key}"]`)
      markers.forEach(el => {
        el.innerHTML = `<img src="${dataUrl}" alt="Unterschrift ${key}" style="max-height:56px;max-width:200px;display:block;margin:0;" />`
      })
    })
    return doc.body.innerHTML
  }

  const handleSignComplete = async (result: SignResult) => {
    if (result.mode === 'handwritten') {
      await save({ finalize: true, signatureMode: 'handwritten', signatures: {} })
      return
    }
    // Digital: embed images into content
    const signedAt = new Date().toISOString()
    const newContent = embedSignatures(content, result.signatures)
    const meta = Object.keys(result.signatures).reduce<Record<string, any>>((acc, key) => {
      acc[key] = { signed_at: signedAt }
      return acc
    }, {})
    await save({
      finalize: true,
      contentOverride: newContent,
      signatureMode: 'digital',
      signatures: meta,
    })
  }

  const signParties = useMemo(() => {
    const hasTenant = !!doc?.tenant_first_name
    if (doc?.type === 'kautionsbescheinigung' || doc?.type === 'wohnungsgeberbestaetigung') {
      return [{ key: 'vermieter', label: 'Vermieter / Vermieterin', hint: 'Ihre Unterschrift' }]
    }
    return [
      { key: 'vermieter', label: 'Vermieter / Vermieterin', hint: 'Ihre Unterschrift' },
      { key: 'mieter', label: 'Mieter / Mieterin', hint: hasTenant ? `${doc?.tenant_first_name || ''} ${doc?.tenant_last_name || ''}`.trim() : 'Unterschrift Mieter' },
    ]
  }, [doc?.type, doc?.tenant_first_name, doc?.tenant_last_name])

  const handleDelete = async () => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Fehler beim Löschen'); return }
    setShowDeleteDialog(false)
    toast.success('Dokument gelöscht')
    router.push('/dashboard')
  }

  const downloadPDF = async () => {
    toast.loading('PDF wird erstellt…', { id: 'doc-pdf' })
    try {
      await save()

      const html2pdf = (await import('html2pdf.js')).default
      const container = document.createElement('div')
      container.style.cssText = 'width:210mm;padding:20mm;font-family:"Geist Variable",Helvetica,Arial,sans-serif;font-size:11pt;line-height:1.65;color:#1c1917;background:#fff'
      container.innerHTML = content

      const style = document.createElement('style')
      style.textContent = `
        h1 { font-family: "Instrument Serif", Georgia, serif; font-size: 22pt; font-weight: 400; margin: 0 0 5mm 0; color: #1c1917; letter-spacing: -0.01em; }
        h2 { font-size: 12pt; font-weight: 600; margin: 7mm 0 2.5mm 0; border-bottom: 1px solid #e7e5e4; padding-bottom: 1.5mm; color: #1c1917; letter-spacing: 0.01em; }
        h3 { font-size: 11pt; font-weight: 600; margin: 5mm 0 2mm 0; color: #1c1917; }
        p { margin: 0 0 3mm 0; }
        hr { border: none; border-top: 1px solid #e7e5e4; margin: 5mm 0; }
        strong { font-weight: 600; color: #1c1917; }
        em { color: #78716c; font-style: italic; }
        ul, ol { margin: 0 0 3mm 5mm; padding: 0; }
        li { margin: 0 0 1.5mm 0; }
        table { width: 100%; border-collapse: collapse; margin: 3mm 0; page-break-inside: avoid; }
        td { padding: 1.5mm 0; vertical-align: top; }
        div[style*="background"] { page-break-inside: avoid; border-radius: 1mm; }
        /* Prevent orphaned signatures */
        table[style*="margin-top:48px"] { page-break-inside: avoid; margin-top: 15mm !important; }
      `
      container.prepend(style)
      document.body.appendChild(container)

      const filename = `${name.replace(/\s+/g, '_')}.pdf`
      await html2pdf().set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(container).save()

      document.body.removeChild(container)
      toast.success('PDF heruntergeladen', { id: 'doc-pdf' })
    } catch {
      toast.error('Fehler beim Erstellen der PDF', { id: 'doc-pdf' })
    }
  }

  const saveAsTemplate = async () => {
    if (!tplName.trim()) { toast.error('Bitte Namen angeben'); return }
    setSavingTpl(true)
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tplName.trim(), type: doc.type, content }),
      })
      const { template, error } = await res.json()
      if (error || !template) { toast.error('Fehler: ' + (error || 'Unbekannt')); setSavingTpl(false); return }
      toast.success(`Vorlage "${template.name}" gespeichert`)
      setSaveTplOpen(false)
      setTplName('')
    } catch {
      toast.error('Fehler beim Speichern der Vorlage')
    } finally {
      setSavingTpl(false)
    }
  }

  const insertPlaceholder = (ph: string) => {
    const withPh = content + `<p>${ph}</p>`
    setContent(withPh)
    setIsDirty(true)
    toast.info(`Platzhalter eingefügt: ${ph}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Lade Dokument…
      </div>
    </div>
  )

  const isFinalized = doc?.status === 'final'

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(doc?.tenancy_id ? `/tenancy/${doc.tenancy_id}` : '/dashboard')} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-brass-50 text-brass-700 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              {isFinalized ? (
                <p className="font-medium text-foreground text-sm truncate">{name}</p>
              ) : (
                <Input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setIsDirty(true) }}
                  className="h-7 text-sm font-medium border-0 shadow-none px-0 focus-visible:ring-0 bg-transparent max-w-[320px]"
                />
              )}
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.12em] font-semibold">{TYPE_LABELS[doc?.type] || doc?.type}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isFinalized ? (
              <Badge variant="final" size="sm" className="hidden sm:inline-flex"><Lock className="h-3 w-3" />Abgeschlossen</Badge>
            ) : (
              <>
                {/* Platzhalter: icon-only on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlaceholders(v => !v)}
                  className={showPlaceholders ? 'bg-brass-50 text-brass-700' : ''}
                  title="Platzhalter"
                >
                  <Tag className="h-4 w-4" />
                </Button>
                {/* Als Vorlage speichern */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setTplName(`Meine ${TYPE_LABELS[doc?.type] || 'Vorlage'}`); setSaveTplOpen(true) }}
                  title="Als eigene Vorlage speichern"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
                {/* Save: icon-only on mobile */}
                <Button variant="outline" size="icon" onClick={() => save()} disabled={saving || !isDirty} title="Speichern">
                  <Save className="h-4 w-4" />
                </Button>
                {/* Finalize: opens sign dialog */}
                <Button
                  size="sm"
                  onClick={async () => {
                    if (isDirty) await save()
                    setSignOpen(true)
                  }}
                  disabled={saving}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{saving ? 'Speichert…' : 'Abschließen'}</span>
                </Button>
              </>
            )}
            {/* PDF: icon-only on mobile */}
            <Button variant="outline" size="icon" onClick={downloadPDF} title="PDF herunterladen">
              <Download className="h-4 w-4" />
            </Button>
            {!isFinalized && (
              <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mietvertrag warning */}
      {doc?.type === 'mietvertrag' && !isFinalized && (
        <div className="bg-brass-50 border-b border-brass-200">
          <div className="mx-auto max-w-5xl px-4 py-2.5 flex items-center gap-2 text-brass-800 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span><strong className="font-medium">Rechtlicher Hinweis:</strong> Bitte lassen Sie diesen Mietvertrag vor Unterzeichnung von einem Rechtsanwalt prüfen.</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Meta chips */}
        {(doc?.tenant_first_name || doc?.finalized_at) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {doc.tenant_first_name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs">
                <span className="text-muted-foreground">Mieter</span>
                <span className="font-medium text-foreground">{doc.tenant_first_name} {doc.tenant_last_name}</span>
              </span>
            )}
            {doc.finalized_at && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                <CheckCircle2 className="h-3 w-3" />
                {format(new Date(doc.finalized_at), 'dd. MMMM yyyy', { locale: de })}
              </span>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* Paper */}
          <div className="relative">
            <div
              className="relative bg-card rounded-sm shadow-[0_30px_60px_-20px_rgba(28,25,23,0.18),0_10px_20px_-12px_rgba(28,25,23,0.1)] border border-border overflow-hidden"
              style={{ minHeight: '60vh' }}
            >
              {/* Left margin ribbon for that legal-pad feel */}
              <div className="absolute top-0 bottom-0 left-12 w-px bg-brass-200/60 pointer-events-none" aria-hidden="true" />
              {/* Subtle paper grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25% 25%, rgba(28,25,23,0.3) 0, transparent 50%), radial-gradient(circle at 75% 75%, rgba(28,25,23,0.3) 0, transparent 50%)',
                  backgroundSize: '40px 40px, 60px 60px',
                }}
              />

              {isFinalized ? (
                <div
                  className="prose prose-stone prose-sm max-w-none px-10 md:px-16 py-12 md:py-14 relative"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="relative">
                  <DocumentEditor
                    content={content}
                    onChange={(html) => { setContent(html); setIsDirty(true) }}
                  />
                </div>
              )}
            </div>

            {isDirty && !isFinalized && (
              <p className="text-xs text-muted-foreground mt-3 text-center flex items-center justify-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass-500 animate-pulse" />
                Ungespeicherte Änderungen
              </p>
            )}
          </div>

          {/* Placeholder side panel (desktop) */}
          {showPlaceholders && !isFinalized && (
            <aside className="lg:w-72 bg-card rounded-2xl border border-border shadow-xs p-5 h-fit lg:sticky lg:top-20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">Einfügen</p>
                  <h3 className="font-heading text-lg text-foreground mt-0.5">Platzhalter</h3>
                </div>
                <button
                  onClick={() => setShowPlaceholders(false)}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted flex items-center justify-center"
                  aria-label="Schließen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Diese Felder werden beim nächsten Dokument automatisch befüllt.
              </p>
              <div className="space-y-1.5">
                {Object.entries(PLACEHOLDER_LABELS).map(([ph, label]) => (
                  <button
                    key={ph}
                    onClick={() => insertPlaceholder(ph)}
                    className="group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:border-ink-200 hover:bg-muted/40 transition-all text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="text-[11px] font-mono text-brass-700 bg-brass-50 px-1.5 py-0.5 rounded">{ph}</code>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
                    </div>
                    <span className="text-muted-foreground group-hover:text-foreground text-sm shrink-0">+</span>
                  </button>
                ))}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Sign & Finalize Dialog */}
      <SignDialog
        open={signOpen}
        onOpenChange={setSignOpen}
        docType={doc?.type || 'sonstiges'}
        parties={signParties}
        onComplete={handleSignComplete}
      />

      {/* Save as Template Dialog */}
      <Dialog open={saveTplOpen} onOpenChange={setSaveTplOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4 text-brass-600" />
              Als eigene Vorlage speichern
            </DialogTitle>
            <DialogDescription>
              Der aktuelle Inhalt wird als wiederverwendbare Vorlage gespeichert. Platzhalter wie <code className="text-[11px] bg-muted px-1 rounded">{'{{mieter_name}}'}</code> bleiben erhalten und werden beim nächsten Einsatz automatisch ausgefüllt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="tpl-name" className="text-xs">Name der Vorlage</Label>
            <Input
              id="tpl-name"
              value={tplName}
              onChange={e => setTplName(e.target.value)}
              placeholder="z.B. Standard-WG-Mietvertrag"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter' && !savingTpl) saveAsTemplate() }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveTplOpen(false)} disabled={savingTpl}>Abbrechen</Button>
            <Button onClick={saveAsTemplate} disabled={savingTpl || !tplName.trim()} className="gap-1.5">
              <BookmarkPlus className="h-4 w-4" />
              {savingTpl ? 'Speichert…' : 'Speichern'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dokument löschen</DialogTitle>
            <DialogDescription>
              Möchten Sie das Dokument „{name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
