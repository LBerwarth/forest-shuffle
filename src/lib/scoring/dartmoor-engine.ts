import type { ForestContext, ScoringFunction, CardMetadata, ScoreBreakdown, ScoreEntry } from '@/types/scoring'
import type { CardCategory, CardTag } from '@/types/card'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'

// ============================================================
// SET SCORING TABLES
// ============================================================

/** Dragonfly set: 0/5/10/15/30 for 1-5 species */
const DRAGONFLY_SET = [0, 0, 5, 10, 15, 30]

/** Warty Newt set: 5/15/25 for 1/2/3 */
const WARTY_NEWT_SET = [0, 5, 15, 25]

function lookupSet(table: number[], count: number): number {
  if (count < 0) return 0
  if (count >= table.length) return table[table.length - 1]!
  return table[count]!
}

// ============================================================
// HELPERS
// ============================================================

function countTag(ctx: ForestContext, tag: CardTag): number {
  return ctx.tagCounts[tag] || 0
}

function countCard(ctx: ForestContext, key: string): number {
  return ctx.cardCounts[key] || 0
}

// ============================================================
// DRAGONFLY SET - multi-set algorithm (like butterflies)
// ============================================================

const DRAGONFLY_KEYS = [
  'beautiful_demoiselle', 'emerald_damselfly', 'keeled_skimmer',
  'small_red_damselfly', 'southern_damselfly',
]

export function scoreDragonflySet(ctx: ForestContext): number {
  const counts = DRAGONFLY_KEYS.map((k) => countCard(ctx, k))
  let total = 0
  const maxCount = Math.max(0, ...counts)
  for (let i = 1; i <= maxCount; i++) {
    const setSize = counts.filter((c) => c >= i).length
    total += lookupSet(DRAGONFLY_SET, setSize)
  }
  return total
}

// ============================================================
// BAT SET - threshold scoring (same logic as classic)
// ============================================================

const DARTMOOR_BAT_KEYS = [
  'alcathoe_bat', 'brandts_bat', 'common_noctule',
  'daubentons_bat', 'serotine_bat',
]

export function scoreDartmoorBatSet(ctx: ForestContext): number {
  const uniqueSpecies = DARTMOOR_BAT_KEYS.filter((k) => countCard(ctx, k) > 0).length
  if (uniqueSpecies >= 3) {
    const totalBats = DARTMOOR_BAT_KEYS.reduce((sum, k) => sum + countCard(ctx, k), 0)
    return totalBats * 5
  }
  return 0
}

// ============================================================
// MEADOW PIPIT - bird species table
// ============================================================

function scoreMeadowPipit(count: number, ctx: ForestContext): number {
  const birdKeys = DARTMOOR_CARDS.filter((c) => c.tags.includes('bird')).map((c) => c.key)
  const uniqueBirdSpecies = birdKeys.filter((k) => countCard(ctx, k) > 0).length
  let ptsPerCard: number
  if (uniqueBirdSpecies >= 6) ptsPerCard = 10
  else if (uniqueBirdSpecies >= 4) ptsPerCard = 6
  else if (uniqueBirdSpecies >= 2) ptsPerCard = 3
  else ptsPerCard = 1
  return count * ptsPerCard
}

// ============================================================
// INDIVIDUAL CARD SCORING FUNCTIONS
// ============================================================

const scoringFunctions: Record<string, ScoringFunction> = {
  // --- TREES ---
  ash: (count, ctx) => count * (ctx.totalTrees + countTag(ctx, 'plant')),
  black_alder: (count) => count * 5,
  crab_apple: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 8,
  goat_willow: (count, ctx) => count * ctx.totalMoors,
  moor_birch: (count) => count * 1,
  sessile_oak: (count, ctx) => count * ctx.totalTrees,

  // Shrubs — 0 points
  common_hazel_d: () => 0,
  elderberry_d: () => 0,

  // --- MOOR ---
  blanket_bog: (_count, _ctx, metadata) => metadata?.contextValue ?? 0,
  fountainhead: () => 0,
  lowland_heath: (count, ctx) => count * (2 * countTag(ctx, 'amphibian')),
  rhos_pasture: (count, ctx) => count * (2 * countTag(ctx, 'hoofed')),
  rivulet: (count, ctx) => count * (2 * ctx.totalTrees),
  tor: () => 0,
  valley_mire: (count, ctx) => count * (2 * countTag(ctx, 'insect')),
  warrens: (count, ctx) => count * (2 * countTag(ctx, 'pawed')),
  wet_woodland: (count, ctx) => count * (2 * ctx.totalMoors),

  // --- TOP SLOT ---
  barn_owl_d: (count, ctx) => count * (3 * countTag(ctx, 'bat')),
  // Dragonflies — scored via dragonfly set
  beautiful_demoiselle: () => 0,
  emerald_damselfly: () => 0,
  keeled_skimmer: () => 0,
  small_red_damselfly: () => 0,
  southern_damselfly: () => 0,

  black_tailed_godwit: () => 0, // comparison card — handled separately
  buzzard: (count, ctx) => count * (2 * countTag(ctx, 'mouse')),
  common_moorhen: (count, ctx) => count * (2 * countTag(ctx, 'dragonfly')),
  cuckoo_d: (count) => count * 7,
  curlew: (count, ctx) => countTag(ctx, 'insect') >= 5 ? count * 10 : count * 3,
  grey_heron: (count) => count * 8,
  meadow_pipit: scoreMeadowPipit,
  wheatear: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 5,

  // --- BOTTOM SLOT ---
  adder: (count, ctx) => count * (countTag(ctx, 'amphibian') + countTag(ctx, 'mouse')),
  adders_tongue: (count) => count * 3,
  beaver: (count, ctx) => count * countCard(ctx, 'cave_d'),
  blue_ground_beetle: (count, ctx) => count * ctx.slotCounts.bottom,
  blueberry_d: (count, ctx) => {
    const birdKeys = DARTMOOR_CARDS.filter((c) => c.tags.includes('bird')).map((c) => c.key)
    const uniqueBirdSpecies = birdKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (2 * uniqueBirdSpecies)
  },
  bog_asphodel: (count, ctx) => count * ctx.totalMoors,
  common_lizard: (count, ctx) => {
    const amphibianKeys = DARTMOOR_CARDS.filter((c) => c.tags.includes('amphibian')).map((c) => c.key)
    const uniqueAmphibianSpecies = amphibianKeys.filter((k) => countCard(ctx, k) > 0).length
    return uniqueAmphibianSpecies >= 3 ? count * 15 : count * 5
  },
  grass_snake: (count) => count * 5,
  greater_butterfly_orchid: (count, ctx) => {
    const plantKeys = DARTMOOR_CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantSpecies = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return uniquePlantSpecies >= 5 ? count * 15 : count * 3
  },
  heather: (count, ctx) => count * countTag(ctx, 'insect'),
  meadowsweet: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 5,
  moor_frog: (count, ctx) => ctx.totalMoors >= 5 ? count * 8 : 0,
  otter: (count, ctx) => count * (3 * countTag(ctx, 'amphibian')),
  royal_fern: (count, ctx) => {
    const plantKeys = DARTMOOR_CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantSpecies = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (2 * uniquePlantSpecies)
  },
  warty_newt: (count) => lookupSet(WARTY_NEWT_SET, count),
  water_soldiers: (count, ctx) => count * (2 * countTag(ctx, 'dragonfly')),

  // --- LATERAL SLOT ---
  // Bats — scored via bat set
  alcathoe_bat: () => 0,
  brandts_bat: () => 0,
  common_noctule: () => 0,
  daubentons_bat: () => 0,
  serotine_bat: () => 0,

  capercaillie_d: (count, ctx) => count * countTag(ctx, 'plant'),
  common_pheasant: (count, ctx) => count * (countTag(ctx, 'hoofed') + countTag(ctx, 'bird')),
  dartmoor_badger: (count, ctx) => count * (2 * countTag(ctx, 'pawed')),
  dartmoor_black_rabbit: (count) => count * count, // square scoring
  dartmoor_pony: () => 0, // comparison card — handled separately
  dartmoor_sheep: (count, ctx) => count * (2 * countTag(ctx, 'hoofed')),
  field_vole: (count, ctx) => count * countTag(ctx, 'mouse'),
  gnat_d: (count, ctx) => count * countTag(ctx, 'bat'),
  lake_fly: (count, ctx) => count * countTag(ctx, 'bat'),
  nuthatch: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 10,
  roe_deer_d: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 3,
  shrew: (count) => count * 1,
  treecreeper: (count) => count * 5,
  wood_mouse: (count, ctx) => count * countTag(ctx, 'mouse'),

  // --- CAVE ---
  cave_d: (count) => count * 1,
}

// ============================================================
// COMPARISON CARDS
// ============================================================

export function scoreBlackTailedGodwit(
  count: number,
  playerMoors: number,
  allPlayerMoorCounts: number[],
): number {
  if (count === 0) return 0
  const maxMoors = Math.max(...allPlayerMoorCounts)
  if (playerMoors >= maxMoors && playerMoors > 0) {
    return count * 10
  }
  return 0
}

export function scoreDartmoorPony(
  count: number,
  playerMoors: number,
  allPlayerMoorCounts: number[],
): number {
  if (count === 0) return 0
  const maxMoors = Math.max(...allPlayerMoorCounts)
  if (playerMoors >= maxMoors && playerMoors > 0) {
    return count * 15
  }
  return count * 5
}

// ============================================================
// BUILD DARTMOOR FOREST CONTEXT
// ============================================================

export function buildDartmoorForestContext(
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
  let totalMoors = 0

  for (const card of DARTMOOR_CARDS) {
    const count = cardCounts[card.key] || 0
    if (count === 0) continue

    totalCards += count
    slotCounts[card.category] += count

    if (card.category === 'tree') {
      totalTrees += count
      treeSpeciesPresent.add(card.key)
    }

    if (card.category === 'moor') {
      totalMoors += count
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
    totalMoors,
    cardMetadata,
  }
}

// ============================================================
// SCORE A SINGLE DARTMOOR CARD
// ============================================================

function scoreDartmoorCard(
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
// COMPUTE FULL DARTMOOR SCORE BREAKDOWN
// ============================================================

export function computeDartmoorScoreBreakdown(
  cardCounts: Record<string, number>,
  cardMetadata: Record<string, CardMetadata>,
  fullyOccupiedTrees: number,
  activeCards: string[],
  allPlayerMoorCounts?: number[],
): ScoreBreakdown {
  const context = buildDartmoorForestContext(cardCounts, cardMetadata, fullyOccupiedTrees)

  const entries: ScoreEntry[] = []
  const categoryTotals: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0,
  }

  for (const cardKey of activeCards) {
    const count = cardCounts[cardKey] || 0
    if (count === 0) continue

    const card = DARTMOOR_CARDS.find((c) => c.key === cardKey)
    if (!card) continue

    const metadata = cardMetadata[cardKey]
    const points = scoreDartmoorCard(cardKey, count, context, metadata)

    entries.push({
      cardKey,
      cardCategory: card.category,
      count,
      points,
    })
    categoryTotals[card.category] += points
  }

  // Add dragonfly set bonus
  const dragonflyPoints = scoreDragonflySet(context)
  if (dragonflyPoints > 0) {
    entries.push({ cardKey: '_dragonfly_set', cardCategory: 'top', count: 1, points: dragonflyPoints })
    categoryTotals.top += dragonflyPoints
  }

  // Add bat set bonus
  const batPoints = scoreDartmoorBatSet(context)
  if (batPoints > 0) {
    entries.push({ cardKey: '_bat_set', cardCategory: 'lateral', count: 1, points: batPoints })
    categoryTotals.lateral += batPoints
  }

  // Comparison cards
  if (allPlayerMoorCounts && allPlayerMoorCounts.length > 0) {
    const godwitCount = cardCounts['black_tailed_godwit'] || 0
    if (godwitCount > 0) {
      const godwitPoints = scoreBlackTailedGodwit(godwitCount, context.totalMoors, allPlayerMoorCounts)
      entries.push({ cardKey: 'black_tailed_godwit', cardCategory: 'top', count: godwitCount, points: godwitPoints })
      categoryTotals.top += godwitPoints
    }

    const ponyCount = cardCounts['dartmoor_pony'] || 0
    if (ponyCount > 0) {
      const ponyPoints = scoreDartmoorPony(ponyCount, context.totalMoors, allPlayerMoorCounts)
      entries.push({ cardKey: 'dartmoor_pony', cardCategory: 'lateral', count: ponyCount, points: ponyPoints })
      categoryTotals.lateral += ponyPoints
    }
  }

  const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)

  return { entries, categoryTotals, total }
}
