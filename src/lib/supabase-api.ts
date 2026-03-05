import { supabase, getDeviceId } from './supabase'
import type { Player } from '@/types/player'
import type { GameWithPlayers } from '@/types/game'
import type { ScoreBreakdown } from '@/types/scoring'
import type { LiveSession, LiveSessionPlayer, LiveSessionStatus } from '@/types/live-session'
import type { Expansion, GameEdition } from '@/types/card'

// ─── Players ────────────────────────────────────────────────────────────────

export async function fetchPlayers(): Promise<Player[]> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', getDeviceId())
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Player[]
}

export async function createPlayer(
  player: Omit<Player, 'created_at'>,
): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: player.id, name: player.name, color: player.color, device_id: getDeviceId() })
    .select()
    .single()
  if (error) throw error
  return data as Player
}

export async function updatePlayer(
  id: string,
  updates: Partial<Pick<Player, 'name' | 'color'>>,
): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Player
}

export async function deletePlayer(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) throw error
}

// ─── Games ──────────────────────────────────────────────────────────────────

export async function fetchGames(): Promise<GameWithPlayers[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_players (*)
    `)
    .eq('device_id', getDeviceId())
    .order('played_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    played_at: row.played_at,
    player_count: row.player_count,
    notes: row.notes ?? undefined,
    edition: row.edition !== 'classic' ? row.edition : undefined,
    players: (row.game_players ?? []).map((gp: any) => ({
      id: gp.id,
      game_id: gp.game_id,
      player_id: gp.player_id,
      player_name: gp.player_name,
      total_score: gp.total_score,
      rank: gp.rank,
      is_winner: gp.is_winner,
      score_breakdown: gp.score_breakdown as ScoreBreakdown,
    })),
  }))
}

export async function fetchGame(
  id: string,
): Promise<GameWithPlayers | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      game_players (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }

  return {
    id: data.id,
    played_at: data.played_at,
    player_count: data.player_count,
    notes: data.notes ?? undefined,
    edition: data.edition !== 'classic' ? data.edition : undefined,
    players: ((data as any).game_players ?? []).map((gp: any) => ({
      id: gp.id,
      game_id: gp.game_id,
      player_id: gp.player_id,
      player_name: gp.player_name,
      total_score: gp.total_score,
      rank: gp.rank,
      is_winner: gp.is_winner,
      score_breakdown: gp.score_breakdown as ScoreBreakdown,
    })),
  }
}

export async function createGame(
  game: GameWithPlayers,
): Promise<GameWithPlayers> {
  if (!supabase) throw new Error('Supabase not configured')

  // 1. Insert the game row
  const { error: gameError } = await supabase.from('games').insert({
    id: game.id,
    played_at: game.played_at,
    player_count: game.player_count,
    notes: game.notes ?? null,
    edition: game.edition ?? 'classic',
    device_id: getDeviceId(),
  })
  if (gameError) throw gameError

  // 2. Insert game_players
  const gamePlayers = game.players.map((p) => ({
    id: p.id,
    game_id: game.id,
    player_id: p.player_id,
    player_name: p.player_name,
    total_score: p.total_score,
    rank: p.rank,
    is_winner: p.is_winner,
    score_breakdown: p.score_breakdown,
  }))
  const { error: gpError } = await supabase
    .from('game_players')
    .insert(gamePlayers)
  if (gpError) throw gpError

  // 3. Insert score_entries (normalized for analytics)
  const scoreEntries: {
    game_player_id: string
    card_key: string
    card_category: string
    count: number
    points: number
  }[] = []

  for (const p of game.players) {
    if (!p.score_breakdown?.entries) continue
    for (const entry of p.score_breakdown.entries) {
      scoreEntries.push({
        game_player_id: p.id,
        card_key: entry.cardKey,
        card_category: entry.cardCategory,
        count: entry.count,
        points: entry.points,
      })
    }
  }

  if (scoreEntries.length > 0) {
    const { error: seError } = await supabase
      .from('score_entries')
      .insert(scoreEntries)
    if (seError) throw seError
  }

  return game
}

export async function deleteGame(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) throw error
}

// ─── Live Sessions ──────────────────────────────────────────────────────────

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateSessionCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

export async function createLiveSession(
  edition: GameEdition,
  expansions: Expansion[],
  hostPlayerId: string,
): Promise<LiveSession> {
  if (!supabase) throw new Error('Supabase not configured')
  const code = generateSessionCode()
  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      code,
      edition,
      expansions,
      host_player_id: hostPlayerId,
    })
    .select()
    .single()
  if (error) throw error
  return data as LiveSession
}

export async function fetchLiveSessionByCode(code: string): Promise<LiveSession | null> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as LiveSession
}

export async function fetchLiveSession(id: string): Promise<LiveSession | null> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as LiveSession
}

export async function updateLiveSessionStatus(
  id: string,
  status: LiveSessionStatus,
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('live_sessions')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function joinLiveSession(
  sessionId: string,
  playerId: string,
  playerName: string,
): Promise<LiveSessionPlayer> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('live_session_players')
    .insert({
      session_id: sessionId,
      player_id: playerId,
      player_name: playerName,
    })
    .select()
    .single()
  if (error) throw error
  return data as LiveSessionPlayer
}

export async function fetchLiveSessionPlayers(
  sessionId: string,
): Promise<LiveSessionPlayer[]> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('live_session_players')
    .select('*')
    .eq('session_id', sessionId)
    .order('id', { ascending: true })
  if (error) throw error
  return data as LiveSessionPlayer[]
}

export async function submitPlayerScoring(
  playerId: string,
  sessionId: string,
  scoring: {
    card_counts: Record<string, number>
    card_metadata: Record<string, unknown>
    fully_occupied_trees: number
  },
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('live_session_players')
    .update({
      card_counts: scoring.card_counts,
      card_metadata: scoring.card_metadata,
      fully_occupied_trees: scoring.fully_occupied_trees,
      status: 'done',
      submitted_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('player_id', playerId)
  if (error) throw error
}

export async function updateLivePlayerStatus(
  playerId: string,
  sessionId: string,
  status: 'joined' | 'scoring' | 'done',
): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('live_session_players')
    .update({ status })
    .eq('session_id', sessionId)
    .eq('player_id', playerId)
  if (error) throw error
}
