import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  /** Size of the mark in px. Wordmark scales via CSS. */
  size?: number
  /** Show only the mark (no wordmark text). */
  markOnly?: boolean
  /** Invert for use on dark/ink backgrounds. */
  inverse?: boolean
}

/**
 * ImmoAkte brand mark — a stylized document with a brass wax seal.
 * The mark uses `currentColor` so it picks up the nearest text color.
 * The seal is always brass, regardless of surrounding color.
 */
export function LogoMark({ size = 28, className, inverse = false }: Omit<LogoProps, 'markOnly'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {/* Document body */}
      <path
        d="M7 3.5h12.2a2 2 0 0 1 1.42.59l5.3 5.3A2 2 0 0 1 26.5 10.8V26a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 26V6A2.5 2.5 0 0 1 7 3.5Z"
        fill="currentColor"
      />
      {/* Folded corner */}
      <path
        d="M19.5 3.5v5.3a2 2 0 0 0 2 2h5.2"
        stroke={inverse ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.28)'}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Horizontal lines suggesting text */}
      <line x1="8.5" y1="14.5" x2="18.5" y2="14.5" stroke={inverse ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.5)'} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="8.5" y1="17.5" x2="22" y2="17.5" stroke={inverse ? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.42)'} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="8.5" y1="20.5" x2="17"  y2="20.5" stroke={inverse ? 'rgba(0,0,0,0.26)' : 'rgba(255,255,255,0.34)'} strokeWidth="1.3" strokeLinecap="round" />
      {/* Brass wax seal */}
      <circle cx="22.5" cy="23.5" r="3.6" fill="#c9974b" />
      <circle cx="22.5" cy="23.5" r="3.6" fill="url(#sealGrad)" opacity="0.9" />
      <defs>
        <radialGradient id="sealGrad" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0%" stopColor="#e9c775" />
          <stop offset="60%" stopColor="#c9974b" />
          <stop offset="100%" stopColor="#866327" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export function Logo({ className, size = 28, markOnly, inverse }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} inverse={inverse} className="text-ink-700 dark:text-brass-300" />
      {!markOnly && (
        <span className="font-heading text-[22px] leading-none tracking-tight text-foreground">
          Immo<span className="text-brass-600 dark:text-brass-400">A</span>kte
        </span>
      )}
    </span>
  )
}
