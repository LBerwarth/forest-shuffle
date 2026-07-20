import { useState, useRef } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getCardIconUrl } from '@/data/cardIcons'
import { STAT_ICONS } from '@/assets/icons'
import { AcornIcon } from '@/components/ui/AcornIcon'
import type { CardDefinition } from '@/types/card'
import type { MultiplierStat } from '@/lib/scoring/multiplier-stats'

interface CardCounterProps {
  card: CardDefinition
  count: number
  points: number
  onCountChange: (count: number) => void
  contextValue?: number
  onContextChange?: (value: number) => void
  hostCardKeys?: readonly string[]
  availableHostKeys?: readonly string[]
  /** Maps a host card key to how many copies the player owns, used to cap how
   *  many times a plant can be placed below a Blanket Bog. */
  availableHostCounts?: Record<string, number>
  onHostsChange?: (next: string[]) => void
  multiplierStats?: MultiplierStat[]
  /** When provided, the displayed points represent a shared set bonus across
   *  all cards in the set (e.g. butterflies, dragonflies) rather than this
   *  card's individual contribution. The same value is shown on every card
   *  in the set. */
  setBonus?: number
}

function TappableNumber({
  value,
  onChange,
  min = 0,
  max,
  className,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setDraft(value === 0 ? '' : String(value))
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function commit() {
    setEditing(false)
    const parsed = parseInt(draft, 10)
    if (isNaN(parsed) || parsed < min) {
      onChange(min)
    } else if (max !== undefined && parsed > max) {
      onChange(max)
    } else {
      onChange(parsed)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
          }
        }}
        autoFocus
        className={cn(
          'w-10 text-center font-semibold tabular-nums bg-forest-100 rounded-md border border-forest-300 outline-none focus:border-forest-500',
          className,
        )}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className={cn(
        'w-10 text-center font-semibold tabular-nums rounded-md cursor-text hover:bg-forest-100 transition-colors',
        className,
      )}
    >
      {value}
    </button>
  )
}

export function CardCounter({
  card,
  count,
  points,
  onCountChange,
  contextValue,
  onContextChange,
  hostCardKeys,
  availableHostKeys,
  availableHostCounts,
  onHostsChange,
  multiplierStats,
  setBonus,
}: CardCounterProps) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t
  const isSetBonus = setBonus !== undefined && count > 0
  const displayPoints = isSetBonus ? setBonus : points

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-forest-200 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const seen = new Set<string>()
              const urls: string[] = []
              for (const tag of card.tags) {
                if (tag === 'alpine' || tag === 'woodland_edge') continue
                const url = STAT_ICONS[tag]
                if (url && !seen.has(url)) {
                  seen.add(url)
                  urls.push(url)
                }
              }
              if (urls.length === 0) {
                const fallback = getCardIconUrl(card.key)
                if (fallback) urls.push(fallback)
              }
              return urls.length > 0 ? (
                <div className="flex items-center gap-0.5 shrink-0">
                  {urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-5 w-5 rounded-sm" />
                  ))}
                </div>
              ) : null
            })()}
            <span className="font-medium text-forest-800 text-sm leading-tight break-words">
              {tc(`${card.key}.name`)}
            </span>
            {card.expansion !== 'base' && card.expansion !== 'dartmoor_base' && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                  card.expansion === 'alpine' && 'bg-blue-100 text-blue-700',
                  card.expansion === 'woodland' && 'bg-amber-100 text-amber-700',
                  card.expansion === 'exploration' && 'bg-purple-100 text-purple-700',
                  card.expansion === 'dartmoor_exmoor' && 'bg-teal-100 text-teal-700',
                )}
              >
                {t(`expansion.${card.expansion}`)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-xs text-forest-500">{tc(`${card.key}.scoring`)}</p>
            {multiplierStats && multiplierStats.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {multiplierStats.map((stat) => (
                  <span
                    key={stat.iconKey}
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                      stat.value > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-400',
                    )}
                  >
                    {STAT_ICONS[stat.iconKey] && (
                      <img src={STAT_ICONS[stat.iconKey]} alt="" className="h-3.5 w-3.5 rounded-sm" />
                    )}
                    {stat.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onCountChange(count - 1)}
            disabled={count <= 0}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              count <= 0
                ? 'bg-forest-100 text-forest-300'
                : 'bg-forest-100 text-forest-600 hover:bg-forest-200 active:bg-forest-300',
            )}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <TappableNumber
            value={count}
            onChange={onCountChange}
            className="text-base text-forest-800 w-8"
          />

          <button
            type="button"
            onClick={() => onCountChange(count + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest-500 text-white hover:bg-forest-600 active:bg-forest-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {isSetBonus && (
            <span className="mr-0.5 rounded bg-forest-100 px-1 text-[10px] font-semibold uppercase tracking-wide text-forest-500">
              {t('wizard.set')}
            </span>
          )}
          <span className={cn(
            'text-lg font-bold tabular-nums',
            displayPoints > 0 ? 'text-forest-600' : 'text-forest-300',
          )}>
            {displayPoints}
          </span>
          <AcornIcon className={cn('h-4 w-4', displayPoints > 0 ? 'opacity-80' : 'opacity-30')} />
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
            <TappableNumber
              value={contextValue ?? 0}
              onChange={onContextChange}
              max={card.contextCappedByCount ? count : undefined}
              className="text-sm text-bark-800"
            />
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

      {card.needsHostTreeContext && count > 0 && onHostsChange && (
        <div className="flex flex-col gap-1 rounded-lg bg-bark-50 px-3 py-2 ml-2 border-l-2 border-bark-300">
          <span className="text-xs text-bark-600">{tc(`${card.key}.context`)}</span>
          {availableHostKeys && availableHostKeys.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: count }).map((_, i) => {
                const current = hostCardKeys?.[i] ?? ''
                return (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-bark-500 tabular-nums">
                      {count > 1 ? `#${i + 1}` : ''}
                    </span>
                    <select
                      value={current}
                      onChange={(e) => {
                        const next = Array.from(
                          { length: count },
                          (_, idx) => hostCardKeys?.[idx] ?? '',
                        )
                        next[i] = e.target.value
                        onHostsChange(next)
                      }}
                      className="flex-1 rounded-md bg-bark-100 px-2 py-1 text-xs text-bark-800 outline-none border border-bark-200 focus:border-bark-400"
                    >
                      <option value="">{t('wizard.selectHostTree')}</option>
                      {availableHostKeys.map((key) => (
                        <option key={key} value={key}>
                          {tc(`${key}.name`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          ) : (
            <span className="text-[10px] italic text-bark-400">{t('wizard.noHostTreeAvailable')}</span>
          )}
        </div>
      )}

      {(card.needsHostPlantContext || card.needsHostBirdContext) && count > 0 && onHostsChange && (
        <div className="flex flex-col gap-1 rounded-lg bg-bark-50 px-3 py-2 ml-2 border-l-2 border-bark-300">
          <span className="text-xs text-bark-600">{tc(`${card.key}.context`)}</span>
          {availableHostKeys && availableHostKeys.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {availableHostKeys.map((key) => {
                const selected = (hostCardKeys ?? []).filter((k) => k === key).length
                const max = availableHostCounts?.[key] ?? 1
                const setSelected = (next: number) => {
                  const clamped = Math.max(0, Math.min(max, next))
                  const others = (hostCardKeys ?? []).filter((k) => k !== key)
                  const repeats = Array.from({ length: clamped }, () => key)
                  onHostsChange([...others, ...repeats])
                }
                return (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-bark-700">
                      {tc(`${key}.name`)}
                      {max > 1 && (
                        <span className="ml-1 text-[10px] text-bark-400 tabular-nums">×{max}</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelected(selected - 1)}
                        disabled={selected <= 0}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors',
                          selected <= 0
                            ? 'bg-bark-100 text-bark-300'
                            : 'bg-bark-100 text-bark-600 hover:bg-bark-200',
                        )}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums text-bark-800">
                        {selected}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelected(selected + 1)}
                        disabled={selected >= max}
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-md text-sm transition-colors',
                          selected >= max
                            ? 'bg-bark-100 text-bark-300'
                            : 'bg-bark-200 text-bark-700 hover:bg-bark-300',
                        )}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <span className="text-[10px] italic text-bark-400">
              {t(card.needsHostBirdContext ? 'wizard.noHostBirdsAvailable' : 'wizard.noHostPlantsAvailable')}
            </span>
          )}
        </div>
      )}

      {card.scoringType === 'comparison' && count > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 ml-2 border-l-2 border-blue-300">
          <span className="text-xs text-blue-600">{t('wizard.comparisonNotice')}</span>
        </div>
      )}
    </div>
  )
}
