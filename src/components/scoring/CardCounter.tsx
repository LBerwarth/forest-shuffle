import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { CARD_ICONS } from '@/data/cardIcons'
import type { CardDefinition } from '@/types/card'

interface CardCounterProps {
  card: CardDefinition
  count: number
  points: number
  onCountChange: (count: number) => void
  contextValue?: number
  onContextChange?: (value: number) => void
}

export function CardCounter({
  card,
  count,
  points,
  onCountChange,
  contextValue,
  onContextChange,
}: CardCounterProps) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-forest-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {CARD_ICONS[card.key] && (
              <span className="shrink-0 text-base">{CARD_ICONS[card.key]}</span>
            )}
            <span className="font-medium text-forest-800 text-sm truncate">
              {tc(`${card.key}.name`)}
            </span>
            {card.expansion === 'alpine' && (
              <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                {t('scoring.alpine')}
              </span>
            )}
          </div>
          <p className="text-xs text-forest-500 mt-0.5">{tc(`${card.key}.scoring`)}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onCountChange(count - 1)}
            disabled={count <= 0}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
              count <= 0
                ? 'bg-forest-100 text-forest-300'
                : 'bg-forest-100 text-forest-600 hover:bg-forest-200 active:bg-forest-300',
            )}
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="w-8 text-center text-lg font-semibold text-forest-800 tabular-nums">
            {count}
          </span>

          <button
            type="button"
            onClick={() => onCountChange(count + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-500 text-white hover:bg-forest-600 active:bg-forest-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="w-14 text-right">
          <span className={cn(
            'text-lg font-bold tabular-nums',
            points > 0 ? 'text-forest-600' : 'text-forest-300',
          )}>
            {points}
          </span>
          <span className="text-xs text-forest-400 ml-0.5">{t('scoring.pts')}</span>
        </div>
      </div>

      {card.needsContext && count > 0 && onContextChange && (
        <div className="flex items-center justify-between rounded-lg bg-bark-50 px-3 py-2 ml-2 border-l-2 border-bark-300">
          <span className="text-xs text-bark-600">{tc(`${card.key}.context`)}</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onContextChange((contextValue ?? 0) - 1)}
              disabled={(contextValue ?? 0) <= 0}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors',
                (contextValue ?? 0) <= 0
                  ? 'bg-bark-100 text-bark-300'
                  : 'bg-bark-100 text-bark-600 hover:bg-bark-200',
              )}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
              {contextValue ?? 0}
            </span>
            <button
              type="button"
              onClick={() => onContextChange((contextValue ?? 0) + 1)}
              disabled={card.contextCappedByCount && (contextValue ?? 0) >= count}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-bark-200 text-bark-700 hover:bg-bark-300 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
