import type { CardCategory, CardTag } from './card'

/** Derived counts from a player's tableau used for scoring */
export interface ForestContext {
  /** Total number of trees in the forest */
  totalTrees: number
  /** Number of distinct tree species */
  treeSpeciesCount: number
  /** Which tree species are present (keys) */
  treeSpeciesPresent: Set<string>
  /** Count of cards with each tag */
  tagCounts: Record<CardTag, number>
  /** Count of each specific card */
  cardCounts: Record<string, number>
  /** Count of cards in each slot category */
  slotCounts: Record<CardCategory, number>
  /** Number of trees with all 4 slots occupied */
  fullyOccupiedTrees: number
  /** Total card count across all categories */
  totalCards: number
  /** Total number of moor cards (Dartmoor edition) */
  totalMoors: number
  /** Per-card metadata (e.g., contextual answers) */
  cardMetadata: Record<string, CardMetadata>
}

export interface CardMetadata {
  /** Count of this card */
  count: number
  /** Answer to context question if applicable (e.g., "on beech?" true/false) */
  contextValue?: number
}

export interface ScoreEntry {
  cardKey: string
  cardCategory: CardCategory
  count: number
  points: number
}

export interface ScoreBreakdown {
  entries: ScoreEntry[]
  categoryTotals: Record<CardCategory, number>
  total: number
}

/** Function signature for a card's scoring logic */
export type ScoringFunction = (
  count: number,
  context: ForestContext,
  metadata?: CardMetadata,
) => number

/** For cross-player comparison cards */
export interface ComparisonContext {
  playerId: string
  value: number
}
