import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { cn } from '@/lib/utils'
import { MIN_GAMES_FOR_RATES, type AggregatedPlayer } from '@/lib/stats'

type SortField = 'wins' | 'winRate' | 'avgScore' | 'bestScore' | 'gamesPlayed'

interface LeaderboardListProps {
  players: AggregatedPlayer[]
  solo?: boolean
}

export function LeaderboardList({ players, solo = false }: LeaderboardListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<SortField>('wins')
  const [showAll, setShowAll] = useState(false)

  // Win metrics don't exist in solo view — fall back to average.
  const effectiveSort: SortField =
    solo && (sortBy === 'wins' || sortBy === 'winRate') ? 'avgScore' : sortBy

  const qualifies = (p: AggregatedPlayer) =>
    effectiveSort === 'winRate'
      ? p.groupGamesPlayed >= MIN_GAMES_FOR_RATES
      : effectiveSort === 'avgScore'
        ? p.gamesPlayed >= MIN_GAMES_FOR_RATES
        : true

  const sorted = [...players].sort((a, b) => {
    const qa = qualifies(a)
    const qb = qualifies(b)
    if (qa !== qb) return qa ? -1 : 1
    return b[effectiveSort] - a[effectiveSort]
  })

  // Occasional players (< 3 games) are collapsed behind a show-more button —
  // unless everyone is below the threshold, then hiding all would be absurd.
  const regulars = sorted.filter((p) => p.gamesPlayed >= MIN_GAMES_FOR_RATES)
  const hiddenCount = sorted.length - regulars.length
  const collapsed = !showAll && hiddenCount > 0 && regulars.length > 0
  const displayed = collapsed ? regulars : sorted

  const sortOptions: { field: SortField; key: string }[] = [
    ...(solo
      ? []
      : [
          { field: 'wins' as const, key: 'leaderboard.wins' },
          { field: 'winRate' as const, key: 'leaderboard.winRate' },
        ]),
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
                effectiveSort === field
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
              )}
            >
              {t(key)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {displayed.map((entry, idx) => {
            const qualified = qualifies(entry)
            const Inner = (
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg bg-forest-50 px-2.5 py-2',
                  !qualified && 'opacity-60',
                )}
              >
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
                    {qualified
                      ? `${entry.gamesPlayed} ${t('leaderboard.games').toLowerCase()}`
                      : t('leaderboard.minGamesShort', { count: MIN_GAMES_FOR_RATES })}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs shrink-0">
                  {solo ? (
                    <Stat value={entry.gamesPlayed} label={t('leaderboard.games')} />
                  ) : effectiveSort === 'winRate' ? (
                    <Stat
                      value={entry.winRate}
                      label={t('leaderboard.winRate')}
                      suffix="%"
                    />
                  ) : (
                    <Stat value={entry.wins} label={t('leaderboard.winsLabel')} />
                  )}
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
        {collapsed && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-2 w-full rounded-full bg-forest-100 px-4 py-1.5 text-xs font-medium text-forest-600 hover:bg-forest-200"
          >
            {t('leaderboard.showMorePlayers', { count: hiddenCount })}
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({
  value,
  label,
  withAcorn,
  suffix,
}: {
  value: number
  label: string
  withAcorn?: boolean
  suffix?: string
}) {
  return (
    <div className="text-center">
      <p className="font-bold text-forest-600 tabular-nums flex items-center gap-0.5 justify-center">
        {value}
        {suffix}
        {withAcorn && <AcornIcon className="h-3 w-3" />}
      </p>
      <p className="text-[10px] text-forest-400">{label}</p>
    </div>
  )
}
