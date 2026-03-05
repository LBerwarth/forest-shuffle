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

export function getCategoryOrder(edition: GameEdition): CardCategory[] {
  if (edition === 'dartmoor') return ['tree', 'top', 'bottom', 'lateral', 'moor', 'cave']
  return CATEGORY_ORDER
}
