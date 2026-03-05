export type GameEdition = 'classic' | 'dartmoor'

export type Expansion = 'base' | 'alpine' | 'woodland' | 'exploration' | 'dartmoor_base'

export type CardCategory = 'tree' | 'top' | 'bottom' | 'lateral' | 'moor' | 'cave'

export type CardTag =
  | 'bird'
  | 'butterfly'
  | 'insect'
  | 'amphibian'
  | 'pawed'
  | 'deer'
  | 'bat'
  | 'plant'
  | 'mushroom'
  | 'alpine'
  | 'cloven_hoofed'
  | 'woodland_edge'
  | 'dragonfly'
  | 'mouse'
  | 'rabbit'
  | 'hoofed'

export type ScoringType =
  | 'fixed'
  | 'set'
  | 'per_tag'
  | 'per_tree_species'
  | 'per_card'
  | 'conditional'
  | 'threshold'
  | 'fully_occupied'
  | 'comparison'
  | 'custom'

export interface CardDefinition {
  key: string
  category: CardCategory
  tags: CardTag[]
  expansion: Expansion
  scoringType: ScoringType
  /** If true, wizard shows a sub-question for additional context */
  needsContext?: boolean
  /** If true, context value is capped at the card count (e.g. "how many of these are on X?") */
  contextCappedByCount?: boolean
}
