import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { cn } from '@/lib/utils'
import type { AggregatedPlayer } from '@/lib/stats'

type SortField = 'wins' | 'winRate' | 'avgScore' | 'bestScore' | 'gamesPlayed'

interface LeaderboardListProps {
  players: AggregatedPlayer[]
}

export function LeaderboardList({ players }: LeaderboardListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<SortField>('wins')

  const sorted = [...players].sort((a, b) => b[sortBy] - a[sortBy])

  const sortOptions: { field: SortField; key: string }[] = [
    { field: 'wins', key: 'leaderboard.wins' },
    { field: 'winRate', key: 'leaderboard.winRate' },
    { field: 'avgScore', key: 'leaderboard.avg' },
    { field: 'bestScore', key: 'leaderboard.best' },
    { field: 'gamesPlayed', key: 'leaderboard.games' },
  ]

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.leaderboardSection')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {sortOptions.map(({ field, key }) => (
            <button
              key={field}
              type="button"
              onClick={() => setSortBy(field)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
                sortBy === field
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
              )}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {sorted.map((entry, idx) => {
            const Inner = (
              <div className="flex items-center gap-3 rounded-lg bg-forest-50 px-2.5 py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-100 text-xs font-bold text-forest-500 shrink-0 tabular-nums">
                  {idx + 1}
                </div>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: entry.color }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-forest-700 truncate">{entry.name}</p>
                  <p className="text-[10px] text-forest-400">
                    {entry.gamesPlayed} {t('leaderboard.games').toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  <Stat value={entry.wins} label={t('leaderboard.winsLabel')} />
                  <Stat
                    value={entry.avgScore}
                    label={t('leaderboard.avgLabel')}
                    withAcorn
                  />
                  <Stat
                    value={entry.bestScore}
                    label={t('leaderboard.bestLabel')}
                    withAcorn
                  />
                </div>
              </div>
            )

            if (entry.isLocal) {
              return (
                <button
                  key={entry.playerId}
                  type="button"
                  onClick={() => navigate(`/players/${entry.playerId}`)}
                  className="w-full text-left"
                >
                  {Inner}
                </button>
              )
            }
            return <div key={entry.playerId}>{Inner}</div>
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({
  value,
  label,
  withAcorn,
}: {
  value: number
  label: string
  withAcorn?: boolean
}) {
  return (
    <div className="text-center">
      <p className="font-bold text-forest-600 tabular-nums flex items-center gap-0.5 justify-center">
        {value}
        {withAcorn && <AcornIcon className="h-3 w-3" />}
      </p>
      <p className="text-[10px] text-forest-400">{label}</p>
    </div>
  )
}
