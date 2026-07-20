import type { CardDefinition } from '@/types/card'

// Transcribed from FR card photos (E01–E48). See rules/exmoor-notes.md.
export const EXMOOR_CARDS: CardDefinition[] = [
  // ============================================================
  // SHRUBS — category 'tree', score 0 (ongoing effects only)
  // ============================================================
  { key: 'holly', category: 'tree', tags: ['shrub'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'gorse', category: 'tree', tags: ['shrub'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // MOOR
  // ============================================================
  { key: 'coastal_heath', category: 'moor', tags: ['moor'], expansion: 'dartmoor_exmoor', scoringType: 'custom', needsHostBirdContext: true },
  { key: 'stone_circle', category: 'moor', tags: ['moor'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'tarr_steps', category: 'moor', tags: ['moor'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'waxcap_grassland', category: 'moor', tags: ['moor'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // TOP SLOT
  // ============================================================
  { key: 'dartford_warbler', category: 'top', tags: ['bird'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'golden_ringed_dragonfly', category: 'top', tags: ['dragonfly', 'insect'], expansion: 'dartmoor_exmoor', scoringType: 'set' },
  { key: 'grey_wagtail', category: 'top', tags: ['bird'], expansion: 'dartmoor_exmoor', scoringType: 'per_card' },
  { key: 'harvest_mouse', category: 'top', tags: ['mouse', 'pawed'], expansion: 'dartmoor_exmoor', scoringType: 'per_tag' },
  { key: 'peregrine_falcon', category: 'top', tags: ['bird'], expansion: 'dartmoor_exmoor', scoringType: 'per_tag' },
  { key: 'pied_flycatcher', category: 'top', tags: ['bird'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // BOTTOM SLOT
  // ============================================================
  { key: 'bank_vole', category: 'bottom', tags: ['mouse', 'pawed'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'natterjack_toad', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'smooth_snake', category: 'bottom', tags: ['amphibian'], expansion: 'dartmoor_exmoor', scoringType: 'custom', needsContext: true },
  { key: 'sundew', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_exmoor', scoringType: 'per_tag' },
  { key: 'tormentil', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  { key: 'wood_rush', category: 'bottom', tags: ['plant'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },

  // ============================================================
  // LATERAL SLOT
  // ============================================================
  { key: 'bilberry_bumblebee', category: 'lateral', tags: ['insect'], expansion: 'dartmoor_exmoor', scoringType: 'per_tag' },
  { key: 'dormouse', category: 'lateral', tags: ['pawed'], expansion: 'dartmoor_exmoor', scoringType: 'custom', needsContext: true, contextCappedByCount: true },
  { key: 'exmoor_pony_foal', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_exmoor', scoringType: 'fixed' },
  // FR "Cheval" — the rulebook's "Exmoor Pony"; counts as a pony itself
  { key: 'horse', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_exmoor', scoringType: 'per_card' },
  { key: 'red_devon_cow', category: 'lateral', tags: ['hoofed'], expansion: 'dartmoor_exmoor', scoringType: 'per_tag' },
  { key: 'whiskered_bat', category: 'lateral', tags: ['bat'], expansion: 'dartmoor_exmoor', scoringType: 'set' },

  // ============================================================
  // CAVES — 5 asymmetrical caves replace the Dartmoor caves in setup;
  // all score 1 point per card in the cave, so one wizard entry suffices
  // ============================================================
  { key: 'cave_exmoor', category: 'cave', tags: [], expansion: 'dartmoor_exmoor', scoringType: 'per_card' },
]
