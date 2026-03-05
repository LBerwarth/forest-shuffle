import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ScoreBreakdown } from '@/types/scoring'
import { CATEGORY_ICONS, getCategoryOrder } from '@/data/categories'
import type { GameEdition } from '@/types/card'

interface ScoreSummaryProps {
  breakdown: ScoreBreakdown | null
  className?: string
  edition?: GameEdition
}

export function ScoreSummary({ breakdown, className, edition = 'classic' }: ScoreSummaryProps) {
  const { t } = useTranslation()
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
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="font-medium tabular-nums">{pts}</span>
              </div>
            )
          })}
      </div>
      <div className="flex items-center gap-1.5 border-l border-forest-200 pl-3">
        <span className="text-xs text-forest-500 font-medium">{t('scoring.total')}</span>
        <span className="text-xl font-bold text-forest-700 tabular-nums">{total}</span>
      </div>
    </div>
  )
}
