import type { CardMetadata, ScoreBreakdown } from '@/types/scoring'
import type { Expansion, GameEdition } from '@/types/card'
import { computeScoreBreakdown, computeDartmoorScoreBreakdown } from '@/lib/scoring'
import { getCards } from '@/data/cards'

export interface PlayerScoringData {
  cardCounts: Record<string, number>
  cardMetadata: Record<string, CardMetadata>
  fullyOccupiedTrees: number
}

export function recalcPlayer(
  player: PlayerScoringData,
  allPlayers: PlayerScoringData[],
  expansions: Expansion[],
  edition: GameEdition = 'classic',
): ScoreBreakdown {
  if (edition === 'dartmoor') {
    const activeCardKeys = getCards([], 'dartmoor').map((c) => c.key)
    const allMoorCounts = allPlayers.map((p) => {
      const moorCards = getCards([], 'dartmoor').filter((c) => c.category === 'moor')
      return moorCards.reduce((sum, c) => sum + (p.cardCounts[c.key] || 0), 0)
    })
    return computeDartmoorScoreBreakdown(
      player.cardCounts,
      player.cardMetadata,
      player.fullyOccupiedTrees,
      activeCardKeys,
      allMoorCounts,
    )
  }

  const activeCardKeys = getCards(expansions).map((c) => c.key)
  const allLindenCounts = allPlayers.map((p) => p.cardCounts['linden'] || 0)
  const allTreeCounts = allPlayers.map((p) => {
    const treeCards = getCards(expansions).filter((c) => c.category === 'tree')
    return treeCards.reduce((sum, c) => sum + (p.cardCounts[c.key] || 0), 0)
  })

  return computeScoreBreakdown(
    player.cardCounts,
    player.cardMetadata,
    player.fullyOccupiedTrees,
    activeCardKeys,
    allLindenCounts,
    allTreeCounts,
  )
}
