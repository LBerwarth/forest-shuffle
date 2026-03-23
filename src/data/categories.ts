import type { CardCategory, GameEdition } from '@/types/card'

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
