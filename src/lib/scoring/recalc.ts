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
    const dartmoorCards = getCards(expansions, 'dartmoor')
    const activeCardKeys = dartmoorCards.map((c) => c.key)
    const moorCards = dartmoorCards.filter((c) => c.category === 'moor')
    const allMoorCounts = allPlayers.map((p) =>
      moorCards.reduce((sum, c) => sum + (p.cardCounts[c.key] || 0), 0),
    )
    return computeDartmoorScoreBreakdown(
      player.cardCounts,
      player.cardMetadata,
      player.fullyOccupiedTrees,
      activeCardKeys,
      allMoorCounts,
    )
  }

  const classicCards = getCards(expansions)
  const activeCardKeys = classicCards.map((c) => c.key)
  // A Violet Carpenter Bee counts as an extra tree of its host species
  // (reference card #13), so it must feed the cross-player comparisons too
  const beeHosts = (p: PlayerScoringData): string[] =>
    (p.cardMetadata['violet_carpenter_bee']?.hostCardKeys ?? []).filter(Boolean)
  const allLindenCounts = allPlayers.map((p) =>
    (p.cardCounts['linden'] || 0) + beeHosts(p).filter((k) => k === 'linden').length,
  )
  // Shrubs never count toward tree totals (same rule as buildForestContext)
  const treeKeys = new Set(
    classicCards.filter((c) => c.category === 'tree' && !c.tags.includes('shrub')).map((c) => c.key),
  )
  const allTreeCounts = allPlayers.map((p) => {
    let sum = 0
    for (const key of treeKeys) sum += p.cardCounts[key] || 0
    return sum + beeHosts(p).filter((k) => treeKeys.has(k)).length
  })

  return computeScoreBreakdown(
    player.cardCounts,
    player.cardMetadata,
    player.fullyOccupiedTrees,
    activeCardKeys,
    allLindenCounts,
    allTreeCounts,
    allPlayers.length === 1,
  )
}
