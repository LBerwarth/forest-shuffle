import type { CardDefinition } from '@/types/card'

// Transcribed from the EN rules/appendix PDFs (see rules/smoky-*-extracted.txt).
// Keys colliding with classic/Dartmoor cards get an _s suffix.
export const SMOKY_CARDS: CardDefinition[] = [
  // ============================================================
  // TREES (rivers use the moor category, labeled "Rivers" in the UI)
  // ============================================================
  // 2 pts per Basswood symbol on the tree + its attachments — entered manually
  { key: 'basswood', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'black_gum', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'per_tag' },
  // 1 pt per Buckeye symbol in the whole forest — entered manually
  { key: 'buckeye', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'fraser_fir', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'hemlock', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'fixed' },
  // 2 pts per card attached to it (incl. river + cards below) — entered manually
  { key: 'hickory', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'silver_maple', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'yellow_birch', category: 'tree', tags: ['tree'], expansion: 'smoky_base', scoringType: 'fixed' },

  // ============================================================
  // RIVERS
  // ============================================================
  { key: 'creek', category: 'moor', tags: ['moor'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'river_bend', category: 'moor', tags: ['moor'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'waterfall', category: 'moor', tags: ['moor'], expansion: 'smoky_base', scoringType: 'fixed' },
  // Face-down card played as a river: 0 points but counts as a river
  { key: 'universal_river', category: 'moor', tags: ['moor'], expansion: 'smoky_base', scoringType: 'fixed' },

  // ============================================================
  // TOP SLOT
  // ============================================================
  { key: 'bald_eagle', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'caddisfly', category: 'top', tags: ['insect'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'flying_squirrel', category: 'top', tags: ['squirrel'], expansion: 'smoky_base', scoringType: 'set' },
  { key: 'great_blue_heron', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'long_eared_owl', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'peregrine_falcon_s', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'rockcap_fern', category: 'top', tags: ['plant'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'ruby_throated_hummingbird', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'scarlet_tanager', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'thermometer_cricket', category: 'top', tags: ['insect'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'tufted_titmouse', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'fixed' },
  // 2 pts per different tree symbol on its tree — entered manually
  { key: 'virginia_opossum', category: 'top', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'water_starwort', category: 'top', tags: ['plant'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'wood_thrush', category: 'top', tags: ['bird'], expansion: 'smoky_base', scoringType: 'fixed' },

  // ============================================================
  // BOTTOM SLOT
  // ============================================================
  { key: 'blue_mistflower', category: 'bottom', tags: ['plant'], expansion: 'smoky_base', scoringType: 'fixed' },
  // 3 pts per river without a fish below it — entered manually
  { key: 'brook_trout', category: 'bottom', tags: ['fish'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'brown_water_scorpion', category: 'bottom', tags: ['insect'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'common_box_turtle', category: 'bottom', tags: ['amphibian'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'eastern_chipmunk', category: 'bottom', tags: ['squirrel'], expansion: 'smoky_base', scoringType: 'set' },
  { key: 'eastern_hellbender', category: 'bottom', tags: ['amphibian'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'greenside_darter', category: 'bottom', tags: ['fish'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'imitator_salamander', category: 'bottom', tags: ['amphibian'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'largeleaf_pondweed', category: 'bottom', tags: ['plant'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'skipper_caterpillar', category: 'bottom', tags: ['insect'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'smallmouth_bass', category: 'bottom', tags: ['fish'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'solomons_seal', category: 'bottom', tags: ['plant'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'wintergreen', category: 'bottom', tags: ['plant'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'wood_frog', category: 'bottom', tags: ['amphibian'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'yellow_bullhead', category: 'bottom', tags: ['fish'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'yellow_perch', category: 'bottom', tags: ['fish'], expansion: 'smoky_base', scoringType: 'fixed' },

  // ============================================================
  // LATERAL SLOT (left/right)
  // ============================================================
  { key: 'beaver_s', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'per_card' },
  // 30 pts per bear with 2+ fish at its tree, 10 otherwise — count entered manually
  { key: 'black_bear', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  { key: 'bobcat', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'chestnut_sided_warbler', category: 'lateral', tags: ['bird'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'coyote', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'elk_s', category: 'lateral', tags: ['hoofed'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'gray_fox', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'gray_squirrel', category: 'lateral', tags: ['squirrel'], expansion: 'smoky_base', scoringType: 'set' },
  { key: 'long_tailed_weasel', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'threshold' },
  { key: 'masked_shrew', category: 'lateral', tags: ['mouse'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'mink', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'pileated_woodpecker', category: 'lateral', tags: ['bird'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'raccoon_s', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'fixed' },
  { key: 'red_squirrel_s', category: 'lateral', tags: ['squirrel'], expansion: 'smoky_base', scoringType: 'set' },
  { key: 'river_otter', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'rock_vole', category: 'lateral', tags: ['mouse'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'short_tailed_shrew', category: 'lateral', tags: ['mouse'], expansion: 'smoky_base', scoringType: 'fixed' },
  // 10 pts per skunk that is alone at its tree — count entered manually
  { key: 'spotted_skunk', category: 'lateral', tags: ['pawed'], expansion: 'smoky_base', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  { key: 'synchronous_firefly', category: 'lateral', tags: ['insect'], expansion: 'smoky_base', scoringType: 'set' },
  // 2 pts per tree symbol matching the Turkey's own — entered manually
  { key: 'turkey', category: 'lateral', tags: ['bird'], expansion: 'smoky_base', scoringType: 'custom', needsContext: true },
  { key: 'virgins_bower', category: 'lateral', tags: ['plant'], expansion: 'smoky_base', scoringType: 'per_tag' },
  // 10 pts per wasp at a tree with at least one other insect — count entered manually
  { key: 'weevil_wasp', category: 'lateral', tags: ['insect'], expansion: 'smoky_base', scoringType: 'conditional', needsContext: true, contextCappedByCount: true },
  { key: 'white_footed_mouse', category: 'lateral', tags: ['mouse'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'white_tailed_deer', category: 'lateral', tags: ['hoofed'], expansion: 'smoky_base', scoringType: 'per_tag' },
  { key: 'yellow_bellied_sapsucker', category: 'lateral', tags: ['bird'], expansion: 'smoky_base', scoringType: 'fixed' },

  // ============================================================
  // CAVE
  // ============================================================
  { key: 'cave_s', category: 'cave', tags: [], expansion: 'smoky_base', scoringType: 'fixed' },
]
