import type { CardDefinition, Expansion } from '@/types/card'

export const CARDS: CardDefinition[] = [
  // ============================================================
  // TREES
  // ============================================================
  { key: 'birch', category: 'tree', tags: [], expansion: 'base', scoringType: 'fixed' },
  { key: 'beech', category: 'tree', tags: [], expansion: 'base', scoringType: 'threshold' },
  { key: 'douglas_fir', category: 'tree', tags: [], expansion: 'base', scoringType: 'fixed' },
  { key: 'oak', category: 'tree', tags: [], expansion: 'base', scoringType: 'threshold' },
  { key: 'horse_chestnut', category: 'tree', tags: [], expansion: 'base', scoringType: 'set' },
  { key: 'linden', category: 'tree', tags: [], expansion: 'base', scoringType: 'comparison' },
  { key: 'sycamore', category: 'tree', tags: [], expansion: 'base', scoringType: 'per_card' },
  { key: 'silver_fir', category: 'tree', tags: [], expansion: 'base', scoringType: 'custom', needsContext: true },
  // Alpine trees
  { key: 'european_larch', category: 'tree', tags: ['alpine'], expansion: 'alpine', scoringType: 'fixed' },
  { key: 'stone_pine', category: 'tree', tags: ['alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  // Woodland trees
  { key: 'palm_tree', category: 'tree', tags: ['woodland_edge'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'turkey_oak', category: 'tree', tags: ['woodland_edge'], expansion: 'woodland', scoringType: 'per_tag' },

  // ============================================================
  // TOP SLOT
  // ============================================================
  { key: 'bullfinch', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'chaffinch', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  { key: 'great_spotted_woodpecker', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'comparison' },
  { key: 'goshawk', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'eurasian_jay', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'fixed' },
  { key: 'tawny_owl', category: 'top', tags: ['bird'], expansion: 'base', scoringType: 'fixed' },
  { key: 'peacock_butterfly', category: 'top', tags: ['butterfly', 'insect'], expansion: 'base', scoringType: 'set' },
  { key: 'purple_emperor', category: 'top', tags: ['butterfly', 'insect'], expansion: 'base', scoringType: 'set' },
  { key: 'silver_washed_fritillary', category: 'top', tags: ['butterfly', 'insect'], expansion: 'base', scoringType: 'set' },
  { key: 'camberwell_beauty', category: 'top', tags: ['butterfly', 'insect'], expansion: 'base', scoringType: 'set' },
  { key: 'large_tortoiseshell', category: 'top', tags: ['butterfly', 'insect'], expansion: 'base', scoringType: 'set' },
  { key: 'red_squirrel', category: 'top', tags: ['pawed'], expansion: 'base', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  // Alpine top
  { key: 'golden_eagle', category: 'top', tags: ['bird', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'bearded_vulture', category: 'top', tags: ['bird', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'common_raven', category: 'top', tags: ['bird', 'alpine'], expansion: 'alpine', scoringType: 'fixed' },
  { key: 'phoebus_apollo', category: 'top', tags: ['butterfly', 'insect', 'alpine'], expansion: 'alpine', scoringType: 'set' },
  // Woodland top
  { key: 'barn_owl', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'brimstone', category: 'top', tags: ['butterfly', 'insect'], expansion: 'woodland', scoringType: 'set' },
  { key: 'cardinal', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'cuckoo', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'eurasian_magpie', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'map_butterfly', category: 'top', tags: ['butterfly', 'insect'], expansion: 'woodland', scoringType: 'set' },
  { key: 'mistletoe', category: 'top', tags: ['plant'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'nightingale', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  { key: 'robin', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'whinchat', category: 'top', tags: ['bird'], expansion: 'woodland', scoringType: 'per_tag' },

  // ============================================================
  // BOTTOM SLOT
  // ============================================================
  { key: 'common_toad', category: 'bottom', tags: ['amphibian'], expansion: 'base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'fire_salamander', category: 'bottom', tags: ['amphibian'], expansion: 'base', scoringType: 'set' },
  { key: 'tree_frog', category: 'bottom', tags: ['amphibian'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'stag_beetle', category: 'bottom', tags: ['insect'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'wood_ant', category: 'bottom', tags: ['insect'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'penny_bun', category: 'bottom', tags: ['mushroom'], expansion: 'base', scoringType: 'fixed' },
  { key: 'chanterelle', category: 'bottom', tags: ['mushroom'], expansion: 'base', scoringType: 'fixed' },
  { key: 'fly_agaric', category: 'bottom', tags: ['mushroom'], expansion: 'base', scoringType: 'fixed' },
  { key: 'parasol_mushroom', category: 'bottom', tags: ['mushroom'], expansion: 'base', scoringType: 'fixed' },
  { key: 'moss', category: 'bottom', tags: ['plant'], expansion: 'base', scoringType: 'threshold' },
  { key: 'wild_strawberries', category: 'bottom', tags: ['plant'], expansion: 'base', scoringType: 'threshold' },
  { key: 'hedgehog', category: 'bottom', tags: ['pawed'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'pond_turtle', category: 'bottom', tags: ['amphibian'], expansion: 'base', scoringType: 'fixed' },
  { key: 'blackberries', category: 'bottom', tags: ['plant'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'fireflies', category: 'bottom', tags: ['insect'], expansion: 'base', scoringType: 'set' },
  { key: 'mole', category: 'bottom', tags: [], expansion: 'base', scoringType: 'fixed' },
  { key: 'tree_ferns', category: 'bottom', tags: ['plant'], expansion: 'base', scoringType: 'per_tag' },
  // Alpine bottom
  { key: 'alpine_newt', category: 'bottom', tags: ['amphibian', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'blueberry', category: 'bottom', tags: ['plant', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'gentian', category: 'bottom', tags: ['plant', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'edelweiss', category: 'bottom', tags: ['plant', 'alpine'], expansion: 'alpine', scoringType: 'fixed' },
  // Woodland bottom
  { key: 'black_trumpet', category: 'bottom', tags: ['mushroom'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'digitalis', category: 'bottom', tags: ['plant'], expansion: 'woodland', scoringType: 'custom' },
  { key: 'great_green_bush_cricket', category: 'bottom', tags: ['insect'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'marsh_cinquefoil', category: 'bottom', tags: ['plant'], expansion: 'woodland', scoringType: 'custom' },
  { key: 'stinging_nettle', category: 'bottom', tags: ['plant'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'water_vole', category: 'bottom', tags: ['amphibian'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'wild_tulip', category: 'bottom', tags: ['plant'], expansion: 'woodland', scoringType: 'fixed' },

  // ============================================================
  // LATERAL SLOT
  // ============================================================
  { key: 'barbastelle', category: 'lateral', tags: ['bat'], expansion: 'base', scoringType: 'set' },
  { key: 'bechsteins_bat', category: 'lateral', tags: ['bat'], expansion: 'base', scoringType: 'set' },
  { key: 'brown_long_eared_bat', category: 'lateral', tags: ['bat'], expansion: 'base', scoringType: 'set' },
  { key: 'greater_horseshoe_bat', category: 'lateral', tags: ['bat'], expansion: 'base', scoringType: 'set' },
  { key: 'roe_deer', category: 'lateral', tags: ['deer', 'cloven_hoofed'], expansion: 'base', scoringType: 'custom', needsContext: true },
  { key: 'red_deer', category: 'lateral', tags: ['deer', 'cloven_hoofed'], expansion: 'base', scoringType: 'fixed' },
  { key: 'lynx', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'threshold' },
  { key: 'wolf', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'wild_boar', category: 'lateral', tags: ['pawed', 'cloven_hoofed'], expansion: 'base', scoringType: 'threshold' },
  { key: 'european_badger', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'fixed' },
  { key: 'european_hare', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'european_fat_dormouse', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'squeaker', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'fixed' },
  { key: 'brown_bear', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'fixed' },
  { key: 'fox', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'violet_carpenter_bee', category: 'lateral', tags: ['insect'], expansion: 'base', scoringType: 'fixed' },
  { key: 'steinbock', category: 'lateral', tags: ['deer', 'alpine', 'cloven_hoofed'], expansion: 'alpine', scoringType: 'fixed' },
  { key: 'beech_marten', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'custom' },
  { key: 'fallow_deer', category: 'lateral', tags: ['cloven_hoofed'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'gnat', category: 'lateral', tags: ['insect'], expansion: 'base', scoringType: 'per_tag' },
  { key: 'raccoon', category: 'lateral', tags: ['pawed'], expansion: 'base', scoringType: 'fixed' },
  { key: 'alpine_marmot', category: 'lateral', tags: ['pawed', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'mountain_hare', category: 'lateral', tags: ['pawed', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  { key: 'capercaillie', category: 'lateral', tags: ['bird', 'alpine'], expansion: 'alpine', scoringType: 'per_tag' },
  // Alpine lateral
  { key: 'savis_pipistrelle', category: 'lateral', tags: ['bat', 'alpine'], expansion: 'alpine', scoringType: 'set' },
  { key: 'chamois', category: 'lateral', tags: ['deer', 'alpine', 'cloven_hoofed'], expansion: 'alpine', scoringType: 'custom', needsContext: true },
  // Woodland lateral
  { key: 'bee_swarm', category: 'lateral', tags: ['insect'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'common_pipistrelle', category: 'lateral', tags: ['bat'], expansion: 'woodland', scoringType: 'set' },
  { key: 'crane_fly', category: 'lateral', tags: ['insect'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'elk', category: 'lateral', tags: ['cloven_hoofed'], expansion: 'woodland', scoringType: 'custom', needsContext: true },
  { key: 'european_bison', category: 'lateral', tags: ['cloven_hoofed'], expansion: 'woodland', scoringType: 'custom', needsContext: true },
  { key: 'european_polecat', category: 'lateral', tags: ['pawed'], expansion: 'woodland', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'european_wildcat', category: 'lateral', tags: ['pawed', 'woodland_edge'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'genet', category: 'lateral', tags: ['pawed'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'red_panda', category: 'lateral', tags: ['pawed'], expansion: 'woodland', scoringType: 'fixed' },
  { key: 'sable', category: 'lateral', tags: ['pawed'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'troll', category: 'lateral', tags: [], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'white_stork', category: 'lateral', tags: ['bird'], expansion: 'woodland', scoringType: 'per_tag' },
  { key: 'wild_boar_female', category: 'lateral', tags: ['cloven_hoofed', 'pawed'], expansion: 'woodland', scoringType: 'per_card' },

  // ============================================================
  // CAVE
  // ============================================================
  { key: 'cave', category: 'cave', tags: [], expansion: 'base', scoringType: 'fixed' },
]

/** Get cards filtered by enabled expansions */
export function getCards(expansions: Expansion[]): CardDefinition[] {
  const enabled = new Set(expansions)
  enabled.add('base') // always include base
  return CARDS.filter((c) => enabled.has(c.expansion))
}

/** Get cards grouped by category */
export function getCardsByCategory(expansions: Expansion[]) {
  const cards = getCards(expansions)
  return {
    tree: cards.filter((c) => c.category === 'tree'),
    top: cards.filter((c) => c.category === 'top'),
    bottom: cards.filter((c) => c.category === 'bottom'),
    lateral: cards.filter((c) => c.category === 'lateral'),
    cave: cards.filter((c) => c.category === 'cave'),
  }
}

/** Get a single card by key */
export function getCard(key: string): CardDefinition | undefined {
  return CARDS.find((c) => c.key === key)
}
