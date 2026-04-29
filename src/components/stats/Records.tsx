import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import type { AggregatedPlayer, CardAggregate } from '@/lib/stats'

interface RecordsProps {
  aggregatedPlayers: AggregatedPlayer[]
  cardAggregates: CardAggregate[]
}

export function Records({ aggregatedPlayers, cardAggregates }: RecordsProps) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t

  if (aggregatedPlayers.length === 0) return null

  const mostWins = [...aggregatedPlayers].sort((a, b) => b.wins - a.wins)[0]
  const highestScore = [...aggregatedPlayers].sort((a, b) => b.bestScore - a.bestScore)[0]
  const highestAvg = [...aggregatedPlayers].sort((a, b) => b.avgScore - a.avgScore)[0]
  const longestStreak = [...aggregatedPlayers].sort(
    (a, b) => b.longestStreak - a.longestStreak,
  )[0]
  const bestCard = [...cardAggregates].sort(
    (a, b) => b.maxPointsSingle - a.maxPointsSingle,
  )[0]

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.records')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mostWins && mostWins.wins > 0 && (
            <Row label={t('leaderboard.mostWins')} value={`${mostWins.name} (${mostWins.wins})`} />
          )}
          {highestScore && (
            <Row
              label={t('leaderboard.highestScore')}
              value={`${highestScore.name} (${highestScore.bestScore})`}
            />
          )}
          {highestAvg && (
            <Row
              label={t('leaderboard.highestAverage')}
              value={`${highestAvg.name} (${highestAvg.avgScore})`}
            />
          )}
          {longestStreak && longestStreak.longestStreak > 0 && (
            <Row
              label={t('leaderboard.longestStreak')}
              value={`${longestStreak.name} (${longestStreak.longestStreak})`}
            />
          )}
          {bestCard && bestCard.maxBy && (
            <Row
              label={t('leaderboard.bestSingleCard')}
              value={`${tc(`${bestCard.cardKey}.name`)} — ${bestCard.maxBy.playerName} (${bestCard.maxPointsSingle})`}
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
