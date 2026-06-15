import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'forest' | 'bark' | 'amber' | 'slate'

const tones: Record<BadgeTone, { wrap: string; dot: string }> = {
  forest: { wrap: 'bg-forest-100 text-forest-700', dot: 'bg-forest-500' },
  bark: { wrap: 'bg-bark-100 text-bark-700', dot: 'bg-bark-500' },
  amber: { wrap: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  slate: { wrap: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  /** Show a small leading status dot. */
  dot?: boolean
}

/** Soft pill badge with an optional status dot (toulouse-style). */
export function Badge({ tone = 'forest', dot = false, className, children, ...props }: BadgeProps) {
  const t = tones[tone]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        t.wrap,
        className,
      )}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  )
}
