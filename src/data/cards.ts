import type { CardDefinition } from '@/types/card'

export const CARDS: CardDefinition[] = [
  // ============================================================
  // TREES
  // ============================================================
  {
    key: 'birch',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'fixed',
  },
  {
    key: 'beech',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'threshold',
  },
  {
    key: 'spruce',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'per_tree_species',
  },
  {
    key: 'douglas_fir',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'fixed',
  },
  {
    key: 'oak',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'fully_occupied',
  },
  {
    key: 'horse_chestnut',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'linden',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'comparison',
  },
  {
    key: 'sycamore',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'per_card',
  },
  {
    key: 'silver_fir',
    category: 'tree',
    tags: [],
    expansion: 'base',
    scoringType: 'custom',
    needsContext: true,
  },
  // Alpine trees
  {
    key: 'european_larch',
    category: 'tree',
    tags: ['alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'stone_pine',
    category: 'tree',
    tags: ['alpine'],
    expansion: 'alpine',
    scoringType: 'custom',
    needsContext: true,
  },

  // ============================================================
  // TOP SLOT (birds, butterflies, squirrel)
  // ============================================================
  {
    key: 'bullfinch',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'chaffinch',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'conditional',
    needsContext: true,
  },
  {
    key: 'great_spotted_woodpecker',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'comparison',
  },
  {
    key: 'goshawk',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'jay',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tree_species',
  },
  {
    key: 'great_tit',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'robin',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'owl',
    category: 'top',
    tags: ['bird'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'tree_frog_top',
    category: 'top',
    tags: ['amphibian'],
    expansion: 'base',
    scoringType: 'per_tree_species',
  },
  {
    key: 'peacock_butterfly',
    category: 'top',
    tags: ['butterfly', 'insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'purple_emperor',
    category: 'top',
    tags: ['butterfly', 'insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'silver_washed_fritillary',
    category: 'top',
    tags: ['butterfly', 'insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'swallowtail',
    category: 'top',
    tags: ['butterfly', 'insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'camberwell_beauty',
    category: 'top',
    tags: ['butterfly', 'insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'red_squirrel',
    category: 'top',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'conditional',
    needsContext: true,
  },
  // Alpine top cards
  {
    key: 'golden_eagle',
    category: 'top',
    tags: ['bird', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'bearded_vulture',
    category: 'top',
    tags: ['bird', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'common_raven',
    category: 'top',
    tags: ['bird', 'alpine'],
    expansion: 'alpine',
    scoringType: 'fixed',
  },
  {
    key: 'phoebus_apollo',
    category: 'top',
    tags: ['butterfly', 'insect', 'alpine'],
    expansion: 'alpine',
    scoringType: 'set',
  },

  // ============================================================
  // BOTTOM SLOT (amphibians, insects, plants, hedgehog)
  // ============================================================
  {
    key: 'fire_salamander',
    category: 'bottom',
    tags: ['amphibian'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'tree_frog_bottom',
    category: 'bottom',
    tags: ['amphibian'],
    expansion: 'base',
    scoringType: 'per_tree_species',
  },
  {
    key: 'stag_beetle',
    category: 'bottom',
    tags: ['insect'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'wood_ant',
    category: 'bottom',
    tags: ['insect'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'penny_bun',
    category: 'bottom',
    tags: ['mushroom'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'chanterelle',
    category: 'bottom',
    tags: ['mushroom'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'fly_agaric',
    category: 'bottom',
    tags: ['mushroom'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'parasol_mushroom',
    category: 'bottom',
    tags: ['mushroom'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'moss',
    category: 'bottom',
    tags: ['plant'],
    expansion: 'base',
    scoringType: 'threshold',
  },
  {
    key: 'fern',
    category: 'bottom',
    tags: ['plant'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'wood_strawberry',
    category: 'bottom',
    tags: ['plant'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'hedgehog',
    category: 'bottom',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'european_hare_bottom',
    category: 'bottom',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  // Alpine bottom cards
  {
    key: 'alpine_newt',
    category: 'bottom',
    tags: ['amphibian', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'blueberry',
    category: 'bottom',
    tags: ['plant', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'gentian',
    category: 'bottom',
    tags: ['plant', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'edelweiss',
    category: 'bottom',
    tags: ['plant', 'alpine'],
    expansion: 'alpine',
    scoringType: 'threshold',
  },

  // ============================================================
  // LEFT SLOT (bats, deer, etc.)
  // ============================================================
  {
    key: 'barbastelle',
    category: 'left',
    tags: ['bat'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'bechsteins_bat',
    category: 'left',
    tags: ['bat'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'brown_long_eared_bat',
    category: 'left',
    tags: ['bat'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'greater_horseshoe_bat',
    category: 'left',
    tags: ['bat'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'roe_deer',
    category: 'left',
    tags: ['deer'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'red_deer',
    category: 'left',
    tags: ['deer'],
    expansion: 'base',
    scoringType: 'set',
  },
  {
    key: 'lynx',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'threshold',
  },
  {
    key: 'wolf',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'wild_boar',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'threshold',
  },
  {
    key: 'badger',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'european_hare_left',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'squeaker',
    category: 'left',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'fixed',
  },
  // Alpine left cards
  {
    key: 'savis_pipistrelle',
    category: 'left',
    tags: ['bat', 'alpine'],
    expansion: 'alpine',
    scoringType: 'set',
  },
  {
    key: 'chamois',
    category: 'left',
    tags: ['deer', 'alpine'],
    expansion: 'alpine',
    scoringType: 'set',
  },
  {
    key: 'steinbock',
    category: 'left',
    tags: ['deer', 'alpine'],
    expansion: 'alpine',
    scoringType: 'set',
  },

  // ============================================================
  // RIGHT SLOT (foxes, squirrels, etc.)
  // ============================================================
  {
    key: 'brown_bear',
    category: 'right',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'fox',
    category: 'right',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'red_squirrel_right',
    category: 'right',
    tags: ['pawed'],
    expansion: 'base',
    scoringType: 'conditional',
    needsContext: true,
  },
  {
    key: 'violet_carpenter_bee',
    category: 'right',
    tags: ['insect'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'pond_turtle',
    category: 'right',
    tags: ['amphibian'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'tree_frog_right',
    category: 'right',
    tags: ['amphibian'],
    expansion: 'base',
    scoringType: 'per_tree_species',
  },
  {
    key: 'wild_strawberry_right',
    category: 'right',
    tags: ['plant'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  {
    key: 'deer_fern',
    category: 'right',
    tags: ['plant'],
    expansion: 'base',
    scoringType: 'per_tag',
  },
  // Alpine right cards
  {
    key: 'alpine_marmot',
    category: 'right',
    tags: ['pawed', 'alpine'],
    expansion: 'alpine',
    scoringType: 'set',
  },
  {
    key: 'mountain_hare',
    category: 'right',
    tags: ['pawed', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },
  {
    key: 'capercaillie',
    category: 'right',
    tags: ['bird', 'alpine'],
    expansion: 'alpine',
    scoringType: 'per_tag',
  },

  // ============================================================
  // CAVE
  // ============================================================
  {
    key: 'cave',
    category: 'cave',
    tags: [],
    expansion: 'base',
    scoringType: 'fixed',
  },
]

/** Get cards filtered by expansion */
export function getCards(includeAlpine: boolean): CardDefinition[] {
  if (includeAlpine) return CARDS
  return CARDS.filter((c) => c.expansion === 'base')
}

/** Get cards grouped by category */
export function getCardsByCategory(includeAlpine: boolean) {
  const cards = getCards(includeAlpine)
  return {
    tree: cards.filter((c) => c.category === 'tree'),
    top: cards.filter((c) => c.category === 'top'),
    bottom: cards.filter((c) => c.category === 'bottom'),
    left: cards.filter((c) => c.category === 'left'),
    right: cards.filter((c) => c.category === 'right'),
    cave: cards.filter((c) => c.category === 'cave'),
  }
}

/** Get a single card by key */
export function getCard(key: string): CardDefinition | undefined {
  return CARDS.find((c) => c.key === key)
}
