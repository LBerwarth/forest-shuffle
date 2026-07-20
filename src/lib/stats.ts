import type { GameWithPlayers } from '@/types/game'
import type { Player } from '@/types/player'
import type { CardCategory, CardTag } from '@/types/card'
import { CARDS } from '@/data/cards'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'
import { EXMOOR_CARDS } from '@/data/exmoor-cards'

const CARD_TAGS_BY_KEY: Map<string, readonly CardTag[]> = (() => {
  const m = new Map<string, readonly CardTag[]>()
  for (const c of [...CARDS, ...DARTMOOR_CARDS, ...EXMOOR_CARDS]) m.set(c.key, c.tags)
  return m
})()

export const STRATEGY_TAGS: readonly CardTag[] = [
  'pawed',
  'butterfly',
  'bat',
  'plant',
  'insect',
  'bird',
  'amphibian',
  'deer',
] as const

export type EditionFilter = 'all' | 'classic' | 'dartmoor'
export type TimeFilter = 'all' | 'year' | 'month' | 'week'
export type PlayerMatchMode = 'union' | 'intersection'
export type PlayerCountFilter = 'all' | 2 | 3 | 4 | 5 | 6

export function applyFilters(
  games: GameWithPlayers[],
  edition: EditionFilter,
  time: TimeFilter,
  playerIds: string[] = [],
  matchMode: PlayerMatchMode = 'union',
  playerCount: PlayerCountFilter = 'all',
  now: Date = new Date(),
): GameWithPlayers[] {
  const cutoff = computeCutoff(time, now)
  const selectedSet = new Set(playerIds)
  const matched = games.filter((g) => {
    const gameEdition = g.edition ?? 'classic'
    if (edition !== 'all' && gameEdition !== edition) return false
    if (cutoff !== null && new Date(g.played_at).getTime() < cutoff) return false
    if (playerCount !== 'all' && g.player_count !== playerCount) return false
    if (selectedSet.size > 0) {
      const inGame = new Set(g.players.map((p) => p.player_id))
      if (matchMode === 'intersection') {
        for (const id of selectedSet) {
          if (!inGame.has(id)) return false
        }
      } else {
        let any = false
        for (const id of selectedSet) {
          if (inGame.has(id)) { any = true; break }
        }
        if (!any) return false
      }
    }
    return true
  })
  if (selectedSet.size === 0) return matched
  // Narrow each matched game's players list to only the selected ones, so
  // downstream aggregations don't include non-selected players who happened
  // to be in the game.
  return matched.map((g) => ({
    ...g,
    players: g.players.filter((p) => p.player_id !== null && selectedSet.has(p.player_id)),
  }))
}

function computeCutoff(time: TimeFilter, now: Date): number | null {
  if (time === 'all') return null
  const d = new Date(now)
  if (time === 'year') {
    d.setFullYear(d.getFullYear() - 1)
  } else if (time === 'month') {
    d.setDate(d.getDate() - 30)
  } else if (time === 'week') {
    d.setDate(d.getDate() - 7)
  }
  return d.getTime()
}

export interface AggregatedPlayer {
  playerId: string
  name: string
  color: string
  isLocal: boolean
  gamesPlayed: number
  wins: number
  winRate: number
  avgScore: number
  bestScore: number
  longestStreak: number
}

export function aggregatePlayers(
  games: GameWithPlayers[],
  localPlayers: Player[],
): AggregatedPlayer[] {
  const localById = new Map(localPlayers.map((p) => [p.id, p]))
  const map = new Map<
    string,
    {
      name: string
      games: GameWithPlayers[]
      scores: number[]
      wins: number
    }
  >()

  for (const g of games) {
    for (const p of g.players) {
      if (!p.player_id) continue // deleted player — kept in history, excluded from stats
      let entry = map.get(p.player_id)
      if (!entry) {
        entry = { name: p.player_name, games: [], scores: [], wins: 0 }
        map.set(p.player_id, entry)
      }
      entry.games.push(g)
      entry.scores.push(p.total_score)
      if (p.is_winner) entry.wins++
      entry.name = p.player_name
    }
  }

  const result: AggregatedPlayer[] = []
  for (const [playerId, entry] of map) {
    const local = localById.get(playerId)
    const sum = entry.scores.reduce((a, b) => a + b, 0)
    result.push({
      playerId,
      name: local?.name ?? entry.name,
      color: local?.color ?? '#9ca3af',
      isLocal: !!local,
      gamesPlayed: entry.games.length,
      wins: entry.wins,
      winRate: Math.round((entry.wins / entry.games.length) * 100),
      avgScore: Math.round(sum / entry.scores.length),
      bestScore: Math.max(...entry.scores),
      longestStreak: computeWinStreak(entry.games, playerId),
    })
  }
  return result
}

export function computeWinStreak(
  playerGames: GameWithPlayers[],
  playerId: string,
): number {
  const sorted = [...playerGames].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime(),
  )
  let max = 0
  let current = 0
  for (const g of sorted) {
    const data = g.players.find((p) => p.player_id === playerId)
    if (!data) continue
    if (data.is_winner) {
      current++
      if (current > max) max = current
    } else {
      current = 0
    }
  }
  return max
}

export interface CardAggregate {
  cardKey: string
  category: CardCategory
  tags: readonly CardTag[]
  appearances: number
  totalCount: number
  totalPoints: number
  avgPointsPerAppearance: number
  maxPointsSingle: number
  maxBy: { playerName: string; gameId: string; playedAt: string } | null
  byPlayer: { playerName: string; count: number; points: number }[]
}

export function aggregateCardStats(games: GameWithPlayers[]): CardAggregate[] {
  const map = new Map<
    string,
    {
      category: CardCategory
      appearances: number
      totalCount: number
      totalPoints: number
      maxPointsSingle: number
      maxBy: { playerName: string; gameId: string; playedAt: string } | null
      byPlayer: Map<string, { count: number; points: number }>
    }
  >()

  for (const g of games) {
    for (const p of g.players) {
      const entries = p.score_breakdown?.entries ?? []
      for (const e of entries) {
        if (e.count <= 0) continue
        // Skip legacy synthetic aggregate entries (e.g. "_bat_set", "_butterfly_set")
        // produced by an older scoring engine — they're not real cards.
        if (e.cardKey.startsWith('_')) continue
        let entry = map.get(e.cardKey)
        if (!entry) {
          entry = {
            category: e.cardCategory,
            appearances: 0,
            totalCount: 0,
            totalPoints: 0,
            maxPointsSingle: 0,
            maxBy: null,
            byPlayer: new Map(),
          }
          map.set(e.cardKey, entry)
        }
        entry.appearances++
        entry.totalCount += e.count
        entry.totalPoints += e.points
        if (e.points > entry.maxPointsSingle) {
          entry.maxPointsSingle = e.points
          entry.maxBy = {
            playerName: p.player_name,
            gameId: g.id,
            playedAt: g.played_at,
          }
        }
        const pe = entry.byPlayer.get(p.player_name) ?? { count: 0, points: 0 }
        pe.count += e.count
        pe.points += e.points
        entry.byPlayer.set(p.player_name, pe)
      }
    }
  }

  const result: CardAggregate[] = []
  for (const [cardKey, entry] of map) {
    result.push({
      cardKey,
      category: entry.category,
      tags: CARD_TAGS_BY_KEY.get(cardKey) ?? [],
      appearances: entry.appearances,
      totalCount: entry.totalCount,
      totalPoints: entry.totalPoints,
      avgPointsPerAppearance:
        entry.appearances > 0
          ? Math.round(entry.totalPoints / entry.appearances)
          : 0,
      maxPointsSingle: entry.maxPointsSingle,
      maxBy: entry.maxBy,
      byPlayer: [...entry.byPlayer.entries()]
        .map(([playerName, v]) => ({ playerName, ...v }))
        .sort((a, b) => b.points - a.points),
    })
  }
  return result
}

export interface StrategyEntry {
  tag: CardTag
  cards: number
  totalPoints: number
  avgPointsPerGame: number
}

export interface PlayerStrategies {
  playerId: string
  name: string
  color: string
  isLocal: boolean
  gamesPlayed: number
  topStrategies: StrategyEntry[]
}

export function aggregatePlayerStrategies(
  games: GameWithPlayers[],
  localPlayers: Player[],
): PlayerStrategies[] {
  const localById = new Map(localPlayers.map((p) => [p.id, p]))
  const players = new Map<
    string,
    {
      name: string
      gameIds: Set<string>
      tags: Map<CardTag, { cards: number; points: number }>
    }
  >()

  for (const g of games) {
    for (const p of g.players) {
      if (!p.player_id) continue // deleted player — kept in history, excluded from stats
      let entry = players.get(p.player_id)
      if (!entry) {
        entry = { name: p.player_name, gameIds: new Set(), tags: new Map() }
        players.set(p.player_id, entry)
      }
      entry.gameIds.add(g.id)
      entry.name = p.player_name
      const breakdownEntries = p.score_breakdown?.entries ?? []
      for (const e of breakdownEntries) {
        if (e.count <= 0) continue
        const tags = CARD_TAGS_BY_KEY.get(e.cardKey)
        if (!tags) continue
        for (const tag of tags) {
          if (!STRATEGY_TAGS.includes(tag)) continue
          const acc = entry.tags.get(tag) ?? { cards: 0, points: 0 }
          acc.cards += e.count
          acc.points += e.points
          entry.tags.set(tag, acc)
        }
      }
    }
  }

  const result: PlayerStrategies[] = []
  for (const [playerId, entry] of players) {
    const local = localById.get(playerId)
    const gamesPlayed = entry.gameIds.size
    const strategies: StrategyEntry[] = []
    for (const [tag, acc] of entry.tags) {
      strategies.push({
        tag,
        cards: acc.cards,
        totalPoints: acc.points,
        avgPointsPerGame: gamesPlayed > 0 ? Math.round(acc.points / gamesPlayed) : 0,
      })
    }
    strategies.sort((a, b) => b.totalPoints - a.totalPoints)
    const top = strategies.slice(0, 3).filter((s) => s.cards > 0)
    if (top.length === 0) continue
    result.push({
      playerId,
      name: local?.name ?? entry.name,
      color: local?.color ?? '#9ca3af',
      isLocal: !!local,
      gamesPlayed,
      topStrategies: top,
    })
  }

  result.sort((a, b) => b.gamesPlayed - a.gamesPlayed)
  return result
}

export interface TagAggregate {
  tag: CardTag
  totalCards: number
  totalPoints: number
  playerGames: number
  avgPointsPerPlayerGame: number
  byPlayer: { playerName: string; cards: number; points: number }[]
}

export function aggregateTagStats(games: GameWithPlayers[]): TagAggregate[] {
  const map = new Map<
    CardTag,
    {
      totalCards: number
      totalPoints: number
      playerGames: number
      byPlayer: Map<string, { cards: number; points: number }>
    }
  >()

  for (const g of games) {
    for (const p of g.players) {
      const entries = p.score_breakdown?.entries ?? []
      // Aggregate this player-game's contributions per tag first, so we can
      // count player-games (one per tag) regardless of how many distinct
      // cards of that tag the player held.
      const perTag = new Map<CardTag, { cards: number; points: number }>()
      for (const e of entries) {
        if (e.count <= 0) continue
        if (e.cardKey.startsWith('_')) continue
        const tags = CARD_TAGS_BY_KEY.get(e.cardKey)
        if (!tags) continue
        for (const tag of tags) {
          const acc = perTag.get(tag) ?? { cards: 0, points: 0 }
          acc.cards += e.count
          acc.points += e.points
          perTag.set(tag, acc)
        }
      }
      for (const [tag, acc] of perTag) {
        const overall =
          map.get(tag) ??
          { totalCards: 0, totalPoints: 0, playerGames: 0, byPlayer: new Map() }
        overall.totalCards += acc.cards
        overall.totalPoints += acc.points
        // Only count this player-game toward the avg-denominator if the tag
        // actually scored — holding a 0-point card shouldn't dilute the avg.
        if (acc.points > 0) overall.playerGames += 1
        const pe = overall.byPlayer.get(p.player_name) ?? { cards: 0, points: 0 }
        pe.cards += acc.cards
        pe.points += acc.points
        overall.byPlayer.set(p.player_name, pe)
        map.set(tag, overall)
      }
    }
  }

  const result: TagAggregate[] = []
  for (const [tag, acc] of map) {
    if (acc.playerGames === 0) continue
    result.push({
      tag,
      totalCards: acc.totalCards,
      totalPoints: acc.totalPoints,
      playerGames: acc.playerGames,
      avgPointsPerPlayerGame:
        Math.round((acc.totalPoints / acc.playerGames) * 10) / 10,
      byPlayer: [...acc.byPlayer.entries()]
        .map(([playerName, v]) => ({ playerName, ...v }))
        .sort((a, b) => b.points - a.points),
    })
  }
  result.sort((a, b) => b.avgPointsPerPlayerGame - a.avgPointsPerPlayerGame)
  return result
}

export interface HallOfFameRecord {
  playerName: string
  value: number
  detail?: string
  playedAt: string
}

export interface HallOfFame {
  topGameScore: HallOfFameRecord | null
  topCardScore: (HallOfFameRecord & { cardKey: string }) | null
  mostWins: { playerName: string; wins: number } | null
  totalGames: number
  totalPlayers: number
}

export function aggregateHallOfFame(
  rows: ReadonlyArray<{
    player_name: string
    total_score: number
    is_winner: boolean
    score_breakdown: { entries?: { cardKey: string; points: number }[] } | null
    played_at: string
  }>,
): HallOfFame {
  if (rows.length === 0) {
    return {
      topGameScore: null,
      topCardScore: null,
      mostWins: null,
      totalGames: 0,
      totalPlayers: 0,
    }
  }
  const top = rows[0]!
  const topGameScore: HallOfFameRecord = {
    playerName: top.player_name,
    value: top.total_score,
    playedAt: top.played_at,
  }

  let topCardScore: (HallOfFameRecord & { cardKey: string }) | null = null
  const winsByName = new Map<string, number>()
  const seenGames = new Set<string>()
  let totalGames = 0
  for (const row of rows) {
    if (row.is_winner) {
      winsByName.set(row.player_name, (winsByName.get(row.player_name) ?? 0) + 1)
    }
    const key = `${row.player_name}|${row.played_at}|${row.total_score}`
    if (!seenGames.has(key)) {
      seenGames.add(key)
      totalGames++
    }
    const entries = row.score_breakdown?.entries ?? []
    for (const e of entries) {
      if (e.cardKey.startsWith('_')) continue
      if (!topCardScore || e.points > topCardScore.value) {
        topCardScore = {
          playerName: row.player_name,
          value: e.points,
          cardKey: e.cardKey,
          playedAt: row.played_at,
        }
      }
    }
  }

  let mostWins: { playerName: string; wins: number } | null = null
  for (const [name, wins] of winsByName) {
    if (!mostWins || wins > mostWins.wins) mostWins = { playerName: name, wins }
  }

  const totalPlayers = new Set(rows.map((r) => r.player_name)).size

  return { topGameScore, topCardScore, mostWins, totalGames, totalPlayers }
}

export interface TagSynergyAggregate {
  iconKey: string
  totalPoints: number
  cardCount: number
  byPlayer: { playerName: string; points: number }[]
}

import { getMultiplierIconKeys } from './scoring/multiplier-stats'

export function aggregateTagSynergies(games: GameWithPlayers[]): TagSynergyAggregate[] {
  const map = new Map<
    string,
    { totalPoints: number; cardKeys: Set<string>; byPlayer: Map<string, number> }
  >()

  for (const g of games) {
    const edition = g.edition ?? 'classic'
    for (const p of g.players) {
      const entries = p.score_breakdown?.entries ?? []
      for (const e of entries) {
        if (e.cardKey.startsWith('_')) continue
        if (e.points <= 0) continue
        const iconKeys = getMultiplierIconKeys(e.cardKey, edition)
        if (iconKeys.length === 0) continue
        for (const iconKey of iconKeys) {
          const acc =
            map.get(iconKey) ??
            { totalPoints: 0, cardKeys: new Set<string>(), byPlayer: new Map<string, number>() }
          acc.totalPoints += e.points
          acc.cardKeys.add(e.cardKey)
          acc.byPlayer.set(
            p.player_name,
            (acc.byPlayer.get(p.player_name) ?? 0) + e.points,
          )
          map.set(iconKey, acc)
        }
      }
    }
  }

  return [...map.entries()]
    .map(([iconKey, acc]) => ({
      iconKey,
      totalPoints: acc.totalPoints,
      cardCount: acc.cardKeys.size,
      byPlayer: [...acc.byPlayer.entries()]
        .map(([playerName, points]) => ({ playerName, points }))
        .sort((a, b) => b.points - a.points),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

export interface AtAGlanceMetrics {
  totalGames: number
  avgScore: number
  bestScore: number
}

export function computeAtAGlance(games: GameWithPlayers[]): AtAGlanceMetrics {
  if (games.length === 0) return { totalGames: 0, avgScore: 0, bestScore: 0 }
  const allScores: number[] = []
  for (const g of games) {
    for (const p of g.players) allScores.push(p.total_score)
  }
  if (allScores.length === 0) {
    return { totalGames: games.length, avgScore: 0, bestScore: 0 }
  }
  const sum = allScores.reduce((a, b) => a + b, 0)
  return {
    totalGames: games.length,
    avgScore: Math.round(sum / allScores.length),
    bestScore: Math.max(...allScores),
  }
}
