import type { Expansion, GameEdition } from './card'
import type { CardMetadata } from './scoring'

export type LiveSessionStatus = 'waiting' | 'scoring' | 'completed'
export type LivePlayerStatus = 'joined' | 'scoring' | 'done'

export interface LiveSession {
  id: string
  code: string
  edition: GameEdition
  expansions: Expansion[]
  status: LiveSessionStatus
  host_player_id: string
  created_at: string
}

export interface LiveSessionPlayer {
  id: string
  session_id: string
  player_id: string
  player_name: string
  status: LivePlayerStatus
  card_counts: Record<string, number>
  card_metadata: Record<string, CardMetadata>
  fully_occupied_trees: number
  submitted_at: string | null
}
