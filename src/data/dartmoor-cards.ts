import type { CardDefinition } from '@/types/card'

export const DARTMOOR_CARDS: CardDefinition[] = [
  // ============================================================
  // TREES (6)
  // ============================================================
  { key: 'ash', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'black_alder', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'crab_apple', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'goat_willow', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'per_card' },
  { key: 'moor_birch', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'sessile_oak', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'per_card' },

  // SHRUBS (2) — category 'tree', score 0
  { key: 'common_hazel_d', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'elderberry_d', category: 'tree', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },

  // ============================================================
  // MOOR (9)
  // ============================================================
  { key: 'blanket_bog', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true },
  { key: 'fountainhead', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'lowland_heath', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'rhos_pasture', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'rivulet', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_card' },
  { key: 'tor', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'valley_mire', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'warrens', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'wet_woodland', category: 'moor', tags: [], expansion: 'dartmoor_base', scoringType: 'per_card' },

  // ============================================================
  // TOP SLOT (14)
  // ============================================================
  { key: 'barn_owl_d', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'beautiful_demoiselle', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'black_tailed_godwit', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'comparison' },
  { key: 'buzzard', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'common_moorhen', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'cuckoo_d', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'curlew', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'threshold' },
  { key: 'emerald_damselfly', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'grey_heron', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'keeled_skimmer', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'meadow_pipit', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'custom' },
  { key: 'small_red_damselfly', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'southern_damselfly', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'wheatear', category: 'top', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },

  // ============================================================
  // BOTTOM SLOT (16)
  // ============================================================
  { key: 'adder', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'adders_tongue', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'beaver', category: 'bottom', tags: [], expansion: 'dartmoor_base', scoringType: 'per_card' },
  { key: 'blue_ground_beetle', category: 'bottom', tags: ['insect'], expansion: 'dartmoor_base', scoringType: 'per_card' },
  { key: 'blueberry_d', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'custom' },
  { key: 'bog_asphodel', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'per_card' },
  { key: 'common_lizard', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_base', scoringType: 'threshold' },
  { key: 'grass_snake', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'greater_butterfly_orchid', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'threshold' },
  { key: 'heather', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'meadowsweet', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'moor_frog', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_base', scoringType: 'threshold' },
  { key: 'otter', category: 'bottom', tags: [], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'royal_fern', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'custom' },
  { key: 'warty_newt', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'water_soldiers', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_base', scoringType: 'per_tag' },

  // ============================================================
  // LATERAL SLOT (19)
  // ============================================================
  { key: 'alcathoe_bat', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'brandts_bat', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'common_noctule', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'daubentons_bat', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'serotine_bat', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_base', scoringType: 'set' },
  { key: 'capercaillie_d', category: 'lateral', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'common_pheasant', category: 'lateral', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'dartmoor_badger', category: 'lateral', tags: ['pawed'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'dartmoor_black_rabbit', category: 'lateral', tags: ['rabbit', 'pawed'], expansion: 'dartmoor_base', scoringType: 'custom' },
  { key: 'dartmoor_pony', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_base', scoringType: 'comparison' },
  { key: 'dartmoor_sheep', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'field_vole', category: 'lateral', tags: ['mouse', 'pawed'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'gnat_d', category: 'lateral', tags: ['insect'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'lake_fly', category: 'lateral', tags: ['insect'], expansion: 'dartmoor_base', scoringType: 'per_tag' },
  { key: 'nuthatch', category: 'lateral', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'roe_deer_d', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_base', scoringType: 'custom', needsContext: true },
  { key: 'shrew', category: 'lateral', tags: ['mouse', 'pawed'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'treecreeper', category: 'lateral', tags: ['bird'], expansion: 'dartmoor_base', scoringType: 'fixed' },
  { key: 'wood_mouse', category: 'lateral', tags: ['mouse', 'pawed'], expansion: 'dartmoor_base', scoringType: 'per_tag' },

  // ============================================================
  // CAVE
  // ============================================================
  { key: 'cave_d', category: 'cave', tags: [], expansion: 'dartmoor_base', scoringType: 'fixed' },
]
