import { useQuery } from '@tanstack/react-query'
import { fetchGlobalGamePlayers } from '@/lib/supabase-api'

export function useHallOfFame(playerCount?: number | 'group') {
  return useQuery({
    queryKey: ['hall-of-fame', playerCount ?? 'all'],
    queryFn: () => fetchGlobalGamePlayers(playerCount),
    staleTime: 10 * 60 * 1000,
  })
}
