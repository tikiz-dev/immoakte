import { cn } from '@/lib/utils'

interface PhoneFrameProps {
  children?: React.ReactNode
  className?: string
  /** Float/tilt the phone slightly — nice for hero compositions. */
  tilt?: boolean
}

/**
 * A realistic iPhone-esque frame rendered entirely in CSS/SVG.
 * Pass protocol/screenshot content as children — the screen area is
 * 300×640, rounded to match the bezel.
 */
export function PhoneFrame({ children, className, tilt }: PhoneFrameProps) {
  return (
    <div
      className={cn(
        'relative mx-auto',
        'w-[300px] h-[620px]',
        tilt && 'transform-gpu [transform:perspective(1400px)_rotateY(-6deg)_rotateX(4deg)]',
        className
      )}
      style={{ filter: 'drop-shadow(0 30px 60px rgba(28, 25, 23, 0.18)) drop-shadow(0 12px 24px rgba(28, 25, 23, 0.08))' }}
    >
      {/* Outer bezel */}
      <div className="absolute inset-0 rounded-[46px] bg-gradient-to-br from-ink-800 via-ink-900 to-ink-800 p-[10px]">
        {/* Inner metallic sheen */}
        <div className="absolute inset-0 rounded-[46px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-[110px] h-10 w-[3px] rounded-l bg-ink-700" />
        <div className="absolute -left-[3px] top-[160px] h-16 w-[3px] rounded-l bg-ink-700" />
        <div className="absolute -left-[3px] top-[230px] h-16 w-[3px] rounded-l bg-ink-700" />
        <div className="absolute -right-[3px] top-[140px] h-24 w-[3px] rounded-r bg-ink-700" />
        {/* Screen */}
        <div className="relative h-full w-full rounded-[36px] overflow-hidden bg-background">
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-[26px] w-[92px] rounded-full bg-ink-900 z-20" />
          {/* Status bar spacer */}
          <div className="h-11 flex items-center justify-between px-6 text-[11px] font-semibold text-foreground relative z-10">
            <span>9:41</span>
            <span className="inline-flex items-center gap-1">
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><rect x="1" y="1" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.7"/><rect x="2.5" y="2.5" width="10" height="5" rx="0.5" fill="currentColor"/></svg>
            </span>
          </div>
          {/* Content area */}
          <div className="relative h-[calc(100%-44px)] overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
