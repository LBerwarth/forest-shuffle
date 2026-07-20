import type { ForestContext } from '@/types/scoring'
import type { GameEdition } from '@/types/card'
import { CARDS } from '@/data/cards'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'
import { EXMOOR_CARDS } from '@/data/exmoor-cards'

const ALL_DARTMOOR_CARDS = [...DARTMOOR_CARDS, ...EXMOOR_CARDS]

export interface MultiplierStat {
  /** Key into STAT_ICONS from @/assets/icons */
  iconKey: string
  value: number
}

function countCard(ctx: ForestContext, key: string): number {
  return ctx.cardCounts[key] || 0
}

const BAT_KEYS = [
  'barbastelle', 'bechsteins_bat', 'brown_long_eared_bat',
  'greater_horseshoe_bat', 'savis_pipistrelle', 'common_pipistrelle',
]

const BUTTERFLY_KEYS = [
  'peacock_butterfly', 'purple_emperor', 'silver_washed_fritillary',
  'camberwell_beauty', 'large_tortoiseshell', 'phoebus_apollo',
  'map_butterfly', 'brimstone',
]

const DARTMOOR_BAT_KEYS = [
  'alcathoe_bat', 'brandts_bat', 'common_noctule',
  'daubentons_bat', 'serotine_bat', 'whiskered_bat',
]

const DRAGONFLY_KEYS = [
  'beautiful_demoiselle', 'emerald_damselfly', 'keeled_skimmer',
  'small_red_damselfly', 'southern_damselfly', 'golden_ringed_dragonfly',
]

const PONY_KEYS = ['dartmoor_pony', 'horse', 'exmoor_pony_foal']

function uniqueByTag(cards: typeof CARDS, tag: string, ctx: ForestContext): number {
  return cards.filter((c) => c.tags.includes(tag as never)).filter((c) => countCard(ctx, c.key) > 0).length
}

type StatDef = (ctx: ForestContext) => MultiplierStat[]

// Classic edition multiplier stats
const classicStats: Record<string, StatDef> = {
  // Trees
  sycamore: (ctx) => [{ iconKey: 'tree', value: ctx.totalTrees }],
  stone_pine: (ctx) => [{ iconKey: 'alpine', value: ctx.tagCounts.alpine }],
  palm_tree: (ctx) => [{ iconKey: 'bird', value: ctx.tagCounts.bird }],
  turkey_oak: (ctx) => [{ iconKey: 'cloven_hoofed', value: ctx.tagCounts.cloven_hoofed }],
  beech: (ctx) => [{ iconKey: 'tree', value: ctx.treeSpeciesCount }],
  oak: (ctx) => [{ iconKey: 'tree', value: ctx.treeSpeciesCount }],

  // Top
  bullfinch: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  goshawk: (ctx) => [{ iconKey: 'bird', value: ctx.tagCounts.bird }],
  robin: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  barn_owl: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  mistletoe: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  whinchat: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  golden_eagle: (ctx) => [
    { iconKey: 'pawed', value: ctx.tagCounts.pawed },
    { iconKey: 'amphibian', value: ctx.tagCounts.amphibian },
  ],
  bearded_vulture: (ctx) => [{ iconKey: 'cave', value: countCard(ctx, 'cave') }],

  // Bottom
  hedgehog: (ctx) => [{ iconKey: 'butterfly', value: ctx.tagCounts.butterfly }],
  stinging_nettle: (ctx) => [{ iconKey: 'butterfly', value: ctx.tagCounts.butterfly }],
  honey_bee: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  blackberries: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  stag_beetle: (ctx) => [{ iconKey: 'pawed', value: ctx.tagCounts.pawed }],
  wood_ant: (ctx) => [{ iconKey: 'insect', value: ctx.slotCounts.bottom }],
  tree_frog: (ctx) => [{ iconKey: 'insect', value: countCard(ctx, 'gnat') }],
  tree_ferns: (ctx) => [{ iconKey: 'amphibian', value: ctx.tagCounts.amphibian }],
  alpine_newt: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  gentian: (ctx) => [{ iconKey: 'butterfly', value: ctx.tagCounts.butterfly }],
  great_green_bush_cricket: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  moss: (ctx) => [{ iconKey: 'tree', value: ctx.totalTrees }],
  wild_strawberries: (ctx) => [{ iconKey: 'tree', value: ctx.treeSpeciesCount }],
  blueberry: (ctx) => [{ iconKey: 'bird', value: uniqueByTag(CARDS, 'bird', ctx) }],
  digitalis: (ctx) => [{ iconKey: 'plant', value: uniqueByTag(CARDS, 'plant', ctx) }],

  // Lateral
  wolf: (ctx) => [{ iconKey: 'deer', value: ctx.tagCounts.deer }],
  fallow_deer: (ctx) => [{ iconKey: 'cloven_hoofed', value: ctx.tagCounts.cloven_hoofed }],
  european_wildcat: (ctx) => [{ iconKey: 'woodland_edge', value: ctx.tagCounts.woodland_edge }],
  sable: (ctx) => [{ iconKey: 'pawed', value: ctx.tagCounts.pawed }],
  gnat: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  crane_fly: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  bee_swarm: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  capercaillie: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  fox: (ctx) => [{ iconKey: 'hare', value: countCard(ctx, 'european_hare') + countCard(ctx, 'mountain_hare') }],
  european_hare: (ctx) => [{ iconKey: 'hare', value: countCard(ctx, 'european_hare') + countCard(ctx, 'mountain_hare') }],
  mountain_hare: (ctx) => [{ iconKey: 'hare', value: countCard(ctx, 'european_hare') + countCard(ctx, 'mountain_hare') }],
  lynx: (ctx) => [{ iconKey: 'deer', value: countCard(ctx, 'roe_deer') }],
  wild_boar: (ctx) => [{ iconKey: 'cloven_hoofed', value: countCard(ctx, 'wild_boar_piglet') }],
  wild_boar_female: (ctx) => [{ iconKey: 'cloven_hoofed', value: countCard(ctx, 'wild_boar_piglet') }],
  beech_marten: (ctx) => [{ iconKey: 'tree', value: ctx.fullyOccupiedTrees }],
  red_deer: (ctx) => [
    { iconKey: 'tree', value: ctx.totalTrees },
    { iconKey: 'plant', value: ctx.tagCounts.plant },
  ],
  troll: (ctx) => [{ iconKey: 'tree', value: ctx.totalTrees }],
  white_stork: (ctx) => [
    { iconKey: 'insect', value: ctx.tagCounts.insect },
    { iconKey: 'amphibian', value: ctx.tagCounts.amphibian },
  ],
  alpine_marmot: (ctx) => [{ iconKey: 'plant', value: uniqueByTag(CARDS, 'plant', ctx) }],
  bat_cave: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],

  // Bat set cards — show unique species count
  ...Object.fromEntries(BAT_KEYS.map((k) => [k, (ctx: ForestContext) => [
    { iconKey: 'bat', value: BAT_KEYS.filter((bk) => countCard(ctx, bk) > 0).length },
  ]])),

  // Butterfly set cards — show unique species count
  ...Object.fromEntries(BUTTERFLY_KEYS.map((k) => [k, (ctx: ForestContext) => [
    { iconKey: 'butterfly', value: BUTTERFLY_KEYS.filter((bk) => countCard(ctx, bk) > 0).length },
  ]])),
}

// Dartmoor edition multiplier stats
const dartmoorStats: Record<string, StatDef> = {
  // Trees
  sessile_oak: (ctx) => [{ iconKey: 'tree', value: ctx.totalTrees }],
  goat_willow: (ctx) => [{ iconKey: 'moor', value: ctx.totalMoors }],
  ash: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],

  // Moor
  lowland_heath: (ctx) => [{ iconKey: 'amphibian', value: ctx.tagCounts.amphibian }],
  rhos_pasture: (ctx) => [{ iconKey: 'cloven_hoofed', value: ctx.tagCounts.hoofed }],
  valley_mire: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  warrens: (ctx) => [{ iconKey: 'pawed', value: ctx.tagCounts.pawed }],
  wet_woodland: (ctx) => [{ iconKey: 'moor', value: ctx.totalMoors }],

  // Top
  barn_owl_d: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  buzzard: (ctx) => [{ iconKey: 'mouse', value: ctx.tagCounts.mouse }],
  common_moorhen: (ctx) => [{ iconKey: 'dragonfly', value: ctx.tagCounts.dragonfly }],
  curlew: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  meadow_pipit: (ctx) => [{ iconKey: 'bird', value: uniqueByTag(ALL_DARTMOOR_CARDS, 'bird', ctx) }],

  // Bottom
  adder: (ctx) => [
    { iconKey: 'amphibian', value: ctx.tagCounts.amphibian },
    { iconKey: 'mouse', value: ctx.tagCounts.mouse },
  ],
  beaver: (ctx) => [{ iconKey: 'cave', value: countCard(ctx, 'cave_d') + countCard(ctx, 'cave_exmoor') }],
  blue_ground_beetle: (ctx) => [{ iconKey: 'insect', value: ctx.slotCounts.bottom }],
  blueberry_d: (ctx) => [{ iconKey: 'bird', value: uniqueByTag(ALL_DARTMOOR_CARDS, 'bird', ctx) }],
  bog_asphodel: (ctx) => [{ iconKey: 'moor', value: ctx.totalMoors }],
  common_lizard: (ctx) => [{ iconKey: 'amphibian', value: uniqueByTag(ALL_DARTMOOR_CARDS, 'amphibian', ctx) }],
  greater_butterfly_orchid: (ctx) => [{ iconKey: 'plant', value: uniqueByTag(ALL_DARTMOOR_CARDS, 'plant', ctx) }],
  heather: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  moor_frog: (ctx) => [{ iconKey: 'moor', value: ctx.totalMoors }],
  otter: (ctx) => [{ iconKey: 'amphibian', value: ctx.tagCounts.amphibian }],
  royal_fern: (ctx) => [{ iconKey: 'plant', value: uniqueByTag(ALL_DARTMOOR_CARDS, 'plant', ctx) }],
  water_soldiers: (ctx) => [{ iconKey: 'dragonfly', value: ctx.tagCounts.dragonfly }],

  // Lateral
  capercaillie_d: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],
  common_pheasant: (ctx) => [{ iconKey: 'tree', value: ctx.totalTrees }],
  dartmoor_badger: (ctx) => [{ iconKey: 'pawed', value: ctx.tagCounts.pawed }],
  dartmoor_sheep: (ctx) => [{ iconKey: 'cloven_hoofed', value: ctx.tagCounts.hoofed }],
  field_vole: (ctx) => [{ iconKey: 'mouse', value: ctx.tagCounts.mouse }],
  wood_mouse: (ctx) => [{ iconKey: 'mouse', value: ctx.tagCounts.mouse }],
  gnat_d: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  lake_fly: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],

  // Exmoor
  coastal_heath: (ctx) => [{ iconKey: 'bird', value: ctx.tagCounts.bird }],
  grey_wagtail: (ctx) => [{
    iconKey: 'exmoor',
    value: EXMOOR_CARDS.filter((c) => c.category !== 'cave')
      .reduce((sum, c) => sum + countCard(ctx, c.key), 0),
  }],
  harvest_mouse: (ctx) => [{ iconKey: 'bird', value: ctx.tagCounts.bird }],
  peregrine_falcon: (ctx) => [{ iconKey: 'mouse', value: ctx.tagCounts.mouse }],
  sundew: (ctx) => [{ iconKey: 'insect', value: ctx.tagCounts.insect }],
  bilberry_bumblebee: (ctx) => [{ iconKey: 'shrub', value: ctx.tagCounts.shrub }],
  dormouse: (ctx) => [{ iconKey: 'bat', value: ctx.tagCounts.bat }],
  horse: (ctx) => [{ iconKey: 'cloven_hoofed', value: PONY_KEYS.reduce((sum, k) => sum + countCard(ctx, k), 0) }],
  red_devon_cow: (ctx) => [{ iconKey: 'plant', value: ctx.tagCounts.plant }],

  // Bat set cards
  ...Object.fromEntries(DARTMOOR_BAT_KEYS.map((k) => [k, (ctx: ForestContext) => [
    { iconKey: 'bat', value: DARTMOOR_BAT_KEYS.filter((bk) => countCard(ctx, bk) > 0).length },
  ]])),

  // Dragonfly set cards
  ...Object.fromEntries(DRAGONFLY_KEYS.map((k) => [k, (ctx: ForestContext) => [
    { iconKey: 'dragonfly', value: DRAGONFLY_KEYS.filter((dk) => countCard(ctx, dk) > 0).length },
  ]])),
}

export function getMultiplierStats(
  cardKey: string,
  ctx: ForestContext,
  edition: GameEdition,
): MultiplierStat[] {
  const map = edition === 'dartmoor' ? dartmoorStats : classicStats
  const fn = map[cardKey]
  if (!fn) return []
  return fn(ctx)
}

// Synthetic context — values don't matter, we just need the iconKeys back.
const EMPTY_CTX: ForestContext = {
  totalTrees: 0,
  treeSpeciesCount: 0,
  treeSpeciesPresent: new Set(),
  tagCounts: {
    bird: 0, butterfly: 0, insect: 0, amphibian: 0, pawed: 0, deer: 0,
    bat: 0, plant: 0, mushroom: 0, alpine: 0, cloven_hoofed: 0,
    woodland_edge: 0, dragonfly: 0, mouse: 0, rabbit: 0, hoofed: 0,
    shrub: 0, tree: 0, moor: 0,
  },
  cardCounts: {},
  slotCounts: { tree: 0, top: 0, bottom: 0, lateral: 0, moor: 0, cave: 0 },
  fullyOccupiedTrees: 0,
  totalCards: 0,
  totalMoors: 0,
  cardMetadata: {},
}

export function getMultiplierIconKeys(
  cardKey: string,
  edition: GameEdition,
): string[] {
  const map = edition === 'dartmoor' ? dartmoorStats : classicStats
  const fn = map[cardKey]
  if (!fn) return []
  try {
    return fn(EMPTY_CTX).map((s) => s.iconKey)
  } catch {
    return []
  }
}
