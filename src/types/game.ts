import type { ScoreBreakdown } from './scoring'
import type { GameEdition } from './card'

export interface Game {
  id: string
  played_at: string
  player_count: number
  notes?: string
  edition?: GameEdition
}

export interface GamePlayer {
  id: string
  game_id: string
  // Null when the player's profile was deleted — the row is kept for history,
  // identified by the denormalized player_name below.
  player_id: string | null
  player_name: string
  total_score: number
  rank: number
  is_winner: boolean
  score_breakdown: ScoreBreakdown
}

export interface GameWithPlayers extends Game {
  players: GamePlayer[]
}
