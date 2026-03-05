import { supabase } from './supabase'
import type { Player } from '@/types/player'
import type { GameWithPlayers, GamePlayer } from '@/types/game'
import type { ScoreBreakdown } from '@/types/scoring'

// ─── Players ────────────────────────────────────────────────────────────────

export async function fetchPlayers(): Promise<Player[]> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
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
    .insert({ id: player.id, name: player.name, color: player.color })
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
