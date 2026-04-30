import { STAT_ICONS } from '@/assets/icons'

/**
 * Maps each card key to an SVG icon key from STAT_ICONS.
 * Uses the card's primary visual category for icon selection.
 */
const CARD_ICON_KEYS: Record<string, string> = {
  // Trees
  birch: 'tree', beech: 'tree', douglas_fir: 'tree', oak: 'tree',
  horse_chestnut: 'tree', linden: 'tree', sycamore: 'tree', silver_fir: 'tree',
  european_larch: 'tree', stone_pine: 'tree', palm_tree: 'tree', turkey_oak: 'tree',
  o_christmas_tree: 'tree', tree_sapling: 'tree',
  // Shrubs
  common_hazel: 'shrub', elderberry: 'shrub', blackthorn: 'shrub',

  // Birds
  bullfinch: 'bird', chaffinch: 'bird', great_spotted_woodpecker: 'bird',
  goshawk: 'bird', eurasian_jay: 'bird', tawny_owl: 'bird',
  golden_eagle: 'bird', bearded_vulture: 'bird', common_raven: 'bird',
  capercaillie: 'bird', barn_owl: 'bird', cardinal: 'bird', cuckoo: 'bird',
  eurasian_magpie: 'bird', nightingale: 'bird', robin: 'bird', whinchat: 'bird',
  white_stork: 'bird',

  // Butterflies
  peacock_butterfly: 'butterfly', purple_emperor: 'butterfly',
  silver_washed_fritillary: 'butterfly', camberwell_beauty: 'butterfly',
  large_tortoiseshell: 'butterfly', phoebus_apollo: 'butterfly',
  brimstone: 'butterfly', map_butterfly: 'butterfly',

  // Amphibians
  tree_frog: 'amphibian', common_toad: 'amphibian', fire_salamander: 'amphibian',
  alpine_newt: 'amphibian', pond_turtle: 'amphibian', water_vole: 'amphibian',

  // Squirrel / Pawed
  red_squirrel: 'pawed',

  // Insects
  stag_beetle: 'insect', wood_ant: 'insect', violet_carpenter_bee: 'insect',
  fireflies: 'insect', gnat: 'gnat', great_green_bush_cricket: 'insect',
  honey_bee: 'insect', bee_swarm: 'insect', crane_fly: 'insect',

  // Mushrooms — use plant icon
  penny_bun: 'plant', chanterelle: 'plant', fly_agaric: 'plant',
  parasol_mushroom: 'plant', black_trumpet: 'plant',

  // Plants
  moss: 'plant', wild_strawberries: 'plant', blackberries: 'plant',
  tree_ferns: 'plant', blueberry: 'plant', gentian: 'plant', edelweiss: 'plant',
  mistletoe: 'plant', digitalis: 'plant', marsh_cinquefoil: 'plant',
  stinging_nettle: 'plant', wild_tulip: 'plant',

  // Pawed animals
  hedgehog: 'pawed', european_hare: 'pawed', mountain_hare: 'pawed',
  lynx: 'pawed', wolf: 'pawed', wild_boar: 'cloven_hoofed',
  european_badger: 'pawed', fox: 'pawed', brown_bear: 'pawed',
  european_fat_dormouse: 'pawed', squeaker: 'pawed', alpine_marmot: 'pawed',
  beech_marten: 'pawed', raccoon: 'pawed', european_polecat: 'pawed',
  european_wildcat: 'pawed', genet: 'pawed', red_panda: 'pawed', sable: 'pawed',
  mole: 'pawed',

  // Deer / Cloven-hoofed — all use cloven_hoofed icon (the game symbol)
  roe_deer: 'cloven_hoofed', red_deer: 'cloven_hoofed', chamois: 'cloven_hoofed',
  steinbock: 'cloven_hoofed', fallow_deer: 'cloven_hoofed', wild_boar_piglet: 'cloven_hoofed',
  wild_boar_female: 'cloven_hoofed', elk: 'cloven_hoofed', european_bison: 'cloven_hoofed',

  // Bats
  barbastelle: 'bat', bechsteins_bat: 'bat', brown_long_eared_bat: 'bat',
  greater_horseshoe_bat: 'bat', savis_pipistrelle: 'bat', common_pipistrelle: 'bat',

  // Other
  troll: 'pawed',

  // Cave
  cave: 'cave', collectors_cave: 'cave', bat_cave: 'bat', lonely_cave: 'cave',

  // ============================================================
  // DARTMOOR EDITION
  // ============================================================

  // Trees
  ash: 'tree', black_alder: 'tree', crab_apple: 'tree', goat_willow: 'tree',
  moor_birch: 'tree', sessile_oak: 'tree',
  // Shrubs
  common_hazel_d: 'shrub', elderberry_d: 'shrub',

  // Moors
  blanket_bog: 'moor', fountainhead: 'moor', lowland_heath: 'moor',
  rhos_pasture: 'moor', rivulet: 'moor', tor: 'moor', valley_mire: 'moor',
  warrens: 'moor', wet_woodland: 'moor', universal_moor: 'moor',

  // Birds
  barn_owl_d: 'bird', black_tailed_godwit: 'bird', buzzard: 'bird',
  common_moorhen: 'bird', cuckoo_d: 'bird', curlew: 'bird', grey_heron: 'bird',
  meadow_pipit: 'bird', wheatear: 'bird', capercaillie_d: 'bird',
  common_pheasant: 'bird', nuthatch: 'bird', treecreeper: 'bird',

  // Dragonflies
  beautiful_demoiselle: 'dragonfly', emerald_damselfly: 'dragonfly',
  keeled_skimmer: 'dragonfly', small_red_damselfly: 'dragonfly',
  southern_damselfly: 'dragonfly',

  // Amphibians / Reptiles
  adder: 'amphibian', common_lizard: 'amphibian', grass_snake: 'amphibian',
  moor_frog: 'amphibian', warty_newt: 'amphibian',

  // Plants
  adders_tongue: 'plant', bog_asphodel: 'plant', blueberry_d: 'plant',
  greater_butterfly_orchid: 'plant', heather: 'plant', meadowsweet: 'plant',
  royal_fern: 'plant', water_soldiers: 'plant',

  // Other bottom
  beaver: 'pawed', blue_ground_beetle: 'insect', otter: 'pawed',

  // Bats
  alcathoe_bat: 'bat', brandts_bat: 'bat', common_noctule: 'bat',
  daubentons_bat: 'bat', serotine_bat: 'bat',

  // Pawed / Hoofed / Lateral
  dartmoor_badger: 'pawed', dartmoor_black_rabbit: 'pawed',
  dartmoor_pony: 'cloven_hoofed', dartmoor_sheep: 'cloven_hoofed',
  field_vole: 'mouse', wood_mouse: 'mouse', shrew: 'mouse',
  roe_deer_d: 'cloven_hoofed',

  // Insects
  gnat_d: 'gnat', lake_fly: 'insect',

  // Cave
  cave_d: 'cave', lonely_cave_d: 'cave',
}

/** Returns the SVG icon URL for a card, or undefined if not mapped */
export function getCardIconUrl(cardKey: string): string | undefined {
  const iconKey = CARD_ICON_KEYS[cardKey]
  if (!iconKey) return undefined
  return STAT_ICONS[iconKey]
}

// Keep backward-compatible export for any remaining emoji usages
export const CARD_ICONS = CARD_ICON_KEYS
