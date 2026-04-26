'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  isSectionsContent, parseSectionsContent, sectionsToHtml,
  type SectionsContent,
} from '@/lib/document-templates'
import { embedSignaturesInHtml, generateDocumentPdf } from '@/lib/document-pdf'
import { getDocument, updateDocument, deleteDocument, createTemplate } from '@/lib/local-store'

/** Minimal fields we rely on from the `documents` row. */
export interface DocumentRecord {
  id: string
  name: string
  content: string
  type: string
  status?: 'draft' | 'final'
  tenancy_id?: string
  tenant_first_name?: string
  tenant_last_name?: string
  finalized_at?: string | null
  signature_mode?: 'handwritten' | 'digital'
  signatures?: Record<string, { signed_at: string }>
}

interface FinalizeOpts {
  signatureMode: 'handwritten' | 'digital'
  signatures: Record<string, string>  // data URLs keyed by party (empty for handwritten)
}

/**
 * Document state + persistence. Loads once on mount, exposes edit
 * callbacks and the save/delete/finalize/pdf actions the UI needs.
 *
 * Kept as a single hook (vs. splitting read/mutate) because the mutations
 * need to see and update the same local state — passing state in from
 * outside would just shuffle complexity back to the caller.
 */
export function useDocument(id: string, authed: boolean) {
  const router = useRouter()

  const [doc, setDoc] = useState<DocumentRecord | null>(null)
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [parsedSections, setParsedSections] = useState<SectionsContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Refs mirror the latest values for use inside stable callbacks whose
  // deps stay empty — otherwise every keystroke would rebuild the callbacks
  // and bust any memoization downstream.
  const stateRef = useRef({ name, content, parsedSections })
  useEffect(() => { stateRef.current = { name, content, parsedSections } })

  // ─── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    const document = getDocument(id)
    if (!document) {
      toast.error('Dokument nicht gefunden')
      router.replace('/dashboard')
      return
    }
    setDoc(document as DocumentRecord)
    setName(document.name)
    setContent(document.content)
    if (isSectionsContent(document.content)) {
      setParsedSections(parseSectionsContent(document.content))
    }
    setLoading(false)
  }, [id, router])

  // ─── Edit callbacks (stable) ───────────────────────────────────────────────
  const changeName = useCallback((value: string) => {
    setName(value)
    setIsDirty(true)
  }, [])

  const changeContent = useCallback((html: string) => {
    setContent(html)
    setIsDirty(true)
  }, [])

  const changeSections = useCallback((updated: SectionsContent) => {
    setParsedSections(updated)
    setIsDirty(true)
  }, [])

  const insertPlaceholder = useCallback((ph: string) => {
    setContent(c => c + `<p>${ph}</p>`)
    setIsDirty(true)
    toast.info(`Platzhalter eingefügt: ${ph}`)
  }, [])

  // ─── Save (optionally finalize with signatures) ────────────────────────────
  type SaveOpts = {
    finalize?: boolean
    /** Pre-built HTML (used when embedding digital signatures). */
    contentOverride?: string
    signatureMode?: 'handwritten' | 'digital'
    signatures?: Record<string, { signed_at: string }>
    /** Suppress the success toast (useful when this save is one step of a chain). */
    silent?: boolean
  }

  const save = useCallback(async (opts?: SaveOpts) => {
    setSaving(true)
    try {
      const { name: curName, content: curContent, parsedSections: curSections } = stateRef.current
      const serialized = curSections
        ? (opts?.contentOverride ?? JSON.stringify(curSections))
        : (opts?.contentOverride ?? curContent)
      const updates: Record<string, unknown> = { name: curName, content: serialized }
      if (opts?.finalize) {
        updates.status = 'final'
        updates.finalized_at = new Date().toISOString()
        if (opts.signatureMode) updates.signature_mode = opts.signatureMode
        if (opts.signatures) updates.signatures = opts.signatures
      }
      const updated = updateDocument(id, updates as any)
      if (!updated) throw new Error('save failed')

      setIsDirty(false)
      if (opts?.contentOverride) setContent(opts.contentOverride)
      if (opts?.finalize) {
        setDoc(prev => prev ? {
          ...prev,
          status: 'final',
          finalized_at: updates.finalized_at as string,
          signature_mode: (updates.signature_mode as DocumentRecord['signature_mode']) ?? prev.signature_mode,
          signatures: (updates.signatures as DocumentRecord['signatures']) ?? prev.signatures,
        } : prev)
        if (!opts?.silent) toast.success('Dokument abgeschlossen')
      } else if (!opts?.silent) {
        toast.success('Gespeichert')
      }
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }, [id])

  // ─── Finalize with signatures ──────────────────────────────────────────────
  const finalize = useCallback(async ({ signatureMode, signatures }: FinalizeOpts) => {
    if (signatureMode === 'handwritten') {
      await save({ finalize: true, signatureMode: 'handwritten' })
      return
    }
    // Digital: embed signature images into the HTML before persisting.
    const { content: curContent, parsedSections: curSections } = stateRef.current
    const workingContent = curSections ? sectionsToHtml(curSections) : curContent
    const signedAt = new Date().toISOString()
    const newContent = embedSignaturesInHtml(workingContent, signatures)
    const meta = Object.keys(signatures).reduce<Record<string, { signed_at: string }>>((acc, key) => {
      acc[key] = { signed_at: signedAt }
      return acc
    }, {})
    await save({
      finalize: true,
      contentOverride: newContent,
      signatureMode: 'digital',
      signatures: meta,
    })
  }, [save])

  // ─── Delete ────────────────────────────────────────────────────────────────
  const remove = useCallback(async () => {
    const ok = deleteDocument(id)
    if (!ok) { toast.error('Fehler beim Löschen'); return false }
    toast.success('Dokument gelöscht')
    router.push('/dashboard')
    return true
  }, [id, router])

  // ─── PDF export ────────────────────────────────────────────────────────────
  const downloadPdf = useCallback(async () => {
    toast.loading('PDF wird erstellt…', { id: 'doc-pdf' })
    try {
      // Ensure latest edits are persisted first.
      await save({ silent: true })
      const { name: curName, content: curContent, parsedSections: curSections } = stateRef.current
      const html = curSections ? sectionsToHtml(curSections) : curContent
      await generateDocumentPdf({ html, filename: curName })
      toast.success('PDF heruntergeladen', { id: 'doc-pdf' })
    } catch {
      toast.error('Fehler beim Erstellen der PDF', { id: 'doc-pdf' })
    }
  }, [save])

  // ─── Save-as-template ──────────────────────────────────────────────────────
  const saveAsTemplate = useCallback(async (templateName: string) => {
    const { content: curContent } = stateRef.current
    if (!doc?.type) throw new Error('Kein Typ')
    const template = createTemplate({ name: templateName, type: doc.type, content: curContent })
    toast.success(`Vorlage "${template.name}" gespeichert`)
  }, [doc?.type])

  return {
    // state
    doc,
    name,
    content,
    parsedSections,
    loading,
    saving,
    isDirty,
    isFinalized: doc?.status === 'final',
    // edit
    changeName,
    changeContent,
    changeSections,
    insertPlaceholder,
    // actions
    save,
    finalize,
    remove,
    downloadPdf,
    saveAsTemplate,
  }
}
