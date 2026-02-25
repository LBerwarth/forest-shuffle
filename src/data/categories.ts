import type { CardCategory } from '@/types/card'

export const CATEGORY_ICONS: Record<CardCategory, string> = {
  tree: '🌲',
  top: '🐦',
  bottom: '🌿',
  left: '🦇',
  right: '🦊',
  cave: '🕳️',
}

export const CATEGORY_ORDER: CardCategory[] = [
  'tree',
  'top',
  'bottom',
  'left',
  'right',
  'cave',
]
