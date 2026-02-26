import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CardMetadata, ScoreBreakdown } from '@/types/scoring'
import type { Expansion } from '@/types/card'
import { computeScoreBreakdown } from '@/lib/scoring'
import { getCards } from '@/data/cards'

export interface PlayerScoring {
  playerId: string
  playerName: string
  cardCounts: Record<string, number>
  cardMetadata: Record<string, CardMetadata>
  fullyOccupiedTrees: number
  breakdown: ScoreBreakdown | null
}

interface ScoringState {
  // Game session
  sessionActive: boolean
  expansions: Expansion[]
  players: PlayerScoring[]
  currentPlayerIndex: number
  currentStep: number

  // Actions
  startSession: (playerNames: { id: string; name: string }[], expansions: Expansion[]) => void
  endSession: () => void
  setCurrentPlayer: (index: number) => void
  setCurrentStep: (step: number) => void
  setCardCount: (playerId: string, cardKey: string, count: number) => void
  setCardMetadata: (playerId: string, cardKey: string, metadata: Partial<CardMetadata>) => void
  setFullyOccupiedTrees: (playerId: string, count: number) => void
  recalculateAll: () => void
  getPlayerBreakdown: (playerId: string) => ScoreBreakdown | null
}

function recalcPlayer(player: PlayerScoring, allPlayers: PlayerScoring[], expansions: Expansion[]): ScoreBreakdown {
  const activeCardKeys = getCards(expansions).map((c) => c.key)
  const allLindenCounts = allPlayers.map((p) => p.cardCounts['linden'] || 0)
  const allTreeCounts = allPlayers.map((p) => {
    const treeCards = getCards(expansions).filter((c) => c.category === 'tree')
    return treeCards.reduce((sum, c) => sum + (p.cardCounts[c.key] || 0), 0)
  })

  return computeScoreBreakdown(
    player.cardCounts,
    player.cardMetadata,
    player.fullyOccupiedTrees,
    activeCardKeys,
    allLindenCounts,
    allTreeCounts,
  )
}

export const useScoringStore = create<ScoringState>()(
  persist(
    (set, get) => ({
      sessionActive: false,
      expansions: ['base'] as Expansion[],
      players: [],
      currentPlayerIndex: 0,
      currentStep: 0,

      startSession: (playerNames, expansions) => {
        const players: PlayerScoring[] = playerNames.map(({ id, name }) => ({
          playerId: id,
          playerName: name,
          cardCounts: {},
          cardMetadata: {},
          fullyOccupiedTrees: 0,
          breakdown: null,
        }))
        set({ sessionActive: true, players, expansions, currentPlayerIndex: 0, currentStep: 0 })
      },

      endSession: () => {
        set({ sessionActive: false, players: [], currentPlayerIndex: 0, currentStep: 0 })
      },

      setCurrentPlayer: (index) => set({ currentPlayerIndex: index }),
      setCurrentStep: (step) => set({ currentStep: step }),

      setCardCount: (playerId, cardKey, count) => {
        const state = get()
        const players = state.players.map((p) => {
          if (p.playerId !== playerId) return p
          const cardCounts = { ...p.cardCounts, [cardKey]: Math.max(0, count) }
          const cardMetadata = { ...p.cardMetadata }
          if (!cardMetadata[cardKey]) {
            cardMetadata[cardKey] = { count: Math.max(0, count) }
          } else {
            cardMetadata[cardKey] = { ...cardMetadata[cardKey], count: Math.max(0, count) }
          }
          return { ...p, cardCounts, cardMetadata }
        })
        // Recalculate all players (cross-player cards)
        const updatedPlayers = players.map((p) => ({
          ...p,
          breakdown: recalcPlayer(p, players, state.expansions),
        }))
        set({ players: updatedPlayers })
      },

      setCardMetadata: (playerId, cardKey, metadata) => {
        const state = get()
        const players = state.players.map((p) => {
          if (p.playerId !== playerId) return p
          const existing = p.cardMetadata[cardKey] || { count: 0 }
          return {
            ...p,
            cardMetadata: {
              ...p.cardMetadata,
              [cardKey]: { ...existing, ...metadata },
            },
          }
        })
        const updatedPlayers = players.map((p) => ({
          ...p,
          breakdown: recalcPlayer(p, players, state.expansions),
        }))
        set({ players: updatedPlayers })
      },

      setFullyOccupiedTrees: (playerId, count) => {
        const state = get()
        const players = state.players.map((p) => {
          if (p.playerId !== playerId) return p
          return { ...p, fullyOccupiedTrees: Math.max(0, count) }
        })
        const updatedPlayers = players.map((p) => ({
          ...p,
          breakdown: recalcPlayer(p, players, state.expansions),
        }))
        set({ players: updatedPlayers })
      },

      recalculateAll: () => {
        const state = get()
        const updatedPlayers = state.players.map((p) => ({
          ...p,
          breakdown: recalcPlayer(p, state.players, state.expansions),
        }))
        set({ players: updatedPlayers })
      },

      getPlayerBreakdown: (playerId) => {
        const player = get().players.find((p) => p.playerId === playerId)
        return player?.breakdown ?? null
      },
    }),
    {
      name: 'forest-shuffle-scoring',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
