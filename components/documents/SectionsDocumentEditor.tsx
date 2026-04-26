'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContractHeaderDisplay } from './ContractHeaderDisplay'
import { ContractFooterDisplay } from './ContractFooterDisplay'
import { DocumentEditor } from '@/components/DocumentEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ChevronDown, ChevronUp, Lock, GripVertical, BookmarkPlus, Bookmark } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { type SectionsContent, type ContractSection, stripSectionNumber } from '@/lib/document-templates'
import { listTemplates, createTemplate } from '@/lib/local-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  parsed: SectionsContent
  isFinalized: boolean
  onChange: (updated: SectionsContent) => void
}

interface SectionTemplate {
  id: string
  name: string
  /** JSON-stringified { title, content } */
  content: string
}

const SECTION_TEMPLATE_TYPE = 'contract_section'

export function SectionsDocumentEditor({ parsed, isFinalized, onChange }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(parsed.sections[0]?.id ?? null)
  const [addingSection, setAddingSection] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  // Section-template state
  const [sectionTemplates, setSectionTemplates] = useState<SectionTemplate[]>([])
  const [savingFrom, setSavingFrom] = useState<ContractSection | null>(null)
  const [tplName, setTplName] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)

  // Refs let our callbacks stay stable (empty deps) while reading the latest
  // parsed/onChange — React.memo on SectionCard then actually pays off, since
  // its prop callbacks no longer change on every parent render.
  const parsedRef = useRef(parsed)
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    parsedRef.current = parsed
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (isFinalized) return
    setSectionTemplates(listTemplates({ type: SECTION_TEMPLATE_TYPE }) as SectionTemplate[])
  }, [isFinalized])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ─── Stable callbacks (read parsed via ref, so deps stay empty) ────────────
  const handleChangeContent = useCallback((id: string, content: string) => {
    const cur = parsedRef.current
    onChangeRef.current({
      ...cur,
      sections: cur.sections.map(s => s.id === id ? { ...s, content } : s),
    })
  }, [])

  const handleChangeTitle = useCallback((id: string, title: string) => {
    const cleaned = stripSectionNumber(title)
    const cur = parsedRef.current
    onChangeRef.current({
      ...cur,
      sections: cur.sections.map(s => s.id === id ? { ...s, title: cleaned } : s),
    })
  }, [])

  const handleDeleteSection = useCallback((id: string) => {
    const cur = parsedRef.current
    onChangeRef.current({ ...cur, sections: cur.sections.filter(s => s.id !== id) })
  }, [])

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  const handleSaveAsTemplate = useCallback((section: ContractSection) => {
    setSavingFrom(section)
    setTplName(stripSectionNumber(section.title))
  }, [])

  const appendSection = useCallback((title: string, content: string) => {
    const trimmed = stripSectionNumber(title)
    if (!trimmed) return
    const sec: ContractSection = { id: crypto.randomUUID(), title: trimmed, content }
    const cur = parsedRef.current
    onChangeRef.current({ ...cur, sections: [...cur.sections, sec] })
    setNewTitle('')
    setAddingSection(false)
    setExpandedId(sec.id)
  }, [])

  const insertFromTemplate = useCallback((tpl: SectionTemplate) => {
    try {
      const parsedTpl = JSON.parse(tpl.content) as { title?: string; content?: string }
      appendSection(parsedTpl.title || tpl.name, parsedTpl.content || '<p></p>')
    } catch {
      toast.error('Vorlage ist beschädigt und kann nicht eingefügt werden')
    }
  }, [appendSection])

  const saveAsTemplate = async () => {
    if (!savingFrom || !tplName.trim()) return
    setSavingTpl(true)
    try {
      const payload = JSON.stringify({ title: stripSectionNumber(savingFrom.title), content: savingFrom.content })
      const template = createTemplate({ name: tplName.trim(), type: SECTION_TEMPLATE_TYPE, content: payload })
      setSectionTemplates(list => [template as SectionTemplate, ...list])
      toast.success('Als Vorlage gespeichert')
      setSavingFrom(null)
      setTplName('')
    } catch (e: any) {
      toast.error(e?.message || 'Konnte Vorlage nicht speichern')
    } finally {
      setSavingTpl(false)
    }
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const cur = parsedRef.current
    const oldIndex = cur.sections.findIndex(s => s.id === active.id)
    const newIndex = cur.sections.findIndex(s => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChangeRef.current({ ...cur, sections: arrayMove(cur.sections, oldIndex, newIndex) })
  }, [])

  // Stable id-array for SortableContext — only changes when section order changes
  const sectionIds = useMemo(() => parsed.sections.map(s => s.id), [parsed.sections])

  return (
    <div className="space-y-3">
      {/* Fixed header block */}
      <div className="rounded-xl border border-border bg-stone-50 dark:bg-stone-900/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-stone-100/80 dark:bg-stone-800/50">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
            Kopfbereich
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lock className="h-2.5 w-2.5" /> Automatisch
          </span>
        </div>
        <div className="px-6 py-6">
          <ContractHeaderDisplay header={parsed.header} />
        </div>
      </div>

      {/* Sortable sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
          disabled={isFinalized}
        >
          {parsed.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              isExpanded={expandedId === section.id}
              isFinalized={isFinalized}
              onToggle={handleToggle}
              onChangeContent={handleChangeContent}
              onChangeTitle={handleChangeTitle}
              onDelete={handleDeleteSection}
              onSaveAsTemplate={handleSaveAsTemplate}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add section */}
      {!isFinalized && (
        <div className="pt-1 space-y-2">
          {addingSection ? (
            <div className="p-3 border border-dashed border-border rounded-xl bg-muted/20 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="z.B. Sondervereinbarung Stellplatz"
                  className="flex-1 h-9 text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter') appendSection(newTitle, '<p></p>')
                    if (e.key === 'Escape') { setAddingSection(false); setNewTitle('') }
                  }}
                  autoFocus
                />
                <Button onClick={() => appendSection(newTitle, '<p></p>')} size="sm" className="h-9">Hinzufügen</Button>
                <Button variant="ghost" size="sm" className="h-9" onClick={() => { setAddingSection(false); setNewTitle('') }}>
                  Abbrechen
                </Button>
              </div>
              {sectionTemplates.length > 0 && (
                <div className="pt-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                    Oder aus Vorlage
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sectionTemplates.map(tpl => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => insertFromTemplate(tpl)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <Bookmark className="h-3 w-3 text-muted-foreground" />
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed text-muted-foreground hover:text-foreground"
              onClick={() => setAddingSection(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Abschnitt hinzufügen
            </Button>
          )}
        </div>
      )}

      {/* Fixed footer block */}
      <div className="rounded-xl border border-border bg-stone-50 dark:bg-stone-900/40 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-stone-100/80 dark:bg-stone-800/50">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex-1">
            Fußbereich
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Lock className="h-2.5 w-2.5" /> Festes Layout
          </span>
        </div>

        {/* Optional Ort / Datum inputs */}
        {!isFinalized && (
          <div className="px-5 pt-4 grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Ort <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
              </label>
              <Input
                value={parsed.footer?.ort ?? ''}
                onChange={e => onChange({ ...parsed, footer: { ...parsed.footer, ort: e.target.value } })}
                placeholder="Frei lassen für händisches Ausfüllen"
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Datum <span className="font-normal normal-case tracking-normal text-muted-foreground/70">(optional)</span>
              </label>
              <Input
                type="text"
                value={parsed.footer?.datum ?? parsed.header.datum ?? ''}
                onChange={e => onChange({ ...parsed, footer: { ...parsed.footer, datum: e.target.value } })}
                placeholder="TT.MM.JJJJ"
                className="h-9 text-sm w-36"
              />
            </div>
          </div>
        )}

        <div className="px-6 py-6">
          <ContractFooterDisplay header={parsed.header} footer={parsed.footer} />
        </div>
      </div>

      {/* Save-as-template dialog (lightweight inline) */}
      {savingFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => !savingTpl && setSavingFrom(null)}>
          <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading text-base font-semibold mb-1">Abschnitt als Vorlage speichern</h3>
            <p className="text-xs text-muted-foreground mb-4">Speichert Titel und Inhalt. Die Nummerierung wird nicht mitgespeichert.</p>
            <Input
              autoFocus
              value={tplName}
              onChange={e => setTplName(e.target.value)}
              placeholder="Name der Vorlage"
              className="mb-4"
              onKeyDown={e => {
                if (e.key === 'Enter' && tplName.trim()) saveAsTemplate()
                if (e.key === 'Escape' && !savingTpl) setSavingFrom(null)
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setSavingFrom(null)} disabled={savingTpl}>Abbrechen</Button>
              <Button onClick={saveAsTemplate} disabled={savingTpl || !tplName.trim()}>
                {savingTpl ? 'Speichere…' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionCardProps {
  section: ContractSection
  index: number
  isExpanded: boolean
  isFinalized: boolean
  onToggle: (id: string) => void
  onChangeContent: (id: string, content: string) => void
  onChangeTitle: (id: string, title: string) => void
  onDelete: (id: string) => void
  onSaveAsTemplate: (section: ContractSection) => void
}

const SectionCard = memo(function SectionCard({
  section, index, isExpanded, isFinalized, onToggle, onChangeContent, onChangeTitle, onDelete, onSaveAsTemplate,
}: SectionCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: section.id, disabled: isFinalized })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const cleanLabel = stripSectionNumber(section.title)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border border-border bg-background overflow-hidden transition-shadow',
        isExpanded && 'shadow-sm',
        isDragging && 'shadow-lg ring-1 ring-border',
      )}
    >
      {/* Card header */}
      <div className="flex items-center gap-1 px-2 py-2.5 select-none">
        {/* Drag handle */}
        {!isFinalized && (
          <button
            type="button"
            className="h-7 w-6 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
            aria-label="Abschnitt verschieben"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        {/* §-number (auto) */}
        <span className="font-heading text-sm font-medium text-muted-foreground shrink-0 pl-1 pr-2 tabular-nums">
          § {index + 1}
        </span>

        {/* Title (editable) */}
        {isFinalized ? (
          <span className="font-heading text-sm font-medium text-foreground flex-1 leading-snug py-1">
            {cleanLabel}
          </span>
        ) : (
          <input
            type="text"
            value={cleanLabel}
            onChange={e => onChangeTitle(section.id, e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            placeholder="Abschnittstitel"
            className="font-heading text-sm font-medium text-foreground flex-1 bg-transparent border-0 outline-none focus:ring-1 focus:ring-ring rounded px-1.5 py-1 min-w-0"
          />
        )}

        {/*
          BookmarkPlus + Trash belegen auf Mobile (~375px) zu viel Platz neben dem
          Title-Input, sodass Titel wie "Übergabe und Zustand der Mietsache" mitten
          im Wort abgeschnitten werden. Lösung: beide Buttons nur ab sm: (≥640px)
          in der Headerzeile zeigen. Auf Mobile erscheinen sie im Card-Body
          (weiter unten), sobald der Abschnitt expandiert ist.
        */}
        {!isFinalized && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-foreground"
            onClick={e => { e.stopPropagation(); onSaveAsTemplate(section) }}
            aria-label="Als Vorlage speichern"
            title="Als Vorlage speichern"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Expand/collapse trigger */}
        <button
          type="button"
          onClick={() => onToggle(section.id)}
          className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 rounded hover:bg-muted/50"
          aria-label={isExpanded ? 'Einklappen' : 'Ausklappen'}
        >
          {isExpanded
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />
          }
        </button>

        {/* Delete — auf Mobile erst im expandierten Body sichtbar (siehe unten) */}
        {!isFinalized && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-7 w-7 shrink-0 text-muted-foreground/60 hover:text-destructive"
            onClick={e => { e.stopPropagation(); onDelete(section.id) }}
            aria-label="Abschnitt löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Card body */}
      {isExpanded && (
        <div className="border-t border-border">
          {isFinalized ? (
            <div
              className="prose prose-stone prose-sm max-w-none px-5 py-4"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          ) : (
            <EditorWrapper sectionId={section.id} content={section.content} onChangeContent={onChangeContent} />
          )}

          {/*
            Mobile-Aktionsleiste: BookmarkPlus + Trash werden auf Mobile im
            Header ausgeblendet (Platz für den Titel) und erscheinen stattdessen
            unten im expandierten Body. Ab sm: (≥640px) passt alles oben,
            deshalb hier ausblenden.
          */}
          {!isFinalized && (
            <div className="sm:hidden flex items-center justify-end gap-1 border-t border-border px-3 py-2 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                onClick={() => onSaveAsTemplate(section)}
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                Als Vorlage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1.5"
                onClick={() => onDelete(section.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Abschnitt löschen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
})

/**
 * Stable bridge between SectionCard (which receives (id, content) => void) and
 * the memoized DocumentEditor (which expects (content) => void). This local
 * useCallback captures `sectionId` + `onChangeContent` — both reference-stable
 * per-section — so the onChange prop handed to DocumentEditor doesn't change
 * on every keystroke, and the Tiptap editor instance is preserved.
 */
const EditorWrapper = memo(function EditorWrapper({
  sectionId, content, onChangeContent,
}: {
  sectionId: string
  content: string
  onChangeContent: (id: string, content: string) => void
}) {
  const handleChange = useCallback(
    (html: string) => onChangeContent(sectionId, html),
    [sectionId, onChangeContent],
  )
  return <DocumentEditor content={content} onChange={handleChange} />
})
