import type { CardDefinition } from '@/types/card'
import type { CardMetadata } from '@/types/scoring'

/** Cards with count > 0 whose context question was never answered */
export function findMissingContextCards(
  cards: readonly CardDefinition[],
  cardCounts: Record<string, number>,
  cardMetadata: Record<string, CardMetadata>,
): CardDefinition[] {
  const hasHostTrees = cards.some(
    (c) => c.category === 'tree' && !c.tags.includes('shrub') && (cardCounts[c.key] || 0) > 0,
  )
  const hasHostPlants = cards.some(
    (c) => c.category === 'bottom' && c.tags.includes('plant') && (cardCounts[c.key] || 0) > 0,
  )
  const hasHostBirds = cards.some(
    (c) => c.tags.includes('bird') && (cardCounts[c.key] || 0) > 0,
  )

  return cards.filter((card) => {
    const count = cardCounts[card.key] || 0
    if (count === 0) return false
    const meta = cardMetadata[card.key]
    if (card.needsContext) {
      // Context only matters when its expansion is in play (cards is already expansion-filtered)
      if (card.contextOnlyWithExpansion && !cards.some((c) => c.expansion === card.contextOnlyWithExpansion)) {
        return false
      }
      // undefined = never touched; an explicit 0 counts as answered
      return meta?.contextValue === undefined
    }
    if (card.needsHostTreeContext) {
      if (!hasHostTrees) return false
      const hosts = meta?.hostCardKeys ?? []
      for (let i = 0; i < count; i++) {
        if (!hosts[i]) return true
      }
      return false
    }
    if (card.needsHostPlantContext || card.needsHostBirdContext) {
      const hostsAvailable = card.needsHostPlantContext ? hasHostPlants : hasHostBirds
      if (!hostsAvailable) return false
      return (meta?.hostCardKeys ?? []).filter(Boolean).length === 0
    }
    return false
  })
}
