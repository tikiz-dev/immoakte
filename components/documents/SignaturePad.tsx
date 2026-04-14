'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  label: string
  hint?: string
  onSigned: (dataUrl: string) => void
  initialDataUrl?: string | null
  disabled?: boolean
}

/**
 * Canvas-Signatur mit Maus und Touch.
 * Schreibt auf einem HiDPI-Canvas; liefert PNG als dataURL.
 */
export function SignaturePad({ label, hint, onSigned, initialDataUrl, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawingRef = useRef(false)
  const hasInkRef = useRef(false)
  const [empty, setEmpty] = useState(!initialDataUrl)
  const [confirmed, setConfirmed] = useState(!!initialDataUrl)

  // Setup canvas with DPR
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1c1917'
    ctxRef.current = ctx

    // Load initial signature if provided
    if (initialDataUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        hasInkRef.current = true
        setEmpty(false)
      }
      img.src = initialDataUrl
    }
  }, [initialDataUrl])

  const getPoint = useCallback((e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const start = useCallback((e: React.PointerEvent) => {
    if (disabled || confirmed) return
    e.preventDefault()
    drawingRef.current = true
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    try { canvasRef.current?.setPointerCapture(e.pointerId) } catch {}
  }, [disabled, confirmed, getPoint])

  const move = useCallback((e: React.PointerEvent) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y } = getPoint(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    hasInkRef.current = true
    if (empty) setEmpty(false)
  }, [empty, getPoint])

  const end = useCallback((e: React.PointerEvent) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    try { canvasRef.current?.releasePointerCapture(e.pointerId) } catch {}
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasInkRef.current = false
    setEmpty(true)
    setConfirmed(false)
  }, [])

  const confirm = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || empty) return
    // Create a trimmed, compact PNG
    const dataUrl = canvas.toDataURL('image/png')
    setConfirmed(true)
    onSigned(dataUrl)
  }, [empty, onSigned])

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass-600">{label}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        {confirmed && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Signiert
          </span>
        )}
      </div>
      <div
        className={cn(
          'relative bg-card border rounded-xl overflow-hidden',
          confirmed ? 'border-emerald-300 bg-emerald-50/30' : 'border-dashed border-border',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <canvas
          ref={canvasRef}
          className="block w-full touch-none"
          style={{ height: '160px', cursor: disabled || confirmed ? 'default' : 'crosshair' }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
        />
        {empty && !disabled && !confirmed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground italic">Hier unterschreiben</p>
          </div>
        )}
        {/* Baseline */}
        <div className="absolute left-4 right-4 bottom-6 h-px bg-border pointer-events-none" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          disabled={disabled || empty}
          className="h-7 text-xs gap-1 text-muted-foreground"
        >
          <Eraser className="h-3 w-3" />
          Zurücksetzen
        </Button>
        {!confirmed && (
          <Button
            type="button"
            size="sm"
            onClick={confirm}
            disabled={disabled || empty}
            className="h-7 text-xs gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Bestätigen
          </Button>
        )}
      </div>
    </div>
  )
}
