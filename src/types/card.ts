export type GameEdition = 'classic' | 'dartmoor' | 'smoky'

export type Expansion = 'base' | 'alpine' | 'woodland' | 'exploration' | 'dartmoor_base' | 'dartmoor_exmoor' | 'smoky_base'

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
  | 'shrub'
  | 'tree'
  | 'moor'
  | 'fish'
  | 'squirrel'

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
  /** If true, wizard shows a tree-species picker (e.g. Violet Carpenter Bee) */
  needsHostTreeContext?: boolean
  /** If true, wizard shows a multi-select of plants placed under this card
   *  (e.g. Blanket Bog, which doubles the points of plants in its slots) */
  needsHostPlantContext?: boolean
  /** If true, wizard shows a multi-select of birds placed on this card
   *  (e.g. Coastal Heath, which doubles the points of birds in its slots) */
  needsHostBirdContext?: boolean
}
