export type Expansion = 'base' | 'alpine'

export type CardCategory = 'tree' | 'top' | 'bottom' | 'lateral' | 'cave'

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
}
