import { useMemo } from 'react'
import { CardAnalytics } from '@/components/stats/CardAnalytics'
import { TagInsights } from '@/components/stats/TagInsights'
import { TagSynergies } from '@/components/stats/TagSynergies'
import { aggregateCardStats, aggregateTagStats, aggregateTagSynergies } from '@/lib/stats'
import type { RankedPlayer } from '@/components/scoring/ResultsDisplay'
import type { GameWithPlayers } from '@/types/game'

interface GameInsightsProps {
  rankedPlayers: RankedPlayer[]
}

export function GameInsights({ rankedPlayers }: GameInsightsProps) {
  const games = useMemo<GameWithPlayers[]>(() => {
    if (rankedPlayers.length === 0) return []
    const fakeGame: GameWithPlayers = {
      id: 'current-game',
      played_at: new Date().toISOString(),
      player_count: rankedPlayers.length,
      players: rankedPlayers
        .filter((p) => p.breakdown !== null)
        .map((p) => ({
          id: p.playerId,
          game_id: 'current-game',
          player_id: p.playerId,
          player_name: p.playerName,
          total_score: p.breakdown!.total,
          rank: p.rank,
          is_winner: p.rank === 1,
          score_breakdown: p.breakdown!,
        })),
    }
    return [fakeGame]
  }, [rankedPlayers])

  const cardAggregates = useMemo(() => aggregateCardStats(games), [games])
  const tagAggregates = useMemo(() => aggregateTagStats(games), [games])
  const tagSynergies = useMemo(() => aggregateTagSynergies(games), [games])

  if (cardAggregates.length === 0 && tagAggregates.length === 0) return null

  return (
    <>
      <CardAnalytics cards={cardAggregates} singleGame />
      <TagInsights tags={tagAggregates} singleGame />
      {tagSynergies.length > 0 && <TagSynergies rows={tagSynergies} singleGame />}
    </>
  )
}
