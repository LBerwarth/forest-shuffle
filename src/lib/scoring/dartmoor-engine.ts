import type { ForestContext, ScoringFunction, CardMetadata, ScoreBreakdown, ScoreEntry } from '@/types/scoring'
import type { CardCategory, CardTag } from '@/types/card'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'
import { EXMOOR_CARDS } from '@/data/exmoor-cards'

// Exmoor keys count 0 when the expansion is off, so the combined list is
// always safe to score against.
const ALL_DARTMOOR_CARDS = [...DARTMOOR_CARDS, ...EXMOOR_CARDS]

// ============================================================
// SET SCORING TABLES
// ============================================================

/** Dragonfly set: 0/5/10/15/30/50 for 1-6 species (6th is Exmoor's) */
const DRAGONFLY_SET = [0, 0, 5, 10, 15, 30, 50]

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
  'small_red_damselfly', 'southern_damselfly', 'golden_ringed_dragonfly',
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

export interface SetSeries {
  index: number
  setSize: number
  points: number
}

export function getDragonflySeriesBreakdown(ctx: ForestContext): SetSeries[] {
  const counts = DRAGONFLY_KEYS.map((k) => countCard(ctx, k))
  const maxCount = Math.max(0, ...counts)
  const series: SetSeries[] = []
  for (let i = 1; i <= maxCount; i++) {
    const setSize = counts.filter((c) => c >= i).length
    series.push({ index: i, setSize, points: lookupSet(DRAGONFLY_SET, setSize) })
  }
  return series
}

// ============================================================
// BAT SET - threshold scoring (same logic as classic)
// ============================================================

const DARTMOOR_BAT_KEYS = [
  'alcathoe_bat', 'brandts_bat', 'common_noctule',
  'daubentons_bat', 'serotine_bat', 'whiskered_bat',
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
// PER-CARD SET HELPERS — distribute set points to individual cards
// ============================================================

function dartmoorBatCardPoints(count: number, ctx: ForestContext): number {
  if (count === 0) return 0
  const uniqueSpecies = DARTMOOR_BAT_KEYS.filter((k) => countCard(ctx, k) > 0).length
  return uniqueSpecies >= 3 ? count * 5 : 0
}

// Distribute set points across dragonfly cards using largest-remainder rounding
// so per-card values sum exactly to scoreDragonflySet(ctx). Math.round per card
// could leave the displayed total ±1 off the real total.
function distributeDragonflyPoints(ctx: ForestContext): Record<string, number> {
  const counts = DRAGONFLY_KEYS.map((k) => countCard(ctx, k))
  const totalDragonflies = counts.reduce((a, b) => a + b, 0)
  const total = scoreDragonflySet(ctx)
  const result: Record<string, number> = Object.fromEntries(DRAGONFLY_KEYS.map((k) => [k, 0]))
  if (totalDragonflies === 0 || total === 0) return result

  const exact = counts.map((c) => (c / totalDragonflies) * total)
  const floors = exact.map((v) => Math.floor(v))
  let leftover = total - floors.reduce((a, b) => a + b, 0)
  const remainders = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || counts[b.i]! - counts[a.i]!)

  for (let r = 0; r < remainders.length && leftover > 0; r++) {
    floors[remainders[r]!.i]! += 1
    leftover -= 1
  }

  DRAGONFLY_KEYS.forEach((k, i) => { result[k] = floors[i]! })
  return result
}

function dragonflyCardPoints(key: string, count: number, ctx: ForestContext): number {
  if (count === 0) return 0
  return distributeDragonflyPoints(ctx)[key] ?? 0
}

// ============================================================
// MEADOW PIPIT - bird species table
// ============================================================

function scoreMeadowPipit(count: number, ctx: ForestContext): number {
  const birdKeys = ALL_DARTMOOR_CARDS.filter((c) => c.tags.includes('bird')).map((c) => c.key)
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
  ash: (count, ctx, metadata) => count * ((metadata?.contextValue ?? 0) + countTag(ctx, 'plant')),
  black_alder: (count) => count * 5,
  crab_apple: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 8,
  goat_willow: (count, ctx) => count * ctx.totalMoors,
  moor_birch: (count) => count * 1,
  // Scores trees AND shrubs — slotCounts.tree includes both
  sessile_oak: (count, ctx) => count * ctx.slotCounts.tree,

  // Shrubs — 0 points
  common_hazel_d: () => 0,
  elderberry_d: () => 0,

  // --- MOOR ---
  // Blanket Bog doubles the points of plants placed under it. The user picks
  // which plant keys are below the bog (stored in metadata.hostCardKeys); the
  // bog's own score is the sum of those plants' single-copy values, which
  // mirrors the in-game "the plant scores twice" effect (the plant scores its
  // normal value, the bog adds another copy of that value on top).
  blanket_bog: (_count, ctx, metadata) => {
    const hostKeys = metadata?.hostCardKeys ?? []
    let bonus = 0
    for (const hostKey of hostKeys) {
      if (!hostKey || hostKey === 'blanket_bog') continue
      // contextValue:1 so context-driven hosts (Meadowsweet scores contextValue×5)
      // double one hosted copy, not their whole in-moor count.
      bonus += scoreDartmoorCard(hostKey, 1, ctx, { ...ctx.cardMetadata[hostKey], contextValue: 1 })
    }
    return bonus
  },
  fountainhead: () => 0,
  lowland_heath: (count, ctx) => count * (2 * countTag(ctx, 'amphibian')),
  rhos_pasture: (count, ctx) => count * (2 * countTag(ctx, 'hoofed')),
  rivulet: (count, _ctx, metadata) => count * (metadata?.contextValue ?? 0) * 2,
  tor: () => 0,
  valley_mire: (count, ctx) => count * (2 * countTag(ctx, 'insect')),
  warrens: (count, ctx) => count * (2 * countTag(ctx, 'pawed')),
  wet_woodland: (count, ctx) => count * (2 * ctx.totalMoors),
  universal_moor: () => 0, // 0 points but counts as a moor

  // --- TOP SLOT ---
  barn_owl_d: (count, ctx) => count * (3 * countTag(ctx, 'bat')),
  // Dragonflies — each card shows its share of the dragonfly set bonus
  beautiful_demoiselle: (count, ctx) => dragonflyCardPoints('beautiful_demoiselle', count, ctx),
  emerald_damselfly: (count, ctx) => dragonflyCardPoints('emerald_damselfly', count, ctx),
  keeled_skimmer: (count, ctx) => dragonflyCardPoints('keeled_skimmer', count, ctx),
  small_red_damselfly: (count, ctx) => dragonflyCardPoints('small_red_damselfly', count, ctx),
  southern_damselfly: (count, ctx) => dragonflyCardPoints('southern_damselfly', count, ctx),

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
  // With Exmoor the base caves are replaced, so count whichever cave is in play
  beaver: (count, ctx) => count * (countCard(ctx, 'cave_d') + countCard(ctx, 'cave_exmoor')),
  blue_ground_beetle: (count, ctx) => count * ctx.slotCounts.bottom,
  blueberry_d: (count, ctx) => {
    const birdKeys = ALL_DARTMOOR_CARDS.filter((c) => c.tags.includes('bird')).map((c) => c.key)
    const uniqueBirdSpecies = birdKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (2 * uniqueBirdSpecies)
  },
  bog_asphodel: (count, ctx) => count * ctx.totalMoors,
  common_lizard: (count, ctx) => {
    const amphibianKeys = ALL_DARTMOOR_CARDS.filter((c) => c.tags.includes('amphibian')).map((c) => c.key)
    const uniqueAmphibianSpecies = amphibianKeys.filter((k) => countCard(ctx, k) > 0).length
    return uniqueAmphibianSpecies >= 3 ? count * 15 : count * 5
  },
  grass_snake: (count) => count * 5,
  greater_butterfly_orchid: (count, ctx) => {
    const plantKeys = ALL_DARTMOOR_CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantSpecies = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return uniquePlantSpecies >= 5 ? count * 15 : count * 3
  },
  heather: (count, ctx) => count * countTag(ctx, 'insect'),
  meadowsweet: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 5,
  moor_frog: (count, ctx) => ctx.totalMoors >= 5 ? count * 8 : 0,
  otter: (count, ctx) => count * (3 * countTag(ctx, 'amphibian')),
  royal_fern: (count, ctx) => {
    const plantKeys = ALL_DARTMOOR_CARDS.filter((c) => c.tags.includes('plant')).map((c) => c.key)
    const uniquePlantSpecies = plantKeys.filter((k) => countCard(ctx, k) > 0).length
    return count * (2 * uniquePlantSpecies)
  },
  warty_newt: (count) => lookupSet(WARTY_NEWT_SET, count),
  water_soldiers: (count, ctx) => count * (2 * countTag(ctx, 'dragonfly')),

  // --- LATERAL SLOT ---
  // Bats — each bat scores 5 pts per copy when 3+ unique species
  alcathoe_bat: (count, ctx) => dartmoorBatCardPoints(count, ctx),
  brandts_bat: (count, ctx) => dartmoorBatCardPoints(count, ctx),
  common_noctule: (count, ctx) => dartmoorBatCardPoints(count, ctx),
  daubentons_bat: (count, ctx) => dartmoorBatCardPoints(count, ctx),
  serotine_bat: (count, ctx) => dartmoorBatCardPoints(count, ctx),

  capercaillie_d: (count, ctx) => count * countTag(ctx, 'plant'),
  // Scores trees AND shrubs — slotCounts.tree includes both
  common_pheasant: (count, ctx) => count * ctx.slotCounts.tree,
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
  lonely_cave_d: (count) => count > 0 ? 5 : 0,

  // ============================================================
  // EXMOOR
  // ============================================================

  // Shrubs — ongoing effects only
  holly: () => 0,
  gorse: () => 0,

  // Moors
  // Coastal Heath doubles the points of hares placed on it (same model as
  // Blanket Bog: score one hosted copy again on top of its normal value)
  coastal_heath: (_count, ctx, metadata) => {
    const hostKeys = metadata?.hostCardKeys ?? []
    let bonus = 0
    for (const hostKey of hostKeys) {
      if (!hostKey || hostKey === 'coastal_heath') continue
      bonus += scoreDartmoorCard(hostKey, 1, ctx, { ...ctx.cardMetadata[hostKey], contextValue: 1 })
    }
    return bonus
  },
  stone_circle: () => 0,
  tarr_steps: () => 0,
  waxcap_grassland: () => 0,

  // Top slot
  dartford_warbler: (count) => count * 1,
  golden_ringed_dragonfly: (count, ctx) => dragonflyCardPoints('golden_ringed_dragonfly', count, ctx),
  grey_wagtail: (count, ctx) => count * countExmoorSymbols(ctx),
  harvest_mouse: (count, ctx) => count * countTag(ctx, 'bird'),
  peregrine_falcon: (count, ctx) => count * countTag(ctx, 'mouse'),
  pied_flycatcher: (count) => count * 4,

  // Bottom slot
  bank_vole: (count) => count * 3,
  natterjack_toad: (count) => count * 1,
  // 1 pt per tree symbol — entered manually, like Rivulet
  smooth_snake: (count, _ctx, metadata) => count * (metadata?.contextValue ?? 0),
  sundew: (count, ctx) => count * countTag(ctx, 'insect'),
  tormentil: (count) => count * 5,
  wood_rush: (count) => count * 3,

  // Lateral slot
  bilberry_bumblebee: (count, ctx) => count * (2 * countTag(ctx, 'shrub')),
  // 15 pts per dormouse that shares a tree with a bat (contextValue)
  dormouse: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 15,
  exmoor_pony_foal: (count) => count * 1,
  horse: (count, ctx) => count * 10 * PONY_KEYS.reduce((sum, k) => sum + countCard(ctx, k), 0),
  red_devon_cow: (count, ctx) => count * countTag(ctx, 'plant'),
  whiskered_bat: (count, ctx) => dartmoorBatCardPoints(count, ctx),

  // Cave — all 5 Exmoor caves score 1 pt per card stored inside
  cave_exmoor: (count) => count * 1,
}

// Rulebook: Dartmoor Pony, the Horse (FR Cheval, "Exmoor Pony") and the Foal are ponies
const PONY_KEYS = ['dartmoor_pony', 'horse', 'exmoor_pony_foal']

/** Cards in the forest showing the Exmoor type symbol (cave contents excluded) */
function countExmoorSymbols(ctx: ForestContext): number {
  return EXMOOR_CARDS
    .filter((c) => c.category !== 'cave')
    .reduce((sum, c) => sum + countCard(ctx, c.key), 0)
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
    dragonfly: 0, mouse: 0, rabbit: 0, hoofed: 0, shrub: 0, tree: 0, moor: 0,
    fish: 0, squirrel: 0,
  }

  const slotCounts: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0,
  }

  const treeSpeciesPresent = new Set<string>()
  let totalCards = 0
  let totalTrees = 0
  let totalMoors = 0

  for (const card of ALL_DARTMOOR_CARDS) {
    const count = cardCounts[card.key] || 0
    if (count === 0) continue

    totalCards += count
    slotCounts[card.category] += count

    // Shrubs share the tree slot but don't show the tree symbol
    if (card.category === 'tree' && !card.tags.includes('shrub')) {
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
    fullyOccupiedTrees: cardMetadata['beech_marten']?.contextValue ?? fullyOccupiedTrees,
    totalCards,
    totalMoors,
    cardMetadata,
  }
}

// ============================================================
// SCORE A SINGLE DARTMOOR CARD
// ============================================================

export function scoreDartmoorCard(
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

    const card = ALL_DARTMOOR_CARDS.find((c) => c.key === cardKey)
    if (!card) continue

    // Skip comparison cards here — they are scored separately below with cross-player data
    if (card.scoringType === 'comparison') continue

    const metadata = cardMetadata[cardKey]
    const points = scoreDartmoorCard(cardKey, count, context, metadata)

    // Include entry even when count is 0 if there are synergy points
    if (count === 0 && points === 0) continue

    entries.push({
      cardKey,
      cardCategory: card.category,
      count,
      points,
    })
    categoryTotals[card.category] += points
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
