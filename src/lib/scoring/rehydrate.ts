import type { GameWithPlayers } from '@/types/game'
import type { CardMetadata, ScoreBreakdown } from '@/types/scoring'
import type { Expansion, GameEdition } from '@/types/card'
import type { PlayerScoring } from '@/store/scoring-store'
import { getCard } from '@/data/cards'

export interface ResumedSession {
  players: PlayerScoring[]
  expansions: Expansion[]
  edition: GameEdition
  playedAt: string
}

const BASE_EXPANSION: Record<GameEdition, Expansion> = {
  classic: 'base',
  dartmoor: 'dartmoor_base',
  smoky: 'smoky_base',
}

function countsFromBreakdown(breakdown: ScoreBreakdown | null | undefined): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const entry of breakdown?.entries ?? []) {
    if (entry.count > 0) counts[entry.cardKey] = entry.count
  }
  return counts
}

// Games saved before scoring input was stored: enable every expansion a counted card belongs to
function inferExpansions(edition: GameEdition, allCounts: Record<string, number>[]): Expansion[] {
  const expansions = new Set<Expansion>([BASE_EXPANSION[edition]])
  for (const counts of allCounts) {
    for (const key of Object.keys(counts)) {
      const exp = getCard(key)?.expansion
      if (exp) expansions.add(exp)
    }
  }
  return [...expansions]
}

/** Rebuild a wizard session from a saved game so its scores can be edited */
export function sessionFromGame(game: GameWithPlayers): ResumedSession {
  const edition = game.edition ?? 'classic'
  const ordered = [...game.players].sort((a, b) => a.rank - b.rank)

  const players: PlayerScoring[] = ordered.map((gp) => {
    const input = gp.score_breakdown?.input
    const cardCounts = input?.cardCounts ?? countsFromBreakdown(gp.score_breakdown)
    const cardMetadata: Record<string, CardMetadata> =
      input?.cardMetadata ??
      Object.fromEntries(Object.entries(cardCounts).map(([key, count]) => [key, { count }]))
    return {
      playerId: gp.player_id ?? gp.id,
      profileId: gp.player_id,
      playerName: gp.player_name,
      cardCounts,
      cardMetadata,
      fullyOccupiedTrees: input?.fullyOccupiedTrees ?? 0,
      breakdown: null,
    }
  })

  const savedExpansions = ordered
    .map((gp) => gp.score_breakdown?.input?.expansions)
    .find((e) => e && e.length > 0)
  const expansions = savedExpansions ?? inferExpansions(edition, players.map((p) => p.cardCounts))

  return { players, expansions, edition, playedAt: game.played_at }
}
