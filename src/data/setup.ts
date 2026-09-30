import type { Expansion, GameEdition } from '@/types/card'

export const SETUP_PLAYER_COUNTS = [2, 3, 4, 5] as const

export interface PileHint {
  players: number
  piles: number
  remove: number
}

export interface SetupRemoval {
  /** Cards returned to the box unseen for 2, 3, 4 and 5 players */
  byPlayers: readonly [number, number, number, number]
  /** Returned first, before the per-player amount (classic expansion rule) */
  flat: number
  /** One extra card per Exploration rare card shuffled in; all 15 assumed */
  rareExtra: number
  pileHints: PileHint[]
  /** Official solo mode removes as many cards as a 2-player game */
  solo: boolean
}

// Numbers from the official rulebooks; see rules/setup-removal.md
const CLASSIC = [
  [30, 20, 10, 0],
  [45, 30, 15, 0],
  [80, 50, 35, 20],
] as const
const DARTMOOR = [45, 30, 15, 0] as const
const DARTMOOR_EXMOOR = [70, 40, 25, 10] as const
const SMOKY = [45, 30, 15, 0] as const

export function getSetupRemoval(edition: GameEdition, expansions: Expansion[]): SetupRemoval {
  if (edition === 'smoky') {
    return { byPlayers: SMOKY, flat: 0, rareExtra: 0, pileHints: [], solo: false }
  }
  if (edition === 'dartmoor') {
    const exmoor = expansions.includes('dartmoor_exmoor')
    return {
      byPlayers: exmoor ? DARTMOOR_EXMOOR : DARTMOOR,
      flat: 0,
      rareExtra: 0,
      pileHints: exmoor
        ? [
            { players: 2, piles: 3, remove: 1 },
            { players: 3, piles: 5, remove: 1 },
          ]
        : [],
      solo: false,
    }
  }
  const big = (['alpine', 'woodland'] as Expansion[]).filter((e) => expansions.includes(e)).length as 0 | 1 | 2
  return {
    byPlayers: CLASSIC[big],
    flat: big > 0 ? 10 : 0,
    rareExtra: expansions.includes('exploration') ? 15 : 0,
    pileHints:
      big === 2
        ? [
            { players: 2, piles: 5, remove: 2 },
            { players: 3, piles: 4, remove: 1 },
          ]
        : [],
    solo: true,
  }
}

export function totalRemoved(removal: SetupRemoval, index: 0 | 1 | 2 | 3): number {
  return removal.flat + removal.byPlayers[index] + removal.rareExtra
}
