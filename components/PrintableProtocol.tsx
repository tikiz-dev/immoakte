'use client'

import React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface PrintableProtocolProps {
  protocol: any
  userName: string
  userCompany: string
  propertyAddress: string
}

export const PrintableProtocol: React.FC<PrintableProtocolProps> = ({
  protocol,
  userName,
  userCompany,
  propertyAddress,
}) => {
  const safeFormatDate = (dateStr: any) => {
    if (!dateStr) return 'Kein Datum'
    try { return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de }) }
    catch { return 'Ungültiges Datum' }
  }

  const rooms: any[] = protocol.rooms || []
  const meters: any[] = (protocol.meters || []).filter((m: any) => m.number || m.reading)
  const metersWithPhoto: any[] = meters.filter((m: any) => m.photoUrl)
  const keys: any[] = protocol.keys || []

  return (
    <div id="pdf-content" style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '15mm 15mm 15mm 15mm',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: '11pt',
      lineHeight: '1.5',
      boxSizing: 'border-box',
    }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '8mm', paddingBottom: '5mm', borderBottom: '2px solid #1e293b' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 800, letterSpacing: '3px', color: '#1e293b', margin: 0, textTransform: 'uppercase' }}>
          Übergabeprotokoll
        </h1>
        <p style={{ fontSize: '11pt', color: '#475569', marginTop: '3mm', marginBottom: 0 }}>
          {protocol.type} – {safeFormatDate(protocol.date)}
        </p>
      </div>

      {/* ── PARTIES ── */}
      <div style={{ display: 'flex', gap: '5mm', marginBottom: '5mm' }}>
        <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4mm', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2mm 0' }}>Vermieter / Verwalter</p>
          <p style={{ fontWeight: 700, fontSize: '12pt', color: '#1e293b', margin: '0 0 1mm 0' }}>{userName || 'Nicht angegeben'}</p>
          {userCompany && <p style={{ color: '#475569', margin: 0, fontSize: '10pt' }}>{userCompany}</p>}
        </div>
        <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4mm', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2mm 0' }}>Mieter</p>
          <p style={{ fontWeight: 700, fontSize: '12pt', color: '#1e293b', margin: '0 0 1mm 0' }}>
            {protocol.tenant_salutation} {protocol.tenant_first_name} {protocol.tenant_last_name}
          </p>
          {protocol.tenant_email && <p style={{ color: '#475569', margin: '0 0 1mm 0', fontSize: '10pt' }}>{protocol.tenant_email}</p>}
          {protocol.tenant_phone && <p style={{ color: '#475569', margin: 0, fontSize: '10pt' }}>{protocol.tenant_phone}</p>}
          {protocol.type === 'Auszug' && protocol.tenant_new_address && (
            <p style={{ color: '#475569', margin: '1mm 0 0 0', fontSize: '10pt' }}>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '8pt' }}>Neue Anschrift:</span>
              {protocol.tenant_new_address}
            </p>
          )}
        </div>
      </div>

      {/* ── OBJECT ── */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4mm', backgroundColor: '#f8fafc', marginBottom: '6mm' }}>
        <p style={{ fontSize: '8pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2mm 0' }}>Objekt</p>
        <p style={{ fontWeight: 600, fontSize: '11pt', color: '#1e293b', margin: 0 }}>{propertyAddress || 'Nicht angegeben'}</p>
      </div>

      {/* ── GENERAL CONDITION ── */}
      {protocol.general_condition && (
        <div style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '2mm', marginBottom: '3mm', marginTop: 0 }}>
            Allgemeiner Zustand
          </h2>
          <p style={{ color: '#334155', margin: 0, whiteSpace: 'pre-wrap' }}>{protocol.general_condition}</p>
        </div>
      )}

      {/* ── ROOMS ── */}
      {rooms.length > 0 && (
        <div style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '2mm', marginBottom: '4mm', marginTop: 0 }}>
            Räume &amp; Zustand
          </h2>
          {rooms.map((room: any, idx: number) => (
            <div key={room.id || idx} style={{
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${room.condition === 'Alles okay' ? '#10b981' : '#ef4444'}`,
              borderRadius: '4px',
              marginBottom: '4mm',
              backgroundColor: '#ffffff',
              pageBreakInside: 'avoid',
              overflow: 'hidden',
            }}>
              {/* Room header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3mm 4mm', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
                <span style={{ fontWeight: 700, fontSize: '12pt', color: '#1e293b' }}>{room.name}</span>
                <span style={{
                  fontSize: '8pt', fontWeight: 700, padding: '2px 10px', borderRadius: '999px',
                  backgroundColor: room.condition === 'Alles okay' ? '#d1fae5' : '#fee2e2',
                  color: room.condition === 'Alles okay' ? '#065f46' : '#991b1b',
                }}>
                  {room.condition}
                </span>
              </div>

              {/* Defects */}
              {room.condition !== 'Alles okay' && room.defects && room.defects.length > 0 && (
                <div style={{ padding: '3mm 4mm' }}>
                  {room.defects.map((defect: any, dIdx: number) => (
                    <div key={defect.id || dIdx} style={{
                      backgroundColor: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '4px',
                      padding: '3mm',
                      marginBottom: dIdx < room.defects.length - 1 ? '3mm' : 0,
                      pageBreakInside: 'avoid',
                    }}>
                      <p style={{ fontSize: '9pt', fontWeight: 700, color: '#92400e', margin: '0 0 1.5mm 0' }}>Mangel {dIdx + 1}:</p>
                      <p style={{ fontSize: '10pt', color: '#78350f', margin: '0 0 3mm 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{defect.description}</p>

                      {/* Defect photos - only if they actually loaded (non-empty base64) */}
                      {defect.photoUrls && defect.photoUrls.filter((u: string) => u && u.length > 50).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3mm', marginTop: '2mm' }}>
                          {defect.photoUrls.filter((u: string) => u && u.length > 50).map((url: string, pIdx: number) => (
                            <div key={pIdx} style={{
                              width: 'calc(50% - 2mm)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              backgroundColor: '#f8fafc',
                            }}>
                              <img
                                src={url}
                                alt={`Foto ${pIdx + 1}`}
                                style={{ width: '100%', height: 'auto', maxHeight: '70mm', objectFit: 'contain', display: 'block', backgroundColor: '#f8fafc' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {(room.condition === 'Alles okay' || !room.defects || room.defects.length === 0) && (
                <div style={{ padding: '2mm 4mm' }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── METERS ── */}
      {meters.length > 0 && (
        <div style={{ marginBottom: '6mm' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '2mm', marginBottom: '4mm', marginTop: 0 }}>
            Zählerstände
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', marginBottom: metersWithPhoto.length > 0 ? '4mm' : 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                <th style={{ padding: '2.5mm 3mm', textAlign: 'left', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px' }}>Zählerart</th>
                <th style={{ padding: '2.5mm 3mm', textAlign: 'left', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px' }}>Zählernummer</th>
                <th style={{ padding: '2.5mm 3mm', textAlign: 'left', fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '1px' }}>Zählerstand</th>
              </tr>
            </thead>
            <tbody>
              {meters.map((meter: any, idx: number) => (
                <tr key={meter.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '2.5mm 3mm', borderBottom: '1px solid #e2e8f0' }}>{meter.type}</td>
                  <td style={{ padding: '2.5mm 3mm', borderBottom: '1px solid #e2e8f0', fontFamily: 'monospace' }}>{meter.number}</td>
                  <td style={{ padding: '2.5mm 3mm', borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>{meter.reading}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Meter photos */}
          {metersWithPhoto.filter((m: any) => m.photoUrl && m.photoUrl.length > 50).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4mm', marginTop: '3mm' }}>
              {metersWithPhoto.filter((m: any) => m.photoUrl && m.photoUrl.length > 50).map((meter: any, idx: number) => (
                <div key={meter.id || idx} style={{ width: 'calc(33.33% - 3mm)', pageBreakInside: 'avoid' }}>
                  <p style={{ fontSize: '8pt', fontWeight: 700, color: '#475569', textTransform: 'uppercase', margin: '0 0 1.5mm 0' }}>
                    {meter.type} ({meter.number})
                  </p>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <img
                      src={meter.photoUrl}
                      alt={`Zähler ${meter.type}`}
                      style={{ width: '100%', height: 'auto', maxHeight: '50mm', objectFit: 'contain', display: 'block', backgroundColor: '#f8fafc' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── KEYS ── */}
      {keys.length > 0 && (
        <div style={{ marginBottom: '6mm', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '2mm', marginBottom: '4mm', marginTop: 0 }}>
            Schlüsselübergabe
          </h2>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            {keys.map((key: any, idx: number) => (
              <div key={key.id || idx} style={{
                display: 'flex', alignItems: 'center', gap: '4mm',
                padding: '2.5mm 4mm',
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: idx < keys.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}>
                <span style={{
                  minWidth: '10mm', textAlign: 'center', fontWeight: 700, fontSize: '11pt',
                  backgroundColor: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: '4px', padding: '1mm 2mm', color: '#1e293b',
                }}>
                  {key.count}x
                </span>
                <span style={{ color: '#334155', fontSize: '10pt' }}>{key.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIGNATURES ── */}
      <div style={{ marginTop: '8mm', pageBreakInside: 'avoid' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6mm' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 700, color: '#1e293b', textAlign: 'center', margin: '0 0 6mm 0' }}>
            Unterschriften
          </h2>
          <div style={{ display: 'flex', gap: '8mm' }}>
            {/* Landlord */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '35mm', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '2px solid #94a3b8', marginBottom: '3mm',
                backgroundColor: 'rgba(248,250,252,0.5)',
              }}>
                {protocol.landlord_signature && protocol.landlord_signature.length > 50 ? (
                  <img src={protocol.landlord_signature} alt="Unterschrift Vermieter"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '4mm' }} />
                ) : (
                  <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '10pt' }}>Fehlt</span>
                )}
              </div>
              <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 1mm 0', fontSize: '10pt' }}>Vermieter / Verwalter</p>
              <p style={{ color: '#64748b', margin: 0, fontSize: '9pt' }}>{userName || 'Nicht angegeben'}</p>
            </div>
            {/* Tenant */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '35mm', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderBottom: '2px solid #94a3b8', marginBottom: '3mm',
                backgroundColor: 'rgba(248,250,252,0.5)',
              }}>
                {protocol.tenant_signature && protocol.tenant_signature.length > 50 ? (
                  <img src={protocol.tenant_signature} alt="Unterschrift Mieter"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: '4mm' }} />
                ) : (
                  <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '10pt' }}>Fehlt</span>
                )}
              </div>
              <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 1mm 0', fontSize: '10pt' }}>Mieter</p>
              <p style={{ color: '#64748b', margin: 0, fontSize: '9pt' }}>
                {protocol.tenant_first_name} {protocol.tenant_last_name}
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: '8pt', color: '#94a3b8', marginTop: '5mm', marginBottom: 0 }}>
            Dieses Protokoll wurde digital erstellt und signiert am {format(new Date(protocol.finalized_at || new Date()), 'dd.MM.yyyy HH:mm', { locale: de })} Uhr.
          </p>
        </div>
      </div>

    </div>
  )
}
