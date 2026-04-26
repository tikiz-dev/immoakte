/**
 * Client-side helper to build a new Document from a type, optional template,
 * and a tenancy. Replaces the former POST /api/documents endpoint.
 */

import {
  DEFAULT_TEMPLATES,
  fillPlaceholders,
  isSectionsContent,
  parseSectionsContent,
  sectionsToHtml,
} from '@/lib/document-templates'
import {
  createDocument,
  getTenancy,
  getProfile,
  getTemplate,
  updateTenancy,
  type DocumentRecord,
} from '@/lib/local-store'

export interface CreateDocumentOptions {
  type: DocumentRecord['type']
  tenancy_id?: string | null
  property_id?: string | null
  template_id?: string | null
  /** Mietvertrag-spezifische Konditionen — werden auf der Tenancy gespeichert. */
  rental_terms?: Record<string, any>
}

const TYPE_LABELS: Record<string, string> = {
  mietvertrag: 'Mietvertrag',
  wohnungsgeberbestaetigung: 'Wohnungsgeberbestätigung',
  kautionsbescheinigung: 'Kautionsbescheinigung',
  sonstiges: 'Neues Dokument',
}

function fmtEuro(n: number | null | undefined) {
  if (n === null || n === undefined || !Number.isFinite(n)) return ''
  return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(d?: string | null) {
  if (!d) return ''
  try {
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return ''
    return dt.toLocaleDateString('de-DE')
  } catch { return '' }
}

export function buildPlaceholderData(tenancyId?: string | null): Record<string, string> {
  const profile = getProfile()
  const tenancy = tenancyId ? getTenancy(tenancyId) : null
  const property = tenancy?.properties || null

  const adresse = property
    ? `${property.street ?? ''} ${property.house_number ?? ''}, ${property.zip_code ?? ''} ${property.city ?? ''}`.replace(/\s+,/g, ',').trim()
    : ''

  const mieterAdresse = tenancy && (tenancy.tenant_street || tenancy.tenant_zip_code)
    ? `${tenancy.tenant_street ?? ''} ${tenancy.tenant_house_number ?? ''}, ${tenancy.tenant_zip_code ?? ''} ${tenancy.tenant_city ?? ''}`.replace(/\s+,/g, ',').trim()
    : ''

  const total = (tenancy?.rent_cold ?? 0) + (tenancy?.utilities ?? 0)

  const data: Record<string, string> = {
    '{{vermieter_name}}': profile.name || '',
    '{{vermieter_firma}}': profile.company || '',
    '{{vermieter_firma_block}}': profile.company ? `<br>${profile.company}` : '',
    '{{vermieter_adresse}}': [profile.street && `${profile.street} ${profile.house_number ?? ''}`.trim(), `${profile.zip_code ?? ''} ${profile.city ?? ''}`.trim()].filter(Boolean).join(', '),
    '{{vermieter_strasse}}': `${profile.street ?? ''} ${profile.house_number ?? ''}`.trim(),
    '{{vermieter_plz_ort}}': `${profile.zip_code ?? ''} ${profile.city ?? ''}`.trim(),
    '{{vermieter_telefon}}': profile.phone || '',
    '{{vermieter_email}}': profile.email_contact || '',
    '{{vermieter_iban}}': profile.iban || '',
    '{{vermieter_bank}}': profile.bank_name || '',
    '{{mieter_anrede}}': tenancy?.tenant_salutation || '',
    '{{mieter_vorname}}': tenancy?.tenant_first_name || '',
    '{{mieter_nachname}}': tenancy?.tenant_last_name || '',
    '{{mieter_name}}': `${tenancy?.tenant_first_name ?? ''} ${tenancy?.tenant_last_name ?? ''}`.trim(),
    '{{mieter_adresse}}': mieterAdresse,
    '{{mieter_strasse}}': `${tenancy?.tenant_street ?? ''} ${tenancy?.tenant_house_number ?? ''}`.trim(),
    '{{mieter_plz_ort}}': `${tenancy?.tenant_zip_code ?? ''} ${tenancy?.tenant_city ?? ''}`.trim(),
    '{{adresse}}': adresse,
    '{{strasse}}': `${property?.street ?? ''} ${property?.house_number ?? ''}`.trim(),
    '{{plz_ort}}': `${property?.zip_code ?? ''} ${property?.city ?? ''}`.trim(),
    '{{einzugsdatum}}': fmtDate(tenancy?.start_date),
    '{{datum_heute}}': new Date().toLocaleDateString('de-DE'),
    '{{kaltmiete}}': fmtEuro(tenancy?.rent_cold),
    '{{nebenkosten}}': fmtEuro(tenancy?.utilities),
    '{{gesamtmiete}}': total ? fmtEuro(total) : '',
    '{{kaution}}': fmtEuro(tenancy?.deposit),
    '{{mietbeginn}}': fmtDate(tenancy?.start_date),
    '{{wohnflaeche}}': tenancy?.sqm != null ? String(tenancy.sqm).replace('.', ',') : '',
    '{{zimmer}}': tenancy?.rooms != null ? String(tenancy.rooms).replace('.', ',') : '',
    '{{stockwerk}}': tenancy?.floor || '',
    '{{lage_block}}': tenancy?.floor ? `, ${tenancy.floor}` : '',
    '{{vertragsart}}': tenancy?.contract_duration === 'befristet' ? 'befristet' : 'unbefristet',
    '{{vertragsende}}': fmtDate(tenancy?.contract_end_date),
    '{{vertragsdauer_block}}': tenancy?.contract_duration === 'befristet' && tenancy.contract_end_date
      ? ` und endet am <strong>${fmtDate(tenancy.contract_end_date)}</strong> (§ 575 BGB).`
      : ' und läuft auf unbestimmte Zeit.',
    '{{kuendigungsfrist}}': tenancy?.notice_period_months ? `${tenancy.notice_period_months} Monate` : '3 Monate',
    '{{faelligkeitstag}}': tenancy?.rent_due_day != null ? String(tenancy.rent_due_day) : '3',
  }
  return data
}

export function createDocumentForType(opts: CreateDocumentOptions): DocumentRecord {
  // 1) Persist rental_terms onto the tenancy (Mietvertrag flow only).
  if (opts.rental_terms && opts.tenancy_id) {
    updateTenancy(opts.tenancy_id, opts.rental_terms)
  }

  // 2) Pick template content: custom template > default
  let baseContent: string
  let baseName: string
  let baseType: DocumentRecord['type']

  if (opts.template_id) {
    const tpl = getTemplate(opts.template_id)
    if (tpl) {
      baseContent = tpl.content
      baseName = tpl.name
      baseType = tpl.type as DocumentRecord['type']
    } else {
      const def = DEFAULT_TEMPLATES[opts.type] || DEFAULT_TEMPLATES.sonstiges
      baseContent = def.content
      baseName = def.name
      baseType = opts.type
    }
  } else {
    const def = DEFAULT_TEMPLATES[opts.type] || DEFAULT_TEMPLATES.sonstiges
    baseContent = def.content
    baseName = def.name
    baseType = opts.type
  }

  // 3) Fill placeholders. If the content is "sections" JSON, fill each section.
  const data = buildPlaceholderData(opts.tenancy_id)
  let filled: string
  if (isSectionsContent(baseContent)) {
    const parsed = parseSectionsContent(baseContent)
    parsed.sections = parsed.sections.map(s => ({ ...s, content: fillPlaceholders(s.content, data) }))
    filled = sectionsToHtml(parsed)
  } else {
    filled = fillPlaceholders(baseContent, data)
  }

  const tenancy = opts.tenancy_id ? getTenancy(opts.tenancy_id) : null

  return createDocument({
    name: TYPE_LABELS[opts.type] || baseName,
    type: baseType,
    content: filled,
    tenancy_id: opts.tenancy_id ?? null,
    property_id: opts.property_id ?? tenancy?.property_id ?? null,
    template_id: opts.template_id ?? null,
    tenant_salutation: tenancy?.tenant_salutation ?? null,
    tenant_first_name: tenancy?.tenant_first_name ?? null,
    tenant_last_name: tenancy?.tenant_last_name ?? null,
    tenant_email: tenancy?.tenant_email ?? null,
    status: 'draft',
  })
}
