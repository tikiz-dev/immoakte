'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Droplets, FileText, Flame, Lock, MapPin, Thermometer, WifiOff, Zap } from 'lucide-react'

interface FinalizedViewProps {
  protocol: any
  resolveImageUrl: (urlOrPath: string) => string
  userName: string
  userCompany: string
  propertyAddress: string
  isOnline: boolean
  tenantName: string
  isEmailDialogOpen: boolean
  setIsEmailDialogOpen: (v: boolean) => void
  onGeneratePDF: (uploadAndStore?: boolean) => Promise<void>
  onSendEmail: () => void
  onBack: () => void
}

export function FinalizedView({
  protocol, resolveImageUrl, userName, userCompany, propertyAddress,
  isOnline, tenantName, isEmailDialogOpen, setIsEmailDialogOpen,
  onGeneratePDF, onSendEmail, onBack,
}: FinalizedViewProps) {
  const rooms: any[] = protocol.rooms || []
  const meters: any[] = (protocol.meters || []).filter((m: any) => m.number || m.reading)
  const keys: any[] = protocol.keys || []

  const METER_ICONS: Record<string, React.ReactNode> = {
    Strom:   <Zap         className="h-4 w-4 text-yellow-500" />,
    Wasser:  <Droplets    className="h-4 w-4 text-blue-500"   />,
    Gas:     <Flame       className="h-4 w-4 text-orange-500" />,
    Heizung: <Thermometer className="h-4 w-4 text-red-500"    />,
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {!isOnline && (
        <div className="sticky top-0 z-30 bg-destructive text-background text-xs font-medium px-4 py-2 flex items-center gap-2 justify-center">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          Kein Internet — Änderungen werden derzeit nicht gespeichert
        </div>
      )}

      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.14em] font-semibold shrink-0">{protocol.type}</p>
            <span className="text-muted-foreground/40">·</span>
            <p className="text-sm text-foreground truncate">{tenantName}</p>
          </div>
          <Badge variant="final" size="sm"><Lock className="h-3 w-3" />Abgeschlossen</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-ink">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />
          <div className="p-6 md:p-8 space-y-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">{protocol.type}sprotokoll</p>
              <h1 className="font-heading text-2xl md:text-3xl text-foreground mt-1 leading-tight">{tenantName}</h1>
              {propertyAddress && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{propertyAddress}</span>
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Abgeschlossen am {new Date(protocol.finalized_at).toLocaleString('de-DE')} Uhr
              </p>
            </div>
            <Button className="gap-2 w-full sm:w-auto" onClick={() => onGeneratePDF(false)}>
              <FileText className="h-4 w-4" />
              PDF herunterladen
            </Button>
          </div>
        </section>

        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vermieter</p>
            <p className="font-semibold text-foreground text-sm">{userName || '—'}</p>
            {userCompany && <p className="text-xs text-muted-foreground">{userCompany}</p>}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mieter</p>
            <p className="font-semibold text-foreground text-sm">{tenantName}</p>
            {protocol.tenant_email && <p className="text-xs text-muted-foreground">{protocol.tenant_email}</p>}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objekt &amp; Datum</p>
            <p className="font-semibold text-slate-900 text-sm">{propertyAddress}</p>
            <p className="text-xs text-muted-foreground">{protocol.type} · {new Date(protocol.date).toLocaleDateString('de-DE')}</p>
          </div>
        </div>

        {/* General condition */}
        {protocol.general_condition && (
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Allgemeiner Zustand</p>
            <p className="text-slate-800 font-medium">{protocol.general_condition}</p>
          </div>
        )}

        {/* Rooms */}
        {rooms.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-sm">Räume &amp; Zustand</h2>
              <span className="text-xs text-muted-foreground">{rooms.length} Räume</span>
            </div>
            <div className="divide-y divide-border">
              {rooms.map((room: any, idx: number) => (
                <div key={room.id || idx}>
                  <div className={`flex items-center justify-between px-4 py-3 border-l-4 ${room.condition === 'Alles okay' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
                    <span className="font-medium text-foreground text-sm">{room.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${room.condition === 'Alles okay' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {room.condition}
                    </span>
                  </div>
                  {room.condition !== 'Alles okay' && room.defects?.length > 0 && (
                    <div className="px-4 pb-3 space-y-2">
                      {room.defects.map((defect: any, dIdx: number) => (
                        <div key={defect.id || dIdx} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                          <p className="text-xs font-bold text-amber-700 mb-1">Mangel {dIdx + 1}</p>
                          <p className="text-sm text-amber-900 break-words">{defect.description}</p>
                          {defect.photoUrls?.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {defect.photoUrls.map((url: string, pIdx: number) => (
                                <img key={pIdx} src={resolveImageUrl(url)} alt={`Foto ${pIdx + 1}`}
                                  className="h-20 w-20 object-cover rounded border border-amber-200 cursor-pointer"
                                  onClick={() => window.open(resolveImageUrl(url), '_blank')}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meters */}
        {meters.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-foreground text-sm">Zählerstände</h2>
            </div>
            <div className="divide-y divide-border">
              {meters.map((meter: any, idx: number) => (
                <div key={meter.id || idx} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {METER_ICONS[meter.type] ?? <Zap className="h-4 w-4 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{meter.type}</p>
                    <p className="text-xs text-muted-foreground">Nr. {meter.number}</p>
                  </div>
                  <p className="font-bold text-foreground text-sm">{meter.reading}</p>
                  {meter.photoUrl && (
                    <img src={resolveImageUrl(meter.photoUrl)} alt={meter.type}
                      className="h-10 w-10 object-cover rounded border border-slate-200 cursor-pointer shrink-0"
                      onClick={() => window.open(resolveImageUrl(meter.photoUrl), '_blank')}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keys */}
        {keys.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-foreground text-sm">Schlüsselübergabe</h2>
            </div>
            <div className="divide-y divide-border">
              {keys.map((key: any, idx: number) => (
                <div key={key.id || idx} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-bold text-slate-900 bg-slate-100 rounded px-2 py-0.5 text-sm shrink-0">{key.count}x</span>
                  <span className="text-slate-700 text-sm">{key.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-bold text-foreground text-sm text-center mb-5">Unterschriften</h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="text-center">
              {protocol.landlord_signature ? (
                <img src={protocol.landlord_signature} alt="Unterschrift Vermieter"
                  className="h-20 w-full object-contain mb-2 border-b-2 border-border pb-2" />
              ) : (
                <div className="h-20 border-b-2 border-slate-200 mb-2 flex items-center justify-center">
                  <span className="text-slate-300 text-xs italic">Fehlt</span>
                </div>
              )}
              <p className="font-semibold text-xs text-foreground">Vermieter / Verwalter</p>
              <p className="text-xs text-muted-foreground">{userName}</p>
            </div>
            <div className="text-center">
              {protocol.tenant_signature ? (
                <img src={protocol.tenant_signature} alt="Unterschrift Mieter"
                  className="h-20 w-full object-contain mb-2 border-b-2 border-border pb-2" />
              ) : (
                <div className="h-20 border-b-2 border-slate-200 mb-2 flex items-center justify-center">
                  <span className="text-slate-300 text-xs italic">Fehlt</span>
                </div>
              )}
              <p className="font-semibold text-xs text-foreground">Mieter</p>
              <p className="text-xs text-muted-foreground">{tenantName}</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-slate-100">
            Abgeschlossen am {new Date(protocol.finalized_at).toLocaleString('de-DE')} Uhr
          </p>
        </div>
      </main>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Protokoll versenden</DialogTitle>
            <DialogDescription>
              Möchten Sie das fertige Protokoll jetzt per E-Mail an <strong>{protocol.tenant_email}</strong> senden?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEmailDialogOpen(false); onBack() }}>Später</Button>
            <Button onClick={onSendEmail}>Jetzt senden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
