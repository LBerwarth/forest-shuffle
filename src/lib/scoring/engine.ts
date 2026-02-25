import type { ForestContext, ScoringFunction, CardMetadata, ScoreBreakdown, ScoreEntry } from '@/types/scoring'
import type { CardCategory, CardTag } from '@/types/card'
import { CARDS } from '@/data/cards'

// ============================================================
// SET SCORING TABLES
// ============================================================

/** Horse Chestnut: 1/4/9/16/25/36/49 (perfect squares) */
const CHESTNUT_SET = [0, 1, 4, 9, 16, 25, 36, 49]

/** Butterflies (different species): 0/3/6/12/20/30/42/56 */
const BUTTERFLY_SET = [0, 0, 3, 6, 12, 20, 30, 42, 56]

/** Bats (different species): 0/5/10/15/20/25 */
const BAT_SET = [0, 0, 5, 10, 15, 20, 25]

/** Deer (different species): 0/3/8/15 */
const DEER_SET = [0, 0, 3, 8, 15]

/** Wood Strawberry: 3/6/10/15/21/28 */
const STRAWBERRY_SET = [0, 3, 6, 10, 15, 21, 28]

/** Alpine Marmot: 0/5/10/20 */
const MARMOT_SET = [0, 0, 5, 10, 20]

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

// ============================================================
// INDIVIDUAL CARD SCORING FUNCTIONS
// ============================================================

const scoringFunctions: Record<string, ScoringFunction> = {
  // --- TREES ---
  birch: (count) => count * 1,
  beech: (count) => count * 5, // each Beech is worth 5 if you have 4+; handled at threshold
  spruce: (count, ctx) => count * (ctx.treeSpeciesCount * 2),
  douglas_fir: (count) => count * 5,
  oak: (count, ctx) => {
    // Each Oak with all 4 slots occupied = 10 points
    // In simplified scoring, user enters how many are fully occupied
    return count * 0 + ctx.fullyOccupiedTrees * 0 // Will be handled via metadata
  },
  horse_chestnut: (count) => lookupSet(CHESTNUT_SET, count),
  linden: () => 0, // comparison card - handled separately
  sycamore: (count, ctx) => count * ctx.totalCards,

  // Silver Fir: 2 points per card attached to Silver Firs
  silver_fir: (_count, _ctx, metadata) => {
    return (metadata?.contextValue ?? 0) * 2
  },

  // Alpine trees
  european_larch: (count, ctx) => count * (countTag(ctx, 'alpine') * 2),
  stone_pine: (_count, _ctx, metadata) => {
    return metadata?.contextValue ?? 0 // points = number of cards attached
  },

  // --- TOP SLOT ---
  bullfinch: (count, ctx) => count * (countTag(ctx, 'insect') * 2),
  chaffinch: (_count, _ctx, metadata) => {
    // 5 points per Chaffinch that is on a Beech
    return (metadata?.contextValue ?? 0) * 5
  },
  great_spotted_woodpecker: () => 0, // comparison card
  goshawk: (count, ctx) => count * (countTag(ctx, 'bird') * 3),
  jay: (count, ctx) => count * ctx.treeSpeciesCount,
  great_tit: (count, ctx) => count * (countTag(ctx, 'mushroom') * 2),
  robin: (count, ctx) => count * (countTag(ctx, 'plant') * 2),
  owl: (count, ctx) => count * (countTag(ctx, 'bat') * 3),
  tree_frog_top: (count, ctx) => count * ctx.treeSpeciesCount,

  // Butterflies - each counts as 1 unique species for set scoring
  peacock_butterfly: () => 0, // scored via butterfly set
  purple_emperor: () => 0,
  silver_washed_fritillary: () => 0,
  swallowtail: () => 0,
  camberwell_beauty: () => 0,
  phoebus_apollo: () => 0, // alpine butterfly

  red_squirrel: (_count, _ctx, metadata) => {
    return (metadata?.contextValue ?? 0) * 5
  },

  // Alpine top
  golden_eagle: (count, ctx) => count * (countTag(ctx, 'alpine') * 3),
  bearded_vulture: (count, ctx) => count * (countTag(ctx, 'pawed') * 3),
  common_raven: (count) => count * 2,

  // --- BOTTOM SLOT ---
  fire_salamander: (count, ctx) => count * countTag(ctx, 'amphibian'),
  tree_frog_bottom: (count, ctx) => count * ctx.treeSpeciesCount,
  stag_beetle: (count, ctx) => count * ctx.totalTrees,
  wood_ant: (count) => Math.floor(count / 2) * 5 + (count % 2 === 0 ? 0 : (count >= 1 ? 2 : 0)),
  penny_bun: (count) => Math.floor(count / 2) * 5 + (count % 2 === 0 ? 0 : 2),
  chanterelle: (count) => Math.floor(count / 2) * 5 + (count % 2 === 0 ? 0 : 2),
  fly_agaric: (count) => Math.floor(count / 2) * 5 + (count % 2 === 0 ? 0 : 2),
  parasol_mushroom: (count) => Math.floor(count / 2) * 5 + (count % 2 === 0 ? 0 : 2),
  moss: (count, ctx) => ctx.totalTrees >= 10 ? count * 10 : 0,
  fern: (count, ctx) => count * (countTag(ctx, 'plant') + countTag(ctx, 'mushroom')),
  wood_strawberry: (count) => lookupSet(STRAWBERRY_SET, count),
  hedgehog: (count) => Math.floor(count / 2) * 3,
  european_hare_bottom: () => 0,

  // Alpine bottom
  alpine_newt: (count, ctx) => count * (countTag(ctx, 'amphibian') * 2),
  blueberry: (count, ctx) => count * countTag(ctx, 'bird'),
  gentian: (count, ctx) => count * (countTag(ctx, 'butterfly') * 2),
  edelweiss: (count, ctx) => countTag(ctx, 'alpine') >= 3 ? count * 10 : 0,

  // --- LEFT SLOT ---
  // Bats - scored via bat set
  barbastelle: () => 0,
  bechsteins_bat: () => 0,
  brown_long_eared_bat: () => 0,
  greater_horseshoe_bat: () => 0,
  savis_pipistrelle: () => 0,

  // Deer - scored via deer set
  roe_deer: () => 0,
  red_deer: () => 0,
  chamois: () => 0,
  steinbock: () => 0,

  lynx: (count, ctx) => count * (countTag(ctx, 'deer') * 5),
  wolf: (count, ctx) => {
    const pawedExcludingWolves = countTag(ctx, 'pawed') - countCard(ctx, 'wolf')
    return count * (pawedExcludingWolves * 5)
  },
  wild_boar: () => 0,
  badger: (count, ctx) => count * (Math.floor(countTag(ctx, 'mushroom') / 2) * 3),
  european_hare_left: () => 0,

  // --- RIGHT SLOT ---
  brown_bear: (count, ctx) => {
    // 2 per bee (insect) + 2 per fish (amphibian) - simplified to per insect + amphibian
    return count * ((countTag(ctx, 'insect') + countTag(ctx, 'amphibian')) * 2)
  },
  fox: () => 0,
  red_squirrel_right: (_count, _ctx, metadata) => {
    return (metadata?.contextValue ?? 0) * 5
  },
  violet_carpenter_bee: (count, ctx) => count * (countTag(ctx, 'plant') + countTag(ctx, 'mushroom')),
  pond_turtle: (count, ctx) => count * (Math.floor(countTag(ctx, 'amphibian') / 2) * 5),
  tree_frog_right: (count, ctx) => count * ctx.treeSpeciesCount,
  wild_strawberry_right: (count, ctx) => count * (countTag(ctx, 'plant') + countTag(ctx, 'mushroom')),
  deer_fern: (count, ctx) => count * countTag(ctx, 'deer'),
  alpine_marmot: () => 0, // scored via marmot set
  mountain_hare: () => 0,
  capercaillie: (count, ctx) => count * countTag(ctx, 'plant'),

  // --- CAVE ---
  cave: (count) => count,
}

// ============================================================
// OAK SCORING (special: points per fully occupied tree)
// ============================================================

export function scoreOak(oakCount: number, fullyOccupiedOaks: number): number {
  // Oaks don't score for existing, only for being fully occupied
  void oakCount
  return fullyOccupiedOaks * 10
}

// ============================================================
// BEECH THRESHOLD SCORING
// ============================================================

export function scoreBeech(beechCount: number): number {
  return beechCount >= 4 ? beechCount * 5 : 0
}

// ============================================================
// SET SCORING (butterflies, bats, deer)
// ============================================================

export function scoreButterflySet(ctx: ForestContext): number {
  const butterflyKeys = [
    'peacock_butterfly', 'purple_emperor', 'silver_washed_fritillary',
    'swallowtail', 'camberwell_beauty', 'phoebus_apollo',
  ]
  const uniqueSpecies = butterflyKeys.filter((k) => countCard(ctx, k) > 0).length
  // Total points = set value for unique species count
  // Then add extra for duplicates (each extra = same as having that species once more)
  // Actually in Forest Shuffle, butterflies score for number of DIFFERENT species
  return lookupSet(BUTTERFLY_SET, uniqueSpecies)
}

export function scoreBatSet(ctx: ForestContext): number {
  const batKeys = ['barbastelle', 'bechsteins_bat', 'brown_long_eared_bat', 'greater_horseshoe_bat', 'savis_pipistrelle']
  const uniqueSpecies = batKeys.filter((k) => countCard(ctx, k) > 0).length
  return lookupSet(BAT_SET, uniqueSpecies)
}

export function scoreDeerSet(ctx: ForestContext): number {
  const deerKeys = ['roe_deer', 'red_deer', 'chamois', 'steinbock']
  const uniqueSpecies = deerKeys.filter((k) => countCard(ctx, k) > 0).length
  return lookupSet(DEER_SET, uniqueSpecies)
}

export function scoreMarmotSet(ctx: ForestContext): number {
  const count = countCard(ctx, 'alpine_marmot')
  return lookupSet(MARMOT_SET, count)
}

// ============================================================
// COMPARISON CARDS (cross-player)
// ============================================================

export function scoreLinden(
  playerLindenCount: number,
  allPlayerLindenCounts: number[],
): number {
  const maxLindens = Math.max(...allPlayerLindenCounts)
  if (playerLindenCount === maxLindens && playerLindenCount > 0) {
    return playerLindenCount * 3
  }
  return 0
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
    pawed: 0, deer: 0, bat: 0, plant: 0, mushroom: 0, alpine: 0,
  }

  const slotCounts: Record<CardCategory, number> = {
    tree: 0, top: 0, bottom: 0, left: 0, right: 0, cave: 0,
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
  // Special handling for Beech threshold
  if (cardKey === 'beech') return scoreBeech(count)

  // Special handling for Oak
  if (cardKey === 'oak') return scoreOak(count, metadata?.contextValue ?? 0)

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
    tree: 0, top: 0, bottom: 0, left: 0, right: 0, cave: 0,
  }

  for (const cardKey of activeCards) {
    const count = cardCounts[cardKey] || 0
    if (count === 0) continue

    const card = CARDS.find((c) => c.key === cardKey)
    if (!card) continue

    const metadata = cardMetadata[cardKey]
    let points = scoreCard(cardKey, count, context, metadata)

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
    entries.push({ cardKey: '_bat_set', cardCategory: 'left', count: 1, points: batPoints })
    categoryTotals.left += batPoints
  }

  const deerPoints = scoreDeerSet(context)
  if (deerPoints > 0) {
    entries.push({ cardKey: '_deer_set', cardCategory: 'left', count: 1, points: deerPoints })
    categoryTotals.left += deerPoints
  }

  const marmotPoints = scoreMarmotSet(context)
  if (marmotPoints > 0) {
    entries.push({ cardKey: '_marmot_set', cardCategory: 'right', count: 1, points: marmotPoints })
    categoryTotals.right += marmotPoints
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
