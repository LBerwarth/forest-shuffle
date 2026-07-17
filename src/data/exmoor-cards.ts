import type { CardDefinition } from '@/types/card'

// Partial list from the EN rulebook (260127) — appendix/full card list still
// unpublished; scoringType values are provisional. See rules/exmoor-notes.md.
export const EXMOOR_CARDS: CardDefinition[] = [
  // ============================================================
  // SHRUBS (8 total, 1 known) — category 'tree', like Dartmoor shrubs
  // ============================================================
  { key: 'holly', category: 'tree', tags: ['shrub'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // MOOR (12 total, 1 known)
  // ============================================================
  { key: 'waxcap_grassland', category: 'moor', tags: ['moor'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // TOP SLOT (2 of 19 top/bottom splits known)
  // ============================================================
  { key: 'grey_wagtail', category: 'top', tags: ['bird'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'golden_ringed_dragonfly', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_exmoor', scoringType: 'set' },

  // ============================================================
  // BOTTOM SLOT (1 known)
  // ============================================================
  { key: 'natterjack_toad', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // LATERAL SLOT (3 of 11 left/right splits known)
  // ============================================================
  { key: 'dormouse', category: 'lateral', tags: ['mouse', 'pawed'], expansion: 'dartmoor_exmoor', scoringType: 'custom' },
  { key: 'exmoor_pony', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'exmoor_pony_foal', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // CAVES (5 asymmetrical, replace base caves; 1 known)
  // ============================================================
  { key: 'cave_7', category: 'cave', tags: [], expansion: 'dartmoor_exmoor', scoringType: 'per_card' },
]
