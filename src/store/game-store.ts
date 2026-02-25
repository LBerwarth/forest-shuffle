import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Player } from '@/types/player'
import type { GameWithPlayers } from '@/types/game'

interface GameState {
  players: Player[]
  games: GameWithPlayers[]

  // Player CRUD
  addPlayer: (player: Player) => void
  updatePlayer: (id: string, updates: Partial<Player>) => void
  removePlayer: (id: string) => void

  // Game CRUD
  addGame: (game: GameWithPlayers) => void
  removeGame: (id: string) => void

  // Getters
  getPlayer: (id: string) => Player | undefined
  getGame: (id: string) => GameWithPlayers | undefined
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      games: [],

      addPlayer: (player) => set((state) => ({
        players: [...state.players, player],
      })),

      updatePlayer: (id, updates) => set((state) => ({
        players: state.players.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),

      removePlayer: (id) => set((state) => ({
        players: state.players.filter((p) => p.id !== id),
      })),

      addGame: (game) => set((state) => ({
        games: [game, ...state.games],
      })),

      removeGame: (id) => set((state) => ({
        games: state.games.filter((g) => g.id !== id),
      })),

      getPlayer: (id) => get().players.find((p) => p.id === id),
      getGame: (id) => get().games.find((g) => g.id === id),
    }),
    {
      name: 'forest-shuffle-games',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
