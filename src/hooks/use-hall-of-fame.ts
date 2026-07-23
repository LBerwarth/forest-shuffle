import { useQuery } from '@tanstack/react-query'
import { fetchHallOfFame } from '@/lib/supabase-api'

export function useHallOfFame(
  playerCount?: number | 'group',
  edition?: 'classic' | 'dartmoor',
) {
  return useQuery({
    queryKey: ['hall-of-fame', playerCount ?? 'all', edition ?? 'all'],
    queryFn: () => fetchHallOfFame(playerCount, edition),
    staleTime: 10 * 60 * 1000,
  })
}
