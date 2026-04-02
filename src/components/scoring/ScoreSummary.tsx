import { cn } from '@/lib/utils'
import { AcornIcon } from '@/components/ui/AcornIcon'
import type { ScoreBreakdown } from '@/types/scoring'
import { CATEGORY_ICON_URLS, getCategoryOrder } from '@/data/categories'
import type { GameEdition } from '@/types/card'

interface ScoreSummaryProps {
  breakdown: ScoreBreakdown | null
  className?: string
  edition?: GameEdition
}

export function ScoreSummary({ breakdown, className, edition = 'classic' }: ScoreSummaryProps) {
  const total = breakdown?.total ?? 0
  const categories = breakdown?.categoryTotals
  const categoryOrder = getCategoryOrder(edition)

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl border border-forest-200 bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-card',
      className,
    )}>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
        {categories &&
          categoryOrder.map((cat) => {
            const pts = categories[cat]
            if (pts == null) return null
            return (
              <div
                key={cat}
                className="flex items-center gap-1 text-xs text-forest-500 whitespace-nowrap"
              >
                <img src={CATEGORY_ICON_URLS[cat]} alt="" className="h-4 w-4 rounded-sm" />
                <span className="font-medium tabular-nums">{pts}</span>
              </div>
            )
          })}
      </div>
      <div className="flex items-center gap-1 border-l border-forest-200 pl-3">
        <span className="text-xl font-bold text-forest-700 tabular-nums">{total}</span>
        <AcornIcon className="h-5 w-5" />
      </div>
    </div>
  )
}
