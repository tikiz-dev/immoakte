/**
 * Local-only persistence layer.
 *
 * Ersetzt das ehemalige Supabase-Backend. Alle Daten leben im
 * `localStorage` des Browsers — keine Server, kein Login, keine Cloud.
 * Ein synthetischer User („local-user") wird einmal angelegt und in
 * jedes erzeugte Objekt als `owner_id` geschrieben, damit das bestehende
 * UI-Modell (das `owner_id`/`tenancy_id`-Beziehungen erwartet) ohne
 * Umbau weiterläuft.
 *
 * Wenn das Projekt jemals wieder mit echtem Backend laufen soll, siehe
 * ARCHIVE.md §12.8 für die Restart-Anleitung. Die Schemas hier spiegeln
 * 1:1 die Spalten der ehemaligen Supabase-Tabellen.
 */

const STORAGE_PREFIX = 'immoakte:v1'
const USER_KEY = `${STORAGE_PREFIX}:user`
const PROFILE_KEY = `${STORAGE_PREFIX}:profile`

const KEYS = {
  user: USER_KEY,
  profile: PROFILE_KEY,
  properties: `${STORAGE_PREFIX}:properties`,
  tenancies: `${STORAGE_PREFIX}:tenancies`,
  protocols: `${STORAGE_PREFIX}:protocols`,
  documents: `${STORAGE_PREFIX}:documents`,
  templates: `${STORAGE_PREFIX}:templates`,
} as const

// ─── helpers ──────────────────────────────────────────────────────────

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function read<T>(key: string): T[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function write<T>(key: string, value: T[]) {
  if (!isBrowser()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uuid(): string {
  // crypto.randomUUID ist seit Safari 15.4 / Chrome 92 verfügbar — reicht.
  if (isBrowser() && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function now() {
  return new Date().toISOString()
}

// ─── synthetic user ──────────────────────────────────────────────────

export interface LocalUser {
  id: string
  email: string
  name: string
  created_at: string
}

export interface LandlordProfile {
  name?: string
  company?: string
  street?: string
  house_number?: string
  zip_code?: string
  city?: string
  phone?: string
  email_contact?: string
  iban?: string
  bank_name?: string
}

export function getProfile(): LandlordProfile {
  if (!isBrowser()) return {}
  try { return JSON.parse(window.localStorage.getItem(KEYS.profile) || '{}') } catch { return {} }
}

export function saveProfile(p: LandlordProfile): void {
  if (!isBrowser()) return
  window.localStorage.setItem(KEYS.profile, JSON.stringify(p))
}

export function getOrCreateUser(): LocalUser {
  if (!isBrowser()) {
    // SSR-Pfad: wir geben einen Phantom-User zurück. Kein Lese-/Schreib-
    // Zugriff auf localStorage möglich — Aufrufer dürfen das Ergebnis nur
    // nach Hydration nutzen.
    return { id: 'ssr-placeholder', email: '', name: 'Local User', created_at: now() }
  }
  const raw = window.localStorage.getItem(USER_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as LocalUser
    } catch {
      /* fallthrough — neu anlegen */
    }
  }
  const user: LocalUser = {
    id: uuid(),
    email: '',
    name: 'Local User',
    created_at: now(),
  }
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

// ─── domain types (aus dem Supabase-Schema gespiegelt) ───────────────

export interface Property {
  id: string
  owner_id: string
  address?: string
  street?: string
  house_number?: string
  zip_code?: string
  city?: string
  created_at: string
}

export interface Tenancy {
  id: string
  owner_id: string
  property_id: string | null
  tenant_salutation?: string | null
  tenant_first_name?: string | null
  tenant_last_name?: string | null
  tenant_email?: string | null
  tenant_phone?: string | null
  tenant_street?: string | null
  tenant_house_number?: string | null
  tenant_zip_code?: string | null
  tenant_city?: string | null
  start_date?: string | null
  end_date?: string | null
  rent_cold?: number | null
  utilities?: number | null
  deposit?: number | null
  sqm?: number | null
  rooms?: number | null
  floor?: string | null
  contract_duration?: string | null
  contract_end_date?: string | null
  notice_period_months?: number | null
  rent_due_day?: number | null
  created_at: string
  updated_at: string
}

export interface Protocol {
  id: string
  tenancy_id?: string | null
  property_id?: string | null
  owner_id: string
  type: 'Einzug' | 'Auszug'
  status: 'draft' | 'final'
  date?: string | null
  finalized_at?: string | null
  tenant_salutation?: string | null
  tenant_first_name?: string | null
  tenant_last_name?: string | null
  tenant_email?: string | null
  tenant_phone?: string | null
  linked_protocol_id?: string | null
  rooms: any[]
  meters: any[]
  keys: any[]
  general_condition?: string | null
  tenant_new_address?: string | null
  witnesses?: string | null
  landlord_signature?: string | null
  tenant_signature?: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRecord {
  id: string
  owner_id: string
  tenancy_id?: string | null
  protocol_id?: string | null
  property_id?: string | null
  template_id?: string | null
  name: string
  type: 'wohnungsgeberbestaetigung' | 'mietvertrag' | 'kautionsbescheinigung' | 'sonstiges'
  content: string
  status: 'draft' | 'final'
  tenant_salutation?: string | null
  tenant_first_name?: string | null
  tenant_last_name?: string | null
  tenant_email?: string | null
  finalized_at?: string | null
  pdf_url?: string | null
  signature_mode?: 'handwritten' | 'digital'
  signatures?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DocumentTemplate {
  id: string
  owner_id: string
  name: string
  type: string
  content: string
  is_default?: boolean
  created_at: string
  updated_at: string
}

// ─── tenancies + properties ──────────────────────────────────────────

export interface TenancyWithProperty extends Tenancy {
  properties: Property | null
}

export function listTenancies(): TenancyWithProperty[] {
  const tenancies = read<Tenancy>(KEYS.tenancies)
  const properties = read<Property>(KEYS.properties)
  const propMap = new Map(properties.map(p => [p.id, p]))
  return tenancies
    .slice()
    .sort((a, b) => (b.created_at > a.created_at ? 1 : -1))
    .map(t => ({ ...t, properties: t.property_id ? propMap.get(t.property_id) ?? null : null }))
}

export function getTenancy(id: string): TenancyWithProperty | null {
  const t = read<Tenancy>(KEYS.tenancies).find(t => t.id === id)
  if (!t) return null
  const property = t.property_id
    ? read<Property>(KEYS.properties).find(p => p.id === t.property_id) ?? null
    : null
  return { ...t, properties: property }
}

export interface CreateTenancyInput {
  tenant_salutation?: string
  tenant_first_name?: string
  tenant_last_name?: string
  tenant_email?: string
  tenant_phone?: string
  tenant_street?: string
  tenant_house_number?: string
  tenant_zip_code?: string
  tenant_city?: string
  street?: string
  house_number?: string
  zip_code?: string
  city?: string
}

export function createTenancy(input: CreateTenancyInput): { tenancy: Tenancy; property: Property } {
  const user = getOrCreateUser()
  const property: Property = {
    id: uuid(),
    owner_id: user.id,
    street: input.street,
    house_number: input.house_number,
    zip_code: input.zip_code,
    city: input.city,
    address: `${input.street ?? ''} ${input.house_number ?? ''}, ${input.zip_code ?? ''} ${input.city ?? ''}`.trim(),
    created_at: now(),
  }
  const tenancy: Tenancy = {
    id: uuid(),
    owner_id: user.id,
    property_id: property.id,
    tenant_salutation: input.tenant_salutation ?? null,
    tenant_first_name: input.tenant_first_name ?? null,
    tenant_last_name: input.tenant_last_name ?? null,
    tenant_email: input.tenant_email || null,
    tenant_phone: input.tenant_phone || null,
    tenant_street: input.tenant_street || null,
    tenant_house_number: input.tenant_house_number || null,
    tenant_zip_code: input.tenant_zip_code || null,
    tenant_city: input.tenant_city || null,
    created_at: now(),
    updated_at: now(),
  }
  write(KEYS.properties, [...read<Property>(KEYS.properties), property])
  write(KEYS.tenancies, [...read<Tenancy>(KEYS.tenancies), tenancy])
  return { tenancy, property }
}

const TENANCY_ALLOWED_FIELDS = new Set([
  'tenant_salutation', 'tenant_first_name', 'tenant_last_name',
  'tenant_email', 'tenant_phone', 'tenant_street', 'tenant_house_number',
  'tenant_zip_code', 'tenant_city', 'start_date', 'end_date',
  'rent_cold', 'utilities', 'deposit', 'sqm', 'rooms', 'floor',
  'contract_duration', 'contract_end_date', 'notice_period_months', 'rent_due_day',
])

export function updateTenancy(id: string, patch: Record<string, unknown>): boolean {
  const tenancies = read<Tenancy>(KEYS.tenancies)
  const idx = tenancies.findIndex(t => t.id === id)
  if (idx === -1) return false
  const updates: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) {
    if (TENANCY_ALLOWED_FIELDS.has(k)) updates[k] = v
  }
  tenancies[idx] = { ...tenancies[idx], ...updates, updated_at: now() }
  write(KEYS.tenancies, tenancies)

  // Property-Adresse mit-pflegen, wenn Felder mitkommen
  const { street, house_number, zip_code, city } = patch as Record<string, string | undefined>
  if (tenancies[idx].property_id && (street || house_number || zip_code || city)) {
    const properties = read<Property>(KEYS.properties)
    const pIdx = properties.findIndex(p => p.id === tenancies[idx].property_id)
    if (pIdx !== -1) {
      properties[pIdx] = {
        ...properties[pIdx],
        ...(street !== undefined && { street }),
        ...(house_number !== undefined && { house_number }),
        ...(zip_code !== undefined && { zip_code }),
        ...(city !== undefined && { city }),
        address: `${street ?? properties[pIdx].street ?? ''} ${house_number ?? properties[pIdx].house_number ?? ''}, ${zip_code ?? properties[pIdx].zip_code ?? ''} ${city ?? properties[pIdx].city ?? ''}`.trim(),
      }
      write(KEYS.properties, properties)
    }
  }
  return true
}

export function deleteTenancy(id: string): boolean {
  const tenancies = read<Tenancy>(KEYS.tenancies)
  const next = tenancies.filter(t => t.id !== id)
  if (next.length === tenancies.length) return false
  write(KEYS.tenancies, next)
  // Cascade: protocols + documents mit dieser tenancy_id
  write(KEYS.protocols, read<Protocol>(KEYS.protocols).filter(p => p.tenancy_id !== id))
  write(KEYS.documents, read<DocumentRecord>(KEYS.documents).filter(d => d.tenancy_id !== id))
  return true
}

export function duplicateTenancyForAuszug(sourceTenancyId: string, sourceProtocolId: string): {
  tenancy: Tenancy
  protocol: Protocol
} | null {
  const source = getTenancy(sourceTenancyId)
  if (!source) return null
  const sourceProtocol = read<Protocol>(KEYS.protocols).find(p => p.id === sourceProtocolId)
  if (!sourceProtocol) return null

  const user = getOrCreateUser()
  const tenancy: Tenancy = {
    ...source,
    id: uuid(),
    created_at: now(),
    updated_at: now(),
  }
  // properties Block aus TenancyWithProperty entfernen
  delete (tenancy as any).properties

  const protocol: Protocol = {
    ...sourceProtocol,
    id: uuid(),
    tenancy_id: tenancy.id,
    type: 'Auszug',
    status: 'draft',
    finalized_at: null,
    linked_protocol_id: sourceProtocol.id,
    owner_id: user.id,
    created_at: now(),
    updated_at: now(),
  }

  write(KEYS.tenancies, [...read<Tenancy>(KEYS.tenancies), tenancy])
  write(KEYS.protocols, [...read<Protocol>(KEYS.protocols), protocol])
  return { tenancy, protocol }
}

// ─── protocols ───────────────────────────────────────────────────────

export function listProtocolsForTenancy(tenancyId: string): Protocol[] {
  return read<Protocol>(KEYS.protocols)
    .filter(p => p.tenancy_id === tenancyId)
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
}

export function getProtocol(id: string): Protocol | null {
  return read<Protocol>(KEYS.protocols).find(p => p.id === id) ?? null
}

export function upsertProtocol(p: Partial<Protocol> & { id?: string; type: 'Einzug' | 'Auszug' }): Protocol {
  const user = getOrCreateUser()
  const protocols = read<Protocol>(KEYS.protocols)
  const existingIdx = p.id ? protocols.findIndex(x => x.id === p.id) : -1
  const base: Protocol = existingIdx >= 0 ? protocols[existingIdx] : {
    id: p.id ?? uuid(),
    owner_id: user.id,
    type: p.type,
    status: 'draft',
    rooms: [],
    meters: [],
    keys: [],
    created_at: now(),
    updated_at: now(),
  }
  const merged: Protocol = { ...base, ...p, owner_id: user.id, updated_at: now() }
  if (existingIdx >= 0) protocols[existingIdx] = merged
  else protocols.push(merged)
  write(KEYS.protocols, protocols)
  return merged
}

export function finalizeProtocol(id: string): boolean {
  const protocols = read<Protocol>(KEYS.protocols)
  const idx = protocols.findIndex(p => p.id === id)
  if (idx === -1) return false
  protocols[idx] = { ...protocols[idx], status: 'final', finalized_at: now(), updated_at: now() }
  write(KEYS.protocols, protocols)
  return true
}

export function deleteProtocol(id: string): boolean {
  const protocols = read<Protocol>(KEYS.protocols)
  const next = protocols.filter(p => p.id !== id)
  if (next.length === protocols.length) return false
  write(KEYS.protocols, next)
  return true
}

export function listAllProtocols(): Protocol[] {
  return read<Protocol>(KEYS.protocols)
}

export function getProperty(id: string): Property | null {
  return read<Property>(KEYS.properties).find(p => p.id === id) ?? null
}

// ─── documents ───────────────────────────────────────────────────────

export function listDocuments(opts: { tenancyId?: string } = {}): DocumentRecord[] {
  const docs = read<DocumentRecord>(KEYS.documents)
  return docs
    .filter(d => (opts.tenancyId ? d.tenancy_id === opts.tenancyId : true))
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
}

export function getDocument(id: string): DocumentRecord | null {
  return read<DocumentRecord>(KEYS.documents).find(d => d.id === id) ?? null
}

export function createDocument(input: Partial<DocumentRecord> & { name: string; type: DocumentRecord['type']; content: string }): DocumentRecord {
  const user = getOrCreateUser()
  const doc: DocumentRecord = {
    id: uuid(),
    owner_id: user.id,
    tenancy_id: input.tenancy_id ?? null,
    protocol_id: input.protocol_id ?? null,
    property_id: input.property_id ?? null,
    template_id: input.template_id ?? null,
    name: input.name,
    type: input.type,
    content: input.content,
    status: input.status ?? 'draft',
    tenant_salutation: input.tenant_salutation ?? null,
    tenant_first_name: input.tenant_first_name ?? null,
    tenant_last_name: input.tenant_last_name ?? null,
    tenant_email: input.tenant_email ?? null,
    signature_mode: input.signature_mode ?? 'handwritten',
    signatures: input.signatures ?? {},
    created_at: now(),
    updated_at: now(),
  }
  write(KEYS.documents, [...read<DocumentRecord>(KEYS.documents), doc])
  return doc
}

export function updateDocument(id: string, patch: Partial<DocumentRecord>): DocumentRecord | null {
  const docs = read<DocumentRecord>(KEYS.documents)
  const idx = docs.findIndex(d => d.id === id)
  if (idx === -1) return null
  docs[idx] = { ...docs[idx], ...patch, updated_at: now() }
  write(KEYS.documents, docs)
  return docs[idx]
}

export function deleteDocument(id: string): boolean {
  const docs = read<DocumentRecord>(KEYS.documents)
  const next = docs.filter(d => d.id !== id)
  if (next.length === docs.length) return false
  write(KEYS.documents, next)
  return true
}

// ─── templates ───────────────────────────────────────────────────────

export function listTemplates(opts: { type?: string } = {}): DocumentTemplate[] {
  return read<DocumentTemplate>(KEYS.templates)
    .filter(t => (opts.type ? t.type === opts.type : true))
    .sort((a, b) => (a.created_at > b.created_at ? 1 : -1))
}

export function getTemplate(id: string): DocumentTemplate | null {
  return read<DocumentTemplate>(KEYS.templates).find(t => t.id === id) ?? null
}

export function createTemplate(input: Partial<DocumentTemplate> & { name: string; type: string; content: string }): DocumentTemplate {
  const user = getOrCreateUser()
  const tpl: DocumentTemplate = {
    id: uuid(),
    owner_id: user.id,
    name: input.name,
    type: input.type,
    content: input.content,
    is_default: input.is_default ?? false,
    created_at: now(),
    updated_at: now(),
  }
  write(KEYS.templates, [...read<DocumentTemplate>(KEYS.templates), tpl])
  return tpl
}

export function updateTemplate(id: string, patch: Partial<DocumentTemplate>): DocumentTemplate | null {
  const tpls = read<DocumentTemplate>(KEYS.templates)
  const idx = tpls.findIndex(t => t.id === id)
  if (idx === -1) return null
  tpls[idx] = { ...tpls[idx], ...patch, updated_at: now() }
  write(KEYS.templates, tpls)
  return tpls[idx]
}

export function deleteTemplate(id: string): boolean {
  const tpls = read<DocumentTemplate>(KEYS.templates)
  const next = tpls.filter(t => t.id !== id)
  if (next.length === tpls.length) return false
  write(KEYS.templates, next)
  return true
}

// ─── account export / wipe ───────────────────────────────────────────

export function exportAllData() {
  return {
    user: getOrCreateUser(),
    properties: read(KEYS.properties),
    tenancies: read(KEYS.tenancies),
    protocols: read(KEYS.protocols),
    documents: read(KEYS.documents),
    templates: read(KEYS.templates),
    exported_at: now(),
  }
}

export function wipeAllData() {
  if (!isBrowser()) return
  for (const k of Object.values(KEYS)) window.localStorage.removeItem(k)
}
