import { supabase, getDeviceId } from './supabase'
import { getUserId } from './auth'
import type { Player } from '@/types/player'
import type { GameWithPlayers } from '@/types/game'
import type { ScoreBreakdown } from '@/types/scoring'
import type { LiveSession, LiveSessionPlayer, LiveSessionStatus } from '@/types/live-session'
import type { CardCategory, Expansion, GameEdition } from '@/types/card'

/** Rows owned by this account, plus unclaimed legacy rows keyed by this device. */
async function ownerFilter(): Promise<string> {
  const deviceId = getDeviceId()
  const userId = await getUserId()
  return userId
    ? `user_id.eq.${userId},and(user_id.is.null,device_id.eq.${deviceId})`
    : `device_id.eq.${deviceId}`
}

// ─── Players ────────────────────────────────────────────────────────────────

export async function fetchPlayers(): Promise<Player[]> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(await ownerFilter())
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Player[]
}

/** Normalized key for matching player names (trim + case-insensitive). */
function playerNameKey(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * Create a player, or reuse an existing same-name profile of this account.
 *
 * Matching is trim + case-insensitive, so re-adding someone who already exists
 * (e.g. from a different screen) returns their existing profile instead of
 * minting a duplicate. The DB unique index uq_profiles_name_user is the
 * backstop for any concurrent insert that slips past this check.
 */
export async function createPlayer(
  player: Omit<Player, 'created_at'>,
): Promise<Player> {
  if (!supabase) throw new Error('Supabase not configured')
  const deviceId = getDeviceId()
  const filter = await ownerFilter()
  const name = player.name.trim()
  const key = playerNameKey(name)

  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('*')
    .or(filter)
  if (lookupError) throw lookupError
  const match = (existing ?? []).find((p) => playerNameKey(p.name) === key)
  if (match) return match as Player

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: player.id, name, color: player.color, device_id: deviceId })
    .select()
    .single()
  if (error) {
    // Unique-index race: another insert won. Return whichever row exists now.
    if (error.code === '23505') {
      const { data: raced } = await supabase
        .from('profiles')
        .select('*')
        .or(filter)
      const winner = (raced ?? []).find((p) => playerNameKey(p.name) === key)
      if (winner) return winner as Player
    }
    throw error
  }
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
    .or(await ownerFilter())
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

/**
 * Idempotent save: replaces any existing game with the same id (cascades to
 * game_players and score_entries) and inserts a fresh record. Use when the
 * user finishes the same scoring session more than once (e.g. via Edit Scores).
 */
export async function saveGame(game: GameWithPlayers): Promise<GameWithPlayers> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error: deleteError } = await supabase
    .from('games')
    .delete()
    .eq('id', game.id)
    .or(await ownerFilter())
  if (deleteError) throw deleteError
  return createGame(game)
}

// ─── Feedback ─────────────────────────────────────────────────────────────

export interface FeedbackItem {
  cardKey: string
  type: 'translation' | 'rule'
  proposition: string
}

export interface FeedbackInput {
  language: string
  appVersion: string
  message?: string
  email?: string
  items: FeedbackItem[]
}

/**
 * Store user feedback. Write-only (RLS grants insert, not select), so no
 * .select() chain. Throws when Supabase isn't configured so the caller can
 * fall back to e-mail.
 */
export async function submitFeedback(input: FeedbackInput): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('feedback').insert({
    device_id: getDeviceId(),
    language: input.language,
    app_version: input.appVersion,
    message: input.message || null,
    email: input.email || null,
    items: input.items,
  })
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
  language: string,
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
      language,
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

// ─── Global Hall of Fame (cross-device) ────────────────────────────────────

export interface HofRecord {
  names: string[]
  holders: number
  playedAt: string
  isMine: boolean
}

export interface HallOfFameData {
  since: string | null
  totalGames: number
  totalPlayers: number
  me: { bestScore: number; rank: number; total: number; betterThanPct: number } | null
  topGame: (HofRecord & { totalScore: number }) | null
  topTable: { totalScore: number; players: number; playedAt: string; isMine: boolean } | null
  topCard: (HofRecord & { cardKey: string; points: number }) | null
  topMargin: (HofRecord & { margin: number }) | null
  topForest: (HofRecord & { cards: number }) | null
  categoryBests: (HofRecord & {
    cardCategory: CardCategory
    cardKey: string
    points: number
  })[]
  cardMeta: {
    mostPlayed: { cardKey: string; plays: number } | null
    bestAverage: { cardKey: string; avgPoints: number; appearances: number } | null
  }
}

interface RawHofRecord {
  names: string[] | null
  holders: number
  played_at: string
  is_mine: boolean
}

function mapRecord(raw: RawHofRecord): HofRecord {
  return {
    names: raw.names ?? [],
    holders: raw.holders ?? 0,
    playedAt: raw.played_at,
    isMine: raw.is_mine ?? false,
  }
}

export interface HallOfFameParams {
  playerCount?: number | 'group'
  edition?: GameEdition
  since?: Date | null
  myScore?: number | null
}

export async function fetchHallOfFame({
  playerCount,
  edition,
  since,
  myScore,
}: HallOfFameParams): Promise<HallOfFameData> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.rpc('hall_of_fame', {
    p_player_count: typeof playerCount === 'number' ? playerCount : null,
    p_group: playerCount === 'group',
    p_edition: edition ?? null,
    p_since: since ? since.toISOString() : null,
    p_my_score: myScore ?? null,
    p_device_id: getDeviceId(),
  })
  if (error) throw error
  const raw = data as {
    since: string | null
    total_games: number
    total_players: number
    me: { best_score: number; rank: number; total: number; better_than_pct: number } | null
    top_game: (RawHofRecord & { total_score: number }) | null
    top_table: {
      total_score: number
      players: number
      played_at: string
      is_mine: boolean
    } | null
    top_card: (RawHofRecord & { card_key: string; points: number }) | null
    top_margin: (RawHofRecord & { margin: number }) | null
    top_forest: (RawHofRecord & { cards: number }) | null
    category_bests:
      | (RawHofRecord & { card_category: CardCategory; card_key: string; points: number })[]
      | null
    card_meta: {
      most_played: { card_key: string; plays: number } | null
      best_average: { card_key: string; avg_points: number; appearances: number } | null
    } | null
  } | null
  return {
    since: raw?.since ?? null,
    totalGames: raw?.total_games ?? 0,
    totalPlayers: raw?.total_players ?? 0,
    me: raw?.me
      ? {
          bestScore: raw.me.best_score,
          rank: raw.me.rank,
          total: raw.me.total,
          betterThanPct: raw.me.better_than_pct,
        }
      : null,
    topGame: raw?.top_game
      ? { ...mapRecord(raw.top_game), totalScore: raw.top_game.total_score }
      : null,
    topTable: raw?.top_table
      ? {
          totalScore: raw.top_table.total_score,
          players: raw.top_table.players,
          playedAt: raw.top_table.played_at,
          isMine: raw.top_table.is_mine ?? false,
        }
      : null,
    topCard: raw?.top_card
      ? {
          ...mapRecord(raw.top_card),
          cardKey: raw.top_card.card_key,
          points: raw.top_card.points,
        }
      : null,
    topMargin: raw?.top_margin
      ? { ...mapRecord(raw.top_margin), margin: raw.top_margin.margin }
      : null,
    topForest: raw?.top_forest
      ? { ...mapRecord(raw.top_forest), cards: raw.top_forest.cards }
      : null,
    categoryBests: (raw?.category_bests ?? []).map((c) => ({
      ...mapRecord(c),
      cardCategory: c.card_category,
      cardKey: c.card_key,
      points: c.points,
    })),
    cardMeta: {
      mostPlayed: raw?.card_meta?.most_played
        ? {
            cardKey: raw.card_meta.most_played.card_key,
            plays: raw.card_meta.most_played.plays,
          }
        : null,
      bestAverage: raw?.card_meta?.best_average
        ? {
            cardKey: raw.card_meta.best_average.card_key,
            avgPoints: raw.card_meta.best_average.avg_points,
            appearances: raw.card_meta.best_average.appearances,
          }
        : null,
    },
  }
}
