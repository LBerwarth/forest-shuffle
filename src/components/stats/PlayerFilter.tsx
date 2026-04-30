import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AggregatedPlayer, PlayerMatchMode } from '@/lib/stats'

interface PlayerFilterProps {
  players: AggregatedPlayer[]
  selected: string[]
  matchMode: PlayerMatchMode
  onChange: (selected: string[]) => void
  onMatchModeChange: (mode: PlayerMatchMode) => void
}

export function PlayerFilter({ players, selected, matchMode, onChange, onMatchModeChange }: PlayerFilterProps) {
  const { t } = useTranslation()

  if (players.length === 0) return null

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-2 mb-2">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">
          {t('leaderboard.filterPlayers')}
        </span>
        {players.map((p) => {
          const isOn = selected.includes(p.playerId)
          return (
            <button
              key={p.playerId}
              type="button"
              onClick={() => toggle(p.playerId)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all border',
                isOn
                  ? 'border-forest-500 bg-forest-500 text-white'
                  : 'border-forest-200 bg-white text-forest-500 hover:bg-forest-100',
              )}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: p.color }}
              >
                {p.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate max-w-[80px]">{p.name}</span>
              {isOn && <X className="h-3 w-3" />}
            </button>
          )
        })}
      </div>

      {selected.length >= 2 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">
            {t('leaderboard.matchMode')}
          </span>
          <button
            type="button"
            onClick={() => onMatchModeChange('union')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              matchMode === 'union'
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {t('leaderboard.matchUnion')}
          </button>
          <button
            type="button"
            onClick={() => onMatchModeChange('intersection')}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              matchMode === 'intersection'
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {t('leaderboard.matchIntersection')}
          </button>
        </div>
      )}
    </div>
  )
}
