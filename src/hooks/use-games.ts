import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchGames,
  fetchGame,
  createGame,
  deleteGame,
} from '@/lib/supabase-api'
import type { GameWithPlayers } from '@/types/game'

const GAMES_KEY = ['games'] as const

export function useGames() {
  return useQuery({
    queryKey: GAMES_KEY,
    queryFn: fetchGames,
  })
}

export function useGame(id: string | undefined) {
  return useQuery({
    queryKey: [...GAMES_KEY, id],
    queryFn: () => fetchGame(id!),
    enabled: !!id,
  })
}

export function useCreateGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (game: GameWithPlayers) => createGame(game),
    onSuccess: () => qc.invalidateQueries({ queryKey: GAMES_KEY }),
  })
}

export function useDeleteGame() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteGame(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GAMES_KEY }),
  })
}
