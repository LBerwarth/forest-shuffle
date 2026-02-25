import type { ScoreBreakdown } from './scoring'

export interface Game {
  id: string
  played_at: string
  player_count: number
  notes?: string
}

export interface GamePlayer {
  id: string
  game_id: string
  player_id: string
  player_name: string
  total_score: number
  rank: number
  is_winner: boolean
  score_breakdown: ScoreBreakdown
}

export interface GameWithPlayers extends Game {
  players: GamePlayer[]
}
