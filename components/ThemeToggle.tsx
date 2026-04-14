'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  /** Compact single-button variant that cycles light → dark → system. */
  compact?: boolean
  className?: string
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  if (compact) {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    const Icon = resolvedTheme === 'dark' ? Sun : Moon
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          className
        )}
        aria-label={resolvedTheme === 'dark' ? 'Hell aktivieren' : 'Dunkel aktivieren'}
        title={resolvedTheme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}
      >
        <Icon className="h-4 w-4" />
      </button>
    )
  }

  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string; Icon: typeof Sun }> = [
    { value: 'light', label: 'Hell', Icon: Sun },
    { value: 'dark', label: 'Dunkel', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
  ]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1',
        className
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map(({ value, label, Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all',
              active
                ? 'bg-ink-700 text-background shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
