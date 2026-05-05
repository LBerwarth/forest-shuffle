import { useQuery } from '@tanstack/react-query'
import { fetchGlobalGamePlayers } from '@/lib/supabase-api'

export function useHallOfFame() {
  return useQuery({
    queryKey: ['hall-of-fame'],
    queryFn: fetchGlobalGamePlayers,
    staleTime: 10 * 60 * 1000,
  })
}
