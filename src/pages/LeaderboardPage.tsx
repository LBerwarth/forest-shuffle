import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { usePlayers } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import { cn } from '@/lib/utils'

type SortField = 'wins' | 'winRate' | 'avgScore' | 'bestScore' | 'gamesPlayed'

interface LeaderboardEntry {
  playerId: string
  name: string
  color: string
  gamesPlayed: number
  wins: number
  winRate: number
  avgScore: number
  bestScore: number
}

export function LeaderboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: players = [] } = usePlayers()
  const { data: games = [] } = useGames()
  const [sortBy, setSortBy] = useState<SortField>('wins')

  const entries = useMemo((): LeaderboardEntry[] => {
    return players
      .map((player) => {
        const playerGames = games.filter((g) =>
          g.players.some((p) => p.player_id === player.id),
        )
        const scores = playerGames.map(
          (g) => g.players.find((p) => p.player_id === player.id)!.total_score,
        )
        const wins = playerGames.filter(
          (g) => g.players.find((p) => p.player_id === player.id)?.is_winner,
        ).length

        return {
          playerId: player.id,
          name: player.name,
          color: player.color,
          gamesPlayed: playerGames.length,
          wins,
          winRate: playerGames.length > 0 ? Math.round((wins / playerGames.length) * 100) : 0,
          avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        }
      })
      .filter((e) => e.gamesPlayed > 0)
      .sort((a, b) => b[sortBy] - a[sortBy])
  }, [players, games, sortBy])

  const sortOptions: { field: SortField; key: string }[] = [
    { field: 'wins', key: 'leaderboard.wins' },
    { field: 'winRate', key: 'leaderboard.winRate' },
    { field: 'avgScore', key: 'leaderboard.avg' },
    { field: 'bestScore', key: 'leaderboard.best' },
    { field: 'gamesPlayed', key: 'leaderboard.games' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('leaderboard.title')}</h1>
      </div>

      {/* Sort options */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
        {sortOptions.map(({ field, key }) => (
          <button
            key={field}
            type="button"
            onClick={() => setSortBy(field)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
              sortBy === field
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-forest-200 mx-auto mb-3" />
          <p className="text-sm text-forest-400">{t('leaderboard.noData')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <button
              key={entry.playerId}
              type="button"
              onClick={() => navigate(`/players/${entry.playerId}`)}
              className="w-full text-left"
            >
              <Card className={cn(
                'hover:shadow-card-hover transition-shadow',
                idx === 0 && 'border-yellow-300 bg-yellow-50/50',
              )}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0"
                      style={{
                        backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#e2e8f0',
                        color: idx < 3 ? 'white' : '#64748b',
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Avatar + Name */}
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: entry.color }}
                    >
                      {entry.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest-700 truncate">{entry.name}</p>
                      <p className="text-[10px] text-forest-400">{t('leaderboard.games').toLowerCase()} {entry.gamesPlayed}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-forest-500 shrink-0">
                      <div className="text-center">
                        <p className="font-bold text-forest-600 tabular-nums">{entry.wins}</p>
                        <p className="text-[10px]">{t('leaderboard.winsLabel')}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-forest-600 tabular-nums">{entry.avgScore}</p>
                        <p className="text-[10px]">{t('leaderboard.avgLabel')}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-forest-600 tabular-nums">{entry.bestScore}</p>
                        <p className="text-[10px]">{t('leaderboard.bestLabel')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Records */}
      {entries.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('leaderboard.records')}</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries[0] && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-forest-500">{t('leaderboard.mostWins')}</span>
                  <span className="font-semibold text-forest-700">
                    {entries.sort((a, b) => b.wins - a.wins)[0]?.name} ({entries.sort((a, b) => b.wins - a.wins)[0]?.wins})
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-forest-500">{t('leaderboard.highestScore')}</span>
                <span className="font-semibold text-forest-700">
                  {entries.sort((a, b) => b.bestScore - a.bestScore)[0]?.name} ({entries.sort((a, b) => b.bestScore - a.bestScore)[0]?.bestScore})
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-forest-500">{t('leaderboard.highestAverage')}</span>
                <span className="font-semibold text-forest-700">
                  {entries.sort((a, b) => b.avgScore - a.avgScore)[0]?.name} ({entries.sort((a, b) => b.avgScore - a.avgScore)[0]?.avgScore})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
