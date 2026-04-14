'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ArrowLeft, Trash2, Home, Gauge, Key, FileSignature, Check, MapPin } from 'lucide-react'
import { SignaturePad, type SignaturePadHandle } from '@/components/SignaturePad'
import { PrintableProtocol } from '@/components/PrintableProtocol'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { RoomsTab } from '@/components/protocol/RoomsTab'
import { MetersTab } from '@/components/protocol/MetersTab'
import { KeysTab } from '@/components/protocol/KeysTab'
import { FinishTab } from '@/components/protocol/FinishTab'
import { FinalizedView } from '@/components/protocol/FinalizedView'

const safeFormatDate = (dateStr: any) => {
  if (!dateStr) return 'Kein Datum'
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de })
  } catch {
    return 'Ungültiges Datum'
  }
}

export default function ProtocolView() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [protocol, setProtocol] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('rooms')
  const [userName, setUserName] = useState('')
  const [userCompany, setUserCompany] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [landlordSigEmpty, setLandlordSigEmpty] = useState(true)
  const [tenantSigEmpty, setTenantSigEmpty] = useState(true)
  const landlordSigRef = useRef<SignaturePadHandle>(null)
  const tenantSigRef = useRef<SignaturePadHandle>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [resolvedImages, setResolvedImages] = useState<Map<string, string>>(new Map())

  const extractStoragePath = (urlOrPath: string): string | null => {
    if (!urlOrPath || urlOrPath.startsWith('data:')) return null
    if (!urlOrPath.startsWith('http')) return urlOrPath
    const marker = '/object/public/protocol-images/'
    const idx = urlOrPath.indexOf(marker)
    if (idx !== -1) return decodeURIComponent(urlOrPath.slice(idx + marker.length).split('?')[0])
    return null
  }

  const resolveImageUrl = (urlOrPath: string): string => {
    if (!urlOrPath || urlOrPath.startsWith('data:')) return urlOrPath
    const path = extractStoragePath(urlOrPath)
    if (!path) return urlOrPath
    return resolvedImages.get(path) || urlOrPath
  }

  const loadResolvedImages = async (proto: any) => {
    const paths = new Set<string>()
    proto.rooms?.forEach((r: any) =>
      r.defects?.forEach((d: any) =>
        d.photoUrls?.forEach((u: string) => { const p = extractStoragePath(u); if (p) paths.add(p) })
      )
    )
    proto.meters?.forEach((m: any) => { const p = extractStoragePath(m.photoUrl); if (p) paths.add(p) })
    if (paths.size === 0) return
    const { data } = await supabase.storage.from('protocol-images').createSignedUrls([...paths], 86400)
    const map = new Map<string, string>(resolvedImages)
    data?.forEach(({ path, signedUrl }: any) => { if (signedUrl) map.set(path, signedUrl) })
    setResolvedImages(map)
  }

  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    setIsOnline(navigator.onLine)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  useEffect(() => {
    if (!id || !user) return

    const fetchData = async () => {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('name, company')
          .eq('id', user.id)
          .single()
        if (profile) {
          setUserName(profile.name || '')
          setUserCompany(profile.company || '')
        }

        const { data: proto, error } = await supabase
          .from('protocols')
          .select('*')
          .eq('id', id)
          .eq('owner_id', user.id)
          .single()

        if (error || !proto) {
          toast.error('Protokoll nicht gefunden oder keine Berechtigung')
          router.push('/dashboard')
          return
        }

        setProtocol(proto)
        loadResolvedImages(proto)

        if (proto.property_id) {
          const { data: prop } = await supabase
            .from('properties')
            .select('address')
            .eq('id', proto.property_id)
            .single()
          if (prop) setPropertyAddress(prop.address || '')
        }
      } catch {
        toast.error('Fehler beim Laden des Protokolls')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  useEffect(() => {
    if (searchParams.get('finalized') === 'true' && protocol && !loading) {
      setActiveTab('finish')
      setTimeout(() => generatePDF(true), 500)
      router.replace(`/protocol/${id}`)
    }
  }, [searchParams, protocol, loading])

  const saveProtocol = async (updatedData: any) => {
    if (!id) return
    try {
      const { error } = await supabase
        .from('protocols')
        .update({ ...updatedData, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
      setProtocol((prev: any) => ({ ...prev, ...updatedData }))
    } catch {
      toast.error('Fehler beim Speichern')
    }
  }

  const handlePhotoUpload = async (file: File): Promise<string> => {
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Bild zu groß (max. 20 MB)')
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 1200
          let width = img.width
          let height = img.height
          if (width > height) {
            if (width > MAX) { height *= MAX / width; width = MAX }
          } else {
            if (height > MAX) { width *= MAX / height; height = MAX }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) { reject(new Error('Canvas context not available')); return }
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(async (blob) => {
            if (!blob) { reject(new Error('Fehler beim Verarbeiten des Bildes')); return }
            try {
              const path = `${user!.id}/${id}/${crypto.randomUUID()}.jpg`
              const { data, error } = await supabase.storage
                .from('protocol-images')
                .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
              if (error) throw error
              const { data: signed } = await supabase.storage
                .from('protocol-images')
                .createSignedUrl(data.path, 86400)
              if (signed?.signedUrl) {
                setResolvedImages(prev => new Map(prev).set(data.path, signed.signedUrl))
              }
              resolve(data.path)
            } catch (err) {
              reject(err)
            }
          }, 'image/jpeg', 0.75)
        }
        img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'))
      reader.readAsDataURL(file)
    })
  }

  const deleteStoragePhoto = async (urlOrPath: string) => {
    if (!urlOrPath || urlOrPath.startsWith('data:')) return
    try {
      const path = extractStoragePath(urlOrPath) || urlOrPath
      await supabase.storage.from('protocol-images').remove([path])
      setResolvedImages(prev => { const m = new Map(prev); m.delete(path); return m })
    } catch { /* non-critical */ }
  }

  const executeDelete = async () => {
    const { error } = await supabase.from('protocols').delete().eq('id', id)
    if (error) { toast.error('Fehler beim Löschen'); return }
    toast.success('Protokoll gelöscht')
    router.push('/dashboard')
  }

  const areAllRoomsValid = () => (protocol.rooms || []).every((room: any) => {
    if (room.condition === 'Alles okay') return true
    if (!room.defects || room.defects.length === 0) return false
    return room.defects.every((d: any) => d.description?.trim().length > 0 && d.photoUrls?.length > 0)
  })

  const areAllMetersValid = () =>
    (protocol.meters || []).every((m: any) => m.number?.trim().length > 0 && m.reading?.trim().length > 0 && m.photoUrl?.length > 0)

  const sendEmail = async () => {
    toast.success(`Protokoll wurde an ${protocol.tenant_email} gesendet.`)
    setIsEmailDialogOpen(false)
    router.push('/dashboard')
  }

  const handleFinalize = async () => {
    if (!areAllRoomsValid()) {
      toast.error('Bitte füllen Sie alle Pflichtfelder bei den Mängeln aus (Beschreibung & mind. ein Foto pro Mangel).')
      setActiveTab('rooms')
      return
    }
    if (!areAllMetersValid()) {
      toast.error('Bitte füllen Sie alle Zählerdaten aus (Nummer, Stand & Foto pro Zähler).')
      setActiveTab('meters')
      return
    }

    const landlordSig = landlordSigRef.current?.getDataURL()
    const tenantSig = tenantSigRef.current?.getDataURL()

    if (!landlordSig || !tenantSig) {
      toast.error('Beide Unterschriften werden benötigt.')
      setActiveTab('finish')
      return
    }

    await saveProtocol({ landlord_signature: landlordSig, tenant_signature: tenantSig })

    setIsCheckoutLoading(true)
    try {
      const res = await fetch('/api/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId: id }),
      })

      if (res.ok) {
        setProtocol((prev: any) => ({ ...prev, finalized_at: new Date().toISOString(), status: 'final' }))
        await generatePDF(true)
        if (protocol.tenant_email) setIsEmailDialogOpen(true)
        else router.push('/dashboard')
      } else {
        const data = await res.json()
        if (data.error === 'payment_required') {
          const checkoutRes = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ONDEMAND,
              mode: 'payment',
              protocolId: id,
            }),
          })
          const { url } = await checkoutRes.json()
          if (url) window.location.href = url
        } else {
          toast.error('Fehler beim Abschließen')
        }
      }
    } catch {
      toast.error('Fehler beim Abschließen')
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  const urlToBase64 = async (urlOrPath: string): Promise<string> => {
    if (!urlOrPath) return ''
    if (urlOrPath.startsWith('data:')) return urlOrPath
    try {
      let url = urlOrPath
      if (!urlOrPath.startsWith('http')) {
        const { data } = await supabase.storage.from('protocol-images').createSignedUrl(urlOrPath, 300)
        if (!data?.signedUrl) return ''
        url = data.signedUrl
      }
      const res = await fetch(url)
      if (!res.ok) return ''
      const blob = await res.blob()
      return await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve('')
        reader.readAsDataURL(blob)
      })
    } catch { return '' }
  }

  const prepareProtocolImages = async (p: any) => {
    const copy = { ...p }
    if (copy.rooms) {
      copy.rooms = await Promise.all(copy.rooms.map(async (room: any) => ({
        ...room,
        defects: room.defects ? await Promise.all(room.defects.map(async (d: any) => ({
          ...d,
          photoUrls: d.photoUrls ? await Promise.all(d.photoUrls.map(urlToBase64)) : [],
        }))) : [],
      })))
    }
    if (copy.meters) {
      copy.meters = await Promise.all(copy.meters.map(async (m: any) => ({
        ...m,
        photoUrl: m.photoUrl ? await urlToBase64(m.photoUrl) : '',
      })))
    }
    if (copy.landlord_signature && !copy.landlord_signature.startsWith('data:')) {
      copy.landlord_signature = await urlToBase64(copy.landlord_signature)
    }
    if (copy.tenant_signature && !copy.tenant_signature.startsWith('data:')) {
      copy.tenant_signature = await urlToBase64(copy.tenant_signature)
    }
    return copy
  }

  const downloadStoredPDF = async () => {
    if (!protocol?.pdf_url) return false
    try {
      const link = document.createElement('a')
      link.href = protocol.pdf_url
      link.download = `Protokoll_${protocol.tenant_first_name}_${protocol.tenant_last_name}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return true
    } catch { return false }
  }

  const generatePDF = async (uploadAndStore = false) => {
    if (protocol?.pdf_url && !uploadAndStore) {
      const ok = await downloadStoredPDF()
      if (ok) return
    }

    try {
      toast.loading('Generiere PDF... Bitte warten.', { id: 'pdf-gen' })
      toast.loading('Lade Bilder...', { id: 'pdf-gen' })
      const preparedProtocol = await prepareProtocolImages(protocol)

      const container = document.createElement('div')
      container.style.cssText = 'position:absolute;left:-9999px;top:0;background:#fff;'
      document.body.appendChild(container)

      const { createRoot } = await import('react-dom/client')
      const root = createRoot(container)

      await new Promise<void>((resolve) => {
        root.render(
          <PrintableProtocol
            protocol={preparedProtocol}
            userName={userName}
            userCompany={userCompany}
            propertyAddress={propertyAddress}
          />
        )
        setTimeout(resolve, 800)
      })

      const element = container.querySelector('#pdf-content')
      if (!element) throw new Error('PDF container not found')

      toast.loading('Erstelle PDF...', { id: 'pdf-gen' })

      const html2pdf = (await import('html2pdf.js')).default
      const filename = `Protokoll_${protocol.tenant_first_name}_${protocol.tenant_last_name}.pdf`

      const opt: any = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      }

      const pdfBlob: Blob = await html2pdf().set(opt).from(element as HTMLElement).outputPdf('blob')

      if (uploadAndStore) {
        try {
          toast.loading('Speichere PDF...', { id: 'pdf-gen' })
          const formData = new FormData()
          formData.append('pdf', pdfBlob, filename)
          formData.append('protocolId', id)
          const res = await fetch('/api/protocol/save-pdf', { method: 'POST', body: formData })
          const data = await res.json()
          if (data.url) {
            setProtocol((prev: any) => ({ ...prev, pdf_url: data.url }))
          }
        } catch (e) {
          console.warn('PDF upload failed, falling back to local download', e)
        }
      }

      const pdfUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000)

      toast.success('PDF erfolgreich heruntergeladen', { id: 'pdf-gen' })

      setTimeout(() => {
        root.unmount()
        if (document.body.contains(container)) document.body.removeChild(container)
      }, 1000)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Fehler bei der PDF-Erstellung', { id: 'pdf-gen' })
    }
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Lade Protokoll...</p>
    </div>
  )
  if (!protocol) return null

  const isFinalized = !!protocol.finalized_at
  const tenantName = `${protocol.tenant_salutation ? protocol.tenant_salutation + ' ' : ''}${protocol.tenant_first_name} ${protocol.tenant_last_name}`.trim()

  if (isFinalized) {
    return (
      <FinalizedView
        protocol={protocol}
        resolveImageUrl={resolveImageUrl}
        userName={userName}
        userCompany={userCompany}
        propertyAddress={propertyAddress}
        isOnline={isOnline}
        tenantName={tenantName}
        isEmailDialogOpen={isEmailDialogOpen}
        setIsEmailDialogOpen={setIsEmailDialogOpen}
        onGeneratePDF={generatePDF}
        onSendEmail={sendEmail}
        onBack={() => router.push('/dashboard')}
      />
    )
  }

  // Step progress derivation
  const steps: Array<{ key: string; label: string; icon: any; done: boolean }> = [
    {
      key: 'rooms',
      label: 'Räume',
      icon: Home,
      done: (protocol.rooms || []).length > 0 && (protocol.rooms || []).every((r: any) =>
        r.condition === 'Alles okay' || (r.defects?.length && r.defects.every((d: any) => d.description?.trim() && d.photoUrls?.length))
      ),
    },
    {
      key: 'meters',
      label: 'Zähler',
      icon: Gauge,
      done: (protocol.meters || []).length > 0 && (protocol.meters || []).every((m: any) => m.number?.trim() && m.reading?.trim() && m.photoUrl?.length),
    },
    {
      key: 'keys',
      label: 'Schlüssel',
      icon: Key,
      done: (protocol.keys || []).length > 0,
    },
    {
      key: 'finish',
      label: 'Signatur',
      icon: FileSignature,
      done: !landlordSigEmpty && !tenantSigEmpty,
    },
  ]
  const currentIndex = steps.findIndex(s => s.key === activeTab)
  const completedCount = steps.filter(s => s.done).length

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top nav bar */}
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/tenancy/${protocol.tenancy_id || ''}`.replace(/\/$/, '') || '/dashboard')} className="shrink-0" title="Zurück">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.14em] font-semibold shrink-0">{protocol.type === 'Einzug' ? 'Einzug' : 'Auszug'}</p>
            <span className="text-muted-foreground/40">·</span>
            <p className="text-sm text-foreground truncate">{tenantName}</p>
          </div>
          <Badge variant="draft" size="sm">Entwurf</Badge>
          <Button variant="ghost" size="icon" onClick={() => setIsDeleteDialogOpen(true)} className="text-muted-foreground hover:text-destructive shrink-0" title="Löschen">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {/* Hero with address + progress */}
        <section className="pt-6 pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">{protocol.type}sprotokoll</p>
          <h1 className="font-heading text-2xl md:text-3xl text-foreground mt-1 leading-tight">{tenantName}</h1>
          {propertyAddress && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{propertyAddress}</span>
            </p>
          )}
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Custom stepper */}
          <div className="sticky top-14 z-10 bg-background/90 backdrop-blur-md pt-3 pb-4 -mx-4 px-4 border-b border-border mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Schritt {currentIndex + 1} von {steps.length}
                {completedCount > 0 && <span className="ml-2 text-emerald-700">· {completedCount} erledigt</span>}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, i) => {
                const active = step.key === activeTab
                const done = step.done
                const Icon = step.icon
                return (
                  <button
                    key={step.key}
                    onClick={() => setActiveTab(step.key)}
                    className="group flex flex-col items-center gap-1.5 text-center"
                  >
                    <div className="relative w-full">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          done ? 'bg-emerald-500' : active ? 'bg-ink-700' : i < currentIndex ? 'bg-brass-400' : 'bg-border'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                          done
                            ? 'bg-emerald-500 text-white'
                            : active
                              ? 'bg-ink-700 text-background'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-medium truncate ${
                          active ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <TabsContent value="rooms" className="space-y-4">
            <RoomsTab
              protocol={protocol}
              isFinalized={isFinalized}
              resolveImageUrl={resolveImageUrl}
              handlePhotoUpload={handlePhotoUpload}
              deleteStoragePhoto={deleteStoragePhoto}
              saveProtocol={saveProtocol}
              setProtocol={setProtocol}
            />
          </TabsContent>

          <TabsContent value="meters" className="space-y-4">
            <MetersTab
              protocol={protocol}
              isFinalized={isFinalized}
              resolveImageUrl={resolveImageUrl}
              handlePhotoUpload={handlePhotoUpload}
              deleteStoragePhoto={deleteStoragePhoto}
              saveProtocol={saveProtocol}
              setProtocol={setProtocol}
            />
          </TabsContent>

          <TabsContent value="keys" className="space-y-4">
            <KeysTab
              protocol={protocol}
              isFinalized={isFinalized}
              saveProtocol={saveProtocol}
              setProtocol={setProtocol}
            />
          </TabsContent>

          <TabsContent value="finish" className="space-y-6">
            <FinishTab
              protocol={protocol}
              isCheckoutLoading={isCheckoutLoading}
              landlordSigRef={landlordSigRef}
              tenantSigRef={tenantSigRef}
              landlordSigEmpty={landlordSigEmpty}
              tenantSigEmpty={tenantSigEmpty}
              setLandlordSigEmpty={setLandlordSigEmpty}
              setTenantSigEmpty={setTenantSigEmpty}
              saveProtocol={saveProtocol}
              setProtocol={setProtocol}
              onFinalize={handleFinalize}
              onGeneratePDF={generatePDF}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Protokoll löschen</DialogTitle>
            <DialogDescription>Möchten Sie dieses Protokoll wirklich unwiderruflich löschen?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={executeDelete}>Löschen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
