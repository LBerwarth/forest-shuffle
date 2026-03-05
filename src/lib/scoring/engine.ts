import type { ForestContext, ScoringFunction, CardMetadata, ScoreBreakdown, ScoreEntry } from '@/types/scoring'
import type { CardCategory, CardTag } from '@/types/card'
import { CARDS } from '@/data/cards'

// ============================================================
// SET SCORING TABLES
// ============================================================

/** Horse Chestnut: 1/4/9/16/25/36/49 (perfect squares) */
const CHESTNUT_SET = [0, 1, 4, 9, 16, 25, 36, 49]

/** Butterflies (different species): 0/3/6/12/20/35/55/80 */
const BUTTERFLY_SET = [0, 0, 3, 6, 12, 20, 35, 55, 80]

/** Firefly set: 0/10/15/20 */
const FIREFLY_SET = [0, 0, 10, 15, 20]

/** Fire Salamander set: 0/5/15/25 */
const FIRE_SALAMANDER_SET = [0, 5, 15, 25]

/** Plant diversity set (for Digitalis): 0/1/3/6/10/15 */
const PLANT_DIVERSITY_SET = [0, 1, 3, 6, 10, 15]

function lookupSet(table: number[], count: number): number {
  if (count < 0) return 0
  if (count >= table.length) return table[table.length - 1]!
  return table[count]!
}

// ============================================================
// HELPER: count specific tags
// ============================================================

function countTag(ctx: ForestContext, tag: CardTag): number {
  return ctx.tagCounts[tag] || 0
}

function countCard(ctx: ForestContext, key: string): number {
  return ctx.cardCounts[key] || 0
}

function countHares(ctx: ForestContext): number {
  return countCard(ctx, 'european_hare') + countCard(ctx, 'mountain_hare')
}

// ============================================================
// BUTTERFLY SET - multi-set algorithm
// ============================================================

const BUTTERFLY_KEYS = [
  'peacock_butterfly', 'purple_emperor', 'silver_washed_fritillary',
  'camberwell_beauty', 'large_tortoiseshell', 'phoebus_apollo',
  'map_butterfly', 'brimstone',
]

export function scoreButterflySet(ctx: ForestContext): number {
  const counts = BUTTERFLY_KEYS.map((k) => countCard(ctx, k))
  // Multi-set: for set i (1-indexed), size = number of species with count >= i
  let total = 0
  const maxCount = Math.max(0, ...counts)
  for (let i = 1; i <= maxCount; i++) {
    const setSize = counts.filter((c) => c >= i).length
    total += lookupSet(BUTTERFLY_SET, setSize)
  }
  return total
}

// ============================================================
// BAT SET - threshold scoring
// ============================================================

const BAT_KEYS = [
  'barbastelle', 'bechsteins_bat', 'brown_long_eared_bat',
  'greater_horseshoe_bat', 'savis_pipistrelle', 'common_pipistrelle',
]

export function scoreBatSet(ctx: ForestContext): number {
  const uniqueSpecies = BAT_KEYS.filter((k) => countCard(ctx, k) > 0).length
  if (uniqueSpecies >= 3) {
    const totalBats = BAT_KEYS.reduce((sum, k) => sum + countCard(ctx, k), 0)
    return totalBats * 5
  }
  return 0
}

// ============================================================
// INDIVIDUAL CARD SCORING FUNCTIONS
// ============================================================

const scoringFunctions: Record<string, ScoringFunction> = {
  // --- TREES ---
  birch: (count) => count * 1,
  beech: (count) => count >= 4 ? count * 5 : 0,
  douglas_fir: (count) => count * 5,
  oak: (count, ctx) => ctx.treeSpeciesCount >= 8 ? count * 10 : 0,
  horse_chestnut: (count) => lookupSet(CHESTNUT_SET, count),
  linden: () => 0, // comparison card - handled separately
  sycamore: (count, ctx) => count * ctx.totalTrees,

  // Silver Fir: 2 points per card attached to Silver Firs
  silver_fir: (_count, _ctx, metadata) => {
    return (metadata?.contextValue ?? 0) * 2
  },

  // Alpine trees
  european_larch: (count) => count * 3,
  stone_pine: (count, ctx) => count * countTag(ctx, 'alpine'),

  // Woodland trees
  palm_tree: (count, ctx) => count * countTag(ctx, 'bird'),
  turkey_oak: (count, ctx) => count * countTag(ctx, 'cloven_hoofed'),

  // --- TOP SLOT ---
  bullfinch: (count, ctx) => count * (countTag(ctx, 'insect') * 2),
  chaffinch: (_count, _ctx, metadata) => {
    // 5 points per Chaffinch that is on a Beech
    return (metadata?.contextValue ?? 0) * 5
  },
  great_spotted_woodpecker: () => 0, // comparison card
  goshawk: (count, ctx) => count * (countTag(ctx, 'bird') * 3),
  eurasian_jay: (count) => count * 3,
  tawny_owl: (count) => count * 5,

  // Butterflies - scored via butterfly set
  peacock_butterfly: () => 0,
  purple_emperor: () => 0,
  silver_washed_fritillary: () => 0,
  camberwell_beauty: () => 0,
  large_tortoiseshell: () => 0,
  phoebus_apollo: () => 0,
  brimstone: () => 0,
  map_butterfly: () => 0,

  red_squirrel: (_count, _ctx, metadata) => {
    return (metadata?.contextValue ?? 0) * 5
  },

  // Alpine top
  golden_eagle: (count, ctx) => count * (countTag(ctx, 'pawed') + countTag(ctx, 'amphibian')),
  bearded_vulture: (count, ctx) => count * countCard(ctx, 'cave'),
  common_raven: (count) => count * 5,

  // Woodland top
  barn_owl: (count, ctx) => count * (countTag(ctx, 'bat') * 3),
  cardinal: (count) => count * 5,
  cuckoo: (count) => count * 7,
  eurasian_magpie: (count) => count * 3,
  mistletoe: (count, ctx) => count * countTag(ctx, 'plant'),
  nightingale: (_count, _ctx, metadata) => {
    // 5pts per nightingale if on shrub (needsContext)
    return (metadata?.contextValue ?? 0) * 5
  },
  robin: (count, ctx) => count * countTag(ctx, 'insect'),
  whinchat: (count, ctx) => count * countTag(ctx, 'plant'),

  // --- BOTTOM SLOT ---
  common_toad: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 5,
  fire_salamander: (count) => lookupSet(FIRE_SALAMANDER_SET, count),
  tree_frog: (count, ctx) => count * (5 * countCard(ctx, 'gnat')),
  stag_beetle: (count, ctx) => count * countTag(ctx, 'pawed'),
  wood_ant: (count, ctx) => count * 2 * ctx.slotCounts.bottom,
  penny_bun: () => 0,
  chanterelle: () => 0,
  fly_agaric: () => 0,
  parasol_mushroom: () => 0,
  moss: (count, ctx) => ctx.totalTrees >= 10 ? count * 10 : 0,
  wild_strawberries: (count, ctx) => ctx.treeSpeciesCount >= 8 ? count * 10 : 0,
  hedgehog: (count, ctx) => count * (countTag(ctx, 'butterfly') * 2),
  pond_turtle: (count) => count * 5,
  blackberries: (count, ctx) => count * (countTag(ctx, 'plant') * 2),
  fireflies: (count) => lookupSet(FIREFLY_SET, count),
  mole: () => 0,
  tree_ferns: (count, ctx) => count * (countTag(ctx, 'amphibian') * 6),

  // Alpine bottom
  alpine_newt: (count, ctx) => count * (2 * countTag(ctx, 'insect')),
  blueberry: (count, ctx) => {
    // 2pts per unique bird type
    const birdKeys = CARDS.filter((c) => c.tags.includes('bird')).map((c) => c.key)
    const uniqueBirdTypes = birdKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (2 * uniqueBirdTypes)
  },
  gentian: (count, ctx) => count * (3 * countTag(ctx, 'butterfly')),
  edelweiss: (count) => count * 3,

  // Woodland bottom
  black_trumpet: () => 0,
  digitalis: (count, ctx) => {
    // Plant diversity set multiplied by count
    const plantKeys = CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantTypes = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * lookupSet(PLANT_DIVERSITY_SET, uniquePlantTypes)
  },
  great_green_bush_cricket: (count, ctx) => count * countTag(ctx, 'insect'),
  marsh_cinquefoil: (count, ctx) => {
    // 15/7/3 based on tree count ranges (per official appendix)
    const trees = ctx.totalTrees
    let pts: number
    if (trees <= 5) pts = 15
    else if (trees <= 10) pts = 7
    else pts = 3
    return count * pts
  },
  stinging_nettle: (count, ctx) => count * (2 * countTag(ctx, 'butterfly')),
  water_vole: () => 0,
  wild_tulip: (count) => count * 3,

  // --- LATERAL SLOT ---
  // Bats - scored via bat set
  barbastelle: () => 0,
  bechsteins_bat: () => 0,
  brown_long_eared_bat: () => 0,
  greater_horseshoe_bat: () => 0,
  savis_pipistrelle: () => 0,
  common_pipistrelle: () => 0,

  // Deer
  roe_deer: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 3,
  red_deer: (count, ctx) => count * (ctx.totalTrees + countTag(ctx, 'plant')),
  chamois: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 3,
  steinbock: (count) => count * 10,

  lynx: (count, ctx) => countCard(ctx, 'roe_deer') >= 1 ? count * 10 : 0,
  wolf: (count, ctx) => count * (5 * countTag(ctx, 'deer')),
  wild_boar: (count, ctx) => countCard(ctx, 'squeaker') >= 1 ? count * 10 : 0,
  european_badger: (count) => count * 2,
  european_hare: (count, ctx) => count * countHares(ctx),
  european_fat_dormouse: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 15,
  squeaker: (count) => count * 1,

  brown_bear: () => 0,
  fox: (count, ctx) => count * (countHares(ctx) * 2),
  violet_carpenter_bee: () => 0,

  // New base lateral
  beech_marten: (count, ctx) => count * ctx.fullyOccupiedTrees * 5,
  fallow_deer: (count, ctx) => count * (3 * countTag(ctx, 'cloven_hoofed')),
  gnat: (count, ctx) => count * countTag(ctx, 'bat'),
  raccoon: () => 0,

  alpine_marmot: (count, ctx) => {
    // 3pts per unique plant type
    const plantKeys = CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantTypes = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (3 * uniquePlantTypes)
  },
  mountain_hare: (count, ctx) => count * countHares(ctx),
  capercaillie: (count, ctx) => count * countTag(ctx, 'plant'),

  // Woodland lateral
  bee_swarm: (count, ctx) => count * countTag(ctx, 'plant'),
  crane_fly: (count, ctx) => count * countTag(ctx, 'bat'),
  elk: (_count, _ctx, metadata) => {
    // 2pts per tree sapling and per card showing Elk's tree symbols (incl self)
    return (metadata?.contextValue ?? 0) * 2
  },
  european_bison: (_count, _ctx, metadata) => {
    // 2pts per card showing one of its tree symbols (incl self)
    return (metadata?.contextValue ?? 0) * 2
  },
  european_polecat: (_count, _ctx, metadata) => {
    // 10pts if alone on tree (needsContext)
    return (metadata?.contextValue ?? 0) * 10
  },
  european_wildcat: (count, ctx) => count * countTag(ctx, 'woodland_edge'),
  genet: (count) => count * 5,
  red_panda: (count) => count * 2,
  sable: (count, ctx) => count * (3 * countTag(ctx, 'pawed')),
  troll: (count, ctx) => count * ctx.totalTrees,
  white_stork: (count, ctx) => count * (countTag(ctx, 'insect') + countTag(ctx, 'amphibian')),
  wild_boar_female: (count, ctx) => count * (10 * countCard(ctx, 'squeaker')),

  // --- CAVE ---
  cave: (count, ctx) => {
    if (countCard(ctx, 'collectors_cave') > 0) return count * 2
    return count * 1
  },

  // --- EXPLORATION SPECIAL CAVES ---
  collectors_cave: () => 0, // effect is on the 'cave' card scoring above
  bat_cave: (count, ctx) => count > 0 ? countTag(ctx, 'bat') * 3 : 0,
  lonely_cave: (count, ctx) => {
    if (count === 0) return 0
    const regularCaveCount = countCard(ctx, 'cave')
    return regularCaveCount === 0 ? 5 : 0
  },
}

// ============================================================
// COMPARISON CARDS (cross-player)
// ============================================================

export function scoreLinden(
  playerLindenCount: number,
  allPlayerLindenCounts: number[],
): number {
  const maxLindens = Math.max(...allPlayerLindenCounts)
  if (playerLindenCount >= maxLindens && playerLindenCount > 0) {
    return playerLindenCount * 3
  }
  return playerLindenCount * 1
}

export function scoreWoodpecker(
  woodpeckerCount: number,
  playerTreeCount: number,
  allPlayerTreeCounts: number[],
): number {
  const maxTrees = Math.max(...allPlayerTreeCounts)
  if (playerTreeCount === maxTrees && playerTreeCount > 0) {
    return woodpeckerCount * 10
  }
  return 0
}

// ============================================================
// BUILD FOREST CONTEXT
// ============================================================

export function buildForestContext(
  cardCounts: Record<string, number>,
  cardMetadata: Record<string, CardMetadata>,
  fullyOccupiedTrees: number,
): ForestContext {
  const tagCounts: Record<CardTag, number> = {
    bird: 0, butterfly: 0, insect: 0, amphibian: 0,
    pawed: 0, deer: 0, bat: 0, plant: 0, mushroom: 0,
    alpine: 0, cloven_hoofed: 0, woodland_edge: 0,
    dragonfly: 0, mouse: 0, rabbit: 0, hoofed: 0,
  }

  const slotCounts: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0,
  }

  const treeSpeciesPresent = new Set<string>()
  let totalCards = 0
  let totalTrees = 0

  for (const card of CARDS) {
    const count = cardCounts[card.key] || 0
    if (count === 0) continue

    totalCards += count
    slotCounts[card.category] += count

    if (card.category === 'tree') {
      totalTrees += count
      treeSpeciesPresent.add(card.key)
    }

    for (const tag of card.tags) {
      tagCounts[tag] += count
    }
  }

  return {
    totalTrees,
    treeSpeciesCount: treeSpeciesPresent.size,
    treeSpeciesPresent,
    tagCounts,
    cardCounts,
    slotCounts,
    fullyOccupiedTrees,
    totalCards,
    totalMoors: 0,
    cardMetadata,
  }
}

// ============================================================
// SCORE A SINGLE CARD
// ============================================================

export function scoreCard(
  cardKey: string,
  count: number,
  context: ForestContext,
  metadata?: CardMetadata,
): number {
  const fn = scoringFunctions[cardKey]
  if (!fn) return 0
  return fn(count, context, metadata)
}

// ============================================================
// COMPUTE FULL SCORE BREAKDOWN FOR A PLAYER
// ============================================================

export function computeScoreBreakdown(
  cardCounts: Record<string, number>,
  cardMetadata: Record<string, CardMetadata>,
  fullyOccupiedTrees: number,
  activeCards: string[],
  allPlayerLindenCounts?: number[],
  allPlayerTreeCounts?: number[],
): ScoreBreakdown {
  const context = buildForestContext(cardCounts, cardMetadata, fullyOccupiedTrees)

  const entries: ScoreEntry[] = []
  const categoryTotals: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0,
  }

  for (const cardKey of activeCards) {
    const count = cardCounts[cardKey] || 0
    if (count === 0) continue

    const card = CARDS.find((c) => c.key === cardKey)
    if (!card) continue

    const metadata = cardMetadata[cardKey]
    const points = scoreCard(cardKey, count, context, metadata)

    entries.push({
      cardKey,
      cardCategory: card.category,
      count,
      points,
    })
    categoryTotals[card.category] += points
  }

  // Add set bonuses
  const butterflyPoints = scoreButterflySet(context)
  if (butterflyPoints > 0) {
    entries.push({ cardKey: '_butterfly_set', cardCategory: 'top', count: 1, points: butterflyPoints })
    categoryTotals.top += butterflyPoints
  }

  const batPoints = scoreBatSet(context)
  if (batPoints > 0) {
    entries.push({ cardKey: '_bat_set', cardCategory: 'lateral', count: 1, points: batPoints })
    categoryTotals.lateral += batPoints
  }

  // Comparison cards (cross-player)
  if (allPlayerLindenCounts && allPlayerLindenCounts.length > 0) {
    const lindenCount = cardCounts['linden'] || 0
    if (lindenCount > 0) {
      const lindenPoints = scoreLinden(lindenCount, allPlayerLindenCounts)
      entries.push({ cardKey: 'linden', cardCategory: 'tree', count: lindenCount, points: lindenPoints })
      categoryTotals.tree += lindenPoints
    }
  }

  if (allPlayerTreeCounts && allPlayerTreeCounts.length > 0) {
    const wpCount = cardCounts['great_spotted_woodpecker'] || 0
    if (wpCount > 0) {
      const wpPoints = scoreWoodpecker(wpCount, context.totalTrees, allPlayerTreeCounts)
      entries.push({ cardKey: 'great_spotted_woodpecker', cardCategory: 'top', count: wpCount, points: wpPoints })
      categoryTotals.top += wpPoints
    }
  }

  const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)

  return { entries, categoryTotals, total }
}
