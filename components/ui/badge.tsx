import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap leading-none h-[22px]',
  {
    variants: {
      variant: {
        default:    'bg-muted text-foreground/80',
        draft:      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        active:     'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
        final:      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
        alert:      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
        brass:      'bg-brass-100 text-brass-800 dark:bg-brass-900/40 dark:text-brass-300',
        ink:        'bg-ink-700 text-background dark:bg-brass-300 dark:text-ink-900',
        outline:    'border border-border text-foreground/70',
      },
      size: {
        default: 'h-[22px] px-2.5 text-[11px]',
        sm:      'h-5 px-2 text-[10px]',
        lg:      'h-6 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { badgeVariants }
