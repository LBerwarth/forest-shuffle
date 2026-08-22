import type { ForestContext, ScoringFunction, CardMetadata, ScoreBreakdown, ScoreEntry } from '@/types/scoring'
import type { CardCategory, CardTag } from '@/types/card'
import { SMOKY_CARDS } from '@/data/smoky-cards'
import type { SetSeries } from './dartmoor-engine'

// ============================================================
// SQUIRREL SET — 5/10/20/40 for 1-4 different species
// ============================================================

const SQUIRREL_SET = [0, 5, 10, 20, 40]

const SQUIRREL_KEYS = ['red_squirrel_s', 'gray_squirrel', 'flying_squirrel', 'eastern_chipmunk']

function lookupSet(table: number[], count: number): number {
  if (count < 0) return 0
  if (count >= table.length) return table[table.length - 1]!
  return table[count]!
}

function countTag(ctx: ForestContext, tag: CardTag): number {
  return ctx.tagCounts[tag] || 0
}

function countCard(ctx: ForestContext, key: string): number {
  return ctx.cardCounts[key] || 0
}

function uniqueSpeciesWithTag(ctx: ForestContext, tag: CardTag): number {
  return SMOKY_CARDS.filter((c) => c.tags.includes(tag) && countCard(ctx, c.key) > 0).length
}

export function scoreSquirrelSet(ctx: ForestContext): number {
  const counts = SQUIRREL_KEYS.map((k) => countCard(ctx, k))
  let total = 0
  const maxCount = Math.max(0, ...counts)
  for (let i = 1; i <= maxCount; i++) {
    const setSize = counts.filter((c) => c >= i).length
    total += lookupSet(SQUIRREL_SET, setSize)
  }
  return total
}

export function getSquirrelSeriesBreakdown(ctx: ForestContext): SetSeries[] {
  const counts = SQUIRREL_KEYS.map((k) => countCard(ctx, k))
  const maxCount = Math.max(0, ...counts)
  const series: SetSeries[] = []
  for (let i = 1; i <= maxCount; i++) {
    const setSize = counts.filter((c) => c >= i).length
    series.push({ index: i, setSize, points: lookupSet(SQUIRREL_SET, setSize) })
  }
  return series
}

// Distribute set points across squirrel cards with largest-remainder rounding
// so the per-card values sum exactly to scoreSquirrelSet(ctx).
function distributeSquirrelPoints(ctx: ForestContext): Record<string, number> {
  const counts = SQUIRREL_KEYS.map((k) => countCard(ctx, k))
  const totalSquirrels = counts.reduce((a, b) => a + b, 0)
  const total = scoreSquirrelSet(ctx)
  const result: Record<string, number> = Object.fromEntries(SQUIRREL_KEYS.map((k) => [k, 0]))
  if (totalSquirrels === 0 || total === 0) return result

  const exact = counts.map((c) => (c / totalSquirrels) * total)
  const floors = exact.map((v) => Math.floor(v))
  let leftover = total - floors.reduce((a, b) => a + b, 0)
  const remainders = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || counts[b.i]! - counts[a.i]!)

  for (let r = 0; r < remainders.length && leftover > 0; r++) {
    floors[remainders[r]!.i]! += 1
    leftover -= 1
  }

  SQUIRREL_KEYS.forEach((k, i) => { result[k] = floors[i]! })
  return result
}

function squirrelCardPoints(key: string, count: number, ctx: ForestContext): number {
  if (count === 0) return 0
  return distributeSquirrelPoints(ctx)[key] ?? 0
}

// ============================================================
// INDIVIDUAL CARD SCORING FUNCTIONS
// ctx.totalMoors carries the river count (rivers use the moor category)
// ============================================================

const scoringFunctions: Record<string, ScoringFunction> = {
  // --- TREES ---
  basswood: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 2,
  black_gum: (count, ctx) => count * ctx.totalMoors,
  buckeye: (count, _ctx, metadata) => count * (metadata?.contextValue ?? 0),
  fraser_fir: (count, ctx) => count * ctx.totalTrees,
  hemlock: (count) => count * 5,
  hickory: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 2,
  silver_maple: (count) => (count >= 3 ? count * 5 : 0),
  yellow_birch: (count) => count * 1,

  // --- RIVERS ---
  creek: (count, ctx) => count * countTag(ctx, 'fish'),
  river_bend: () => 0,
  waterfall: () => 0,
  universal_river: () => 0, // 0 points but counts as a river

  // --- TOP SLOT ---
  bald_eagle: (count, ctx) => count * (countTag(ctx, 'fish') >= 5 ? 30 : 10),
  caddisfly: (count) => count * 2,
  flying_squirrel: (count, ctx) => squirrelCardPoints('flying_squirrel', count, ctx),
  great_blue_heron: (count, ctx) => count * (2 * countTag(ctx, 'fish')),
  long_eared_owl: (count, ctx) => count * (2 * countTag(ctx, 'mouse')),
  peregrine_falcon_s: (count, ctx) => count * countTag(ctx, 'bird'),
  rockcap_fern: (count, ctx) => count * countTag(ctx, 'plant'),
  ruby_throated_hummingbird: (count, ctx) => count * (countTag(ctx, 'plant') + ctx.totalTrees),
  scarlet_tanager: (count) => count * 2,
  thermometer_cricket: (count, ctx) => count * countTag(ctx, 'insect'),
  tufted_titmouse: () => 0,
  virginia_opossum: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 2,
  water_starwort: (count, ctx) => count * (ctx.totalMoors + countTag(ctx, 'fish')),
  wood_thrush: () => 0,

  // --- BOTTOM SLOT ---
  blue_mistflower: (count) => count * 2,
  brook_trout: (count, _ctx, metadata) => count * (3 * (metadata?.contextValue ?? 0)),
  brown_water_scorpion: (count) => count * 2,
  common_box_turtle: (count) => count * 5,
  eastern_chipmunk: (count, ctx) => squirrelCardPoints('eastern_chipmunk', count, ctx),
  eastern_hellbender: (count, ctx) => count * (2 * ctx.totalMoors),
  greenside_darter: (count, ctx) => count * (3 * countTag(ctx, 'insect')),
  imitator_salamander: (count, ctx) =>
    uniqueSpeciesWithTag(ctx, 'amphibian') >= 3 ? count * 10 : 0,
  largeleaf_pondweed: (count) => count * 2,
  skipper_caterpillar: (count, ctx) =>
    uniqueSpeciesWithTag(ctx, 'insect') >= 3 ? count * 10 : 0,
  smallmouth_bass: (count, ctx) => count * (3 * uniqueSpeciesWithTag(ctx, 'fish')),
  solomons_seal: (count, ctx) => count * (6 * countTag(ctx, 'amphibian')),
  wintergreen: (count, ctx) => count * (3 * countTag(ctx, 'squirrel')),
  wood_frog: (count, ctx) => count * ctx.totalTrees,
  yellow_bullhead: () => 0,
  yellow_perch: (count) => count * 2,

  // --- LATERAL SLOT ---
  beaver_s: (count, ctx) => count * countCard(ctx, 'cave_s'),
  // contextValue = bears with 2+ fish at their tree
  black_bear: (count, _ctx, metadata) => {
    const withFish = Math.min(metadata?.contextValue ?? 0, count)
    return withFish * 30 + (count - withFish) * 10
  },
  bobcat: (count, ctx) => count * (countTag(ctx, 'bird') >= 5 ? 30 : 10),
  chestnut_sided_warbler: (count) => count * 5,
  coyote: (count, ctx) => count * (countTag(ctx, 'pawed') >= 6 ? 30 : 10),
  elk_s: (count, ctx) => count * (ctx.treeSpeciesCount >= 5 ? 30 : 10),
  gray_fox: (count, ctx) => count * countTag(ctx, 'pawed'),
  gray_squirrel: (count, ctx) => squirrelCardPoints('gray_squirrel', count, ctx),
  long_tailed_weasel: (count, ctx) => (countTag(ctx, 'mouse') >= 3 ? count * 10 : 0),
  masked_shrew: (count) => count * 3,
  mink: (count) => count * 5,
  pileated_woodpecker: (count, ctx) => count * countTag(ctx, 'bird'),
  raccoon_s: () => 0,
  red_squirrel_s: (count, ctx) => squirrelCardPoints('red_squirrel_s', count, ctx),
  river_otter: (count, ctx) =>
    count * (2 * (countTag(ctx, 'fish') + countTag(ctx, 'insect') + countTag(ctx, 'amphibian'))),
  rock_vole: (count, ctx) => count * (countTag(ctx, 'mouse') + countTag(ctx, 'insect')),
  short_tailed_shrew: (count) => count * 5,
  spotted_skunk: (count, _ctx, metadata) => Math.min(metadata?.contextValue ?? 0, count) * 10,
  synchronous_firefly: (count) => 3 * count * count,
  turkey: (_count, _ctx, metadata) => (metadata?.contextValue ?? 0) * 2,
  virgins_bower: (count, ctx) => count * (2 * countTag(ctx, 'bird')),
  weevil_wasp: (count, _ctx, metadata) => Math.min(metadata?.contextValue ?? 0, count) * 10,
  white_footed_mouse: (count, ctx) => count * countTag(ctx, 'mouse'),
  white_tailed_deer: (count, ctx) => count * (2 * ctx.totalTrees),
  yellow_bellied_sapsucker: (count) => count * 2,

  // --- CAVE ---
  cave_s: (count) => count * 1,
}

// ============================================================
// BUILD SMOKY FOREST CONTEXT
// ============================================================

export function buildSmokyForestContext(
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

  for (const card of SMOKY_CARDS) {
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
// SCORE A SINGLE SMOKY CARD
// ============================================================

export function scoreSmokyCard(
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
// COMPUTE FULL SMOKY SCORE BREAKDOWN
// ============================================================

export function computeSmokyScoreBreakdown(
  cardCounts: Record<string, number>,
  cardMetadata: Record<string, CardMetadata>,
  fullyOccupiedTrees: number,
  activeCards: string[],
): ScoreBreakdown {
  const context = buildSmokyForestContext(cardCounts, cardMetadata, fullyOccupiedTrees)

  const entries: ScoreEntry[] = []
  const categoryTotals: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0,
  }

  for (const cardKey of activeCards) {
    const count = cardCounts[cardKey] || 0

    const card = SMOKY_CARDS.find((c) => c.key === cardKey)
    if (!card) continue

    const metadata = cardMetadata[cardKey]
    const points = scoreSmokyCard(cardKey, count, context, metadata)

    if (count === 0 && points === 0) continue

    entries.push({
      cardKey,
      cardCategory: card.category,
      count,
      points,
    })
    categoryTotals[card.category] += points
  }

  const total = Object.values(categoryTotals).reduce((sum, v) => sum + v, 0)

  return { entries, categoryTotals, total }
}
