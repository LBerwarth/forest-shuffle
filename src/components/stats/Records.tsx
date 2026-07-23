import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { MIN_GAMES_FOR_RATES, type AggregatedPlayer } from '@/lib/stats'

interface RecordsProps {
  aggregatedPlayers: AggregatedPlayer[]
}

// All record holders on a tie, not an arbitrary sort[0].
function recordHolders(
  players: AggregatedPlayer[],
  value: (p: AggregatedPlayer) => number,
): { names: string; value: number } | null {
  let best = -Infinity
  for (const p of players) best = Math.max(best, value(p))
  if (best === -Infinity) return null
  const holders = players.filter((p) => value(p) === best).map((p) => p.name)
  const names =
    holders.length > 3
      ? `${holders.slice(0, 3).join(' & ')} …`
      : holders.join(' & ')
  return { names, value: best }
}

export function Records({ aggregatedPlayers }: RecordsProps) {
  const { t } = useTranslation()

  if (aggregatedPlayers.length === 0) return null

  const mostWins = recordHolders(aggregatedPlayers, (p) => p.wins)
  const highestScore = recordHolders(aggregatedPlayers, (p) => p.bestScore)
  const highestAvg = recordHolders(
    aggregatedPlayers.filter((p) => p.gamesPlayed >= MIN_GAMES_FOR_RATES),
    (p) => p.avgScore,
  )
  const longestStreak = recordHolders(aggregatedPlayers, (p) => p.longestStreak)

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.records')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mostWins && mostWins.value > 0 && (
            <Row
              label={t('leaderboard.mostWins')}
              value={`${mostWins.names} (${mostWins.value})`}
            />
          )}
          {highestScore && (
            <Row
              label={t('leaderboard.highestScore')}
              value={`${highestScore.names} (${highestScore.value})`}
            />
          )}
          {highestAvg && (
            <Row
              label={t('leaderboard.highestAverage')}
              value={`${highestAvg.names} (${highestAvg.value})`}
            />
          )}
          {longestStreak && longestStreak.value > 0 && (
            <Row
              label={t('leaderboard.longestStreak')}
              value={`${longestStreak.names} (${longestStreak.value})`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-forest-500 shrink-0">{label}</span>
      <span className="font-semibold text-forest-700 text-right truncate">{value}</span>
    </div>
  )
}
