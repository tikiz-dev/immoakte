import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  /** Kicker / eyebrow text — small caps above the title. */
  kicker?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  kicker, title, subtitle, align = 'left', action, className,
}: SectionHeaderProps) {
  const centered = align === 'center'
  return (
    <div className={cn('flex items-end justify-between gap-6', centered && 'flex-col items-center text-center', className)}>
      <div className={cn('min-w-0', centered && 'w-full max-w-2xl')}>
        {kicker && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brass-600 dark:text-brass-400">
            {kicker}
          </p>
        )}
        <h2 className="font-heading text-3xl sm:text-4xl leading-[1.1] tracking-tight text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-prose">
            {subtitle}
          </p>
        )}
      </div>
      {action && !centered && <div className="shrink-0">{action}</div>}
    </div>
  )
}
