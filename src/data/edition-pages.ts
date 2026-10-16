import type { GameEdition } from '@/types/card'

export const EDITION_PAGES = [
  { slug: 'smoky-mountains', prefix: 'smokyPage', edition: 'smoky' },
  { slug: 'dartmoor', prefix: 'dartmoorPage', edition: 'dartmoor' },
  { slug: 'expansions', prefix: 'expansionsPage', edition: 'classic' },
] as const satisfies readonly { slug: string; prefix: string; edition: GameEdition }[]

export type EditionPageDef = (typeof EDITION_PAGES)[number]
export type EditionPagePrefix = EditionPageDef['prefix']
