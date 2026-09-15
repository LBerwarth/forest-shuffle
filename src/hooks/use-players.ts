import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '@/lib/supabase-api'
import type { Player } from '@/types/player'

const PLAYERS_KEY = ['players'] as const

export function usePlayers() {
  return useQuery({
    queryKey: PLAYERS_KEY,
    queryFn: fetchPlayers,
  })
}

export function useCreatePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (player: Omit<Player, 'created_at'>) => createPlayer(player),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}

export function useUpdatePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Player, 'name' | 'color'>>
    }) => updatePlayer(id, updates),
    // A rename is mirrored onto game_players by a DB trigger (migration 018).
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLAYERS_KEY })
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: ['hall-of-fame'] })
    },
  })
}

export function useDeletePlayer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLAYERS_KEY }),
  })
}
