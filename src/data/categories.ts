import type { CardCategory, GameEdition } from '@/types/card'
import { STAT_ICONS } from '@/assets/icons'

/** SVG icon URL for each card category */
export const CATEGORY_ICON_URLS: Record<CardCategory, string> = {
  tree: STAT_ICONS.tree,
  top: STAT_ICONS.bird,
  bottom: STAT_ICONS.plant,
  lateral: STAT_ICONS.cloven_hoofed,
  moor: STAT_ICONS.moor,
  cave: STAT_ICONS.cave,
}

/** @deprecated Use CATEGORY_ICON_URLS instead */
export const CATEGORY_ICONS: Record<CardCategory, string> = {
  tree: '🌲',
  top: '🐦',
  bottom: '🌿',
  lateral: '🦌',
  moor: '🏞️',
  cave: '🕳️',
}

export const CATEGORY_ORDER: CardCategory[] = [
  'tree',
  'top',
  'bottom',
  'lateral',
  'cave',
]

export function getCategoryLabel(cat: CardCategory, edition: GameEdition): string {
  if (edition === 'dartmoor' && cat === 'tree') return 'tree_dartmoor'
  return cat
}

export function getCategoryOrder(edition: GameEdition): CardCategory[] {
  if (edition === 'dartmoor') return ['tree', 'moor', 'top', 'bottom', 'lateral', 'cave']
  return CATEGORY_ORDER
}
