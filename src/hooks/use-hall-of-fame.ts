import { useQuery } from '@tanstack/react-query'
import { fetchHallOfFame, type HallOfFameParams } from '@/lib/supabase-api'

export function useHallOfFame(params: HallOfFameParams) {
  const { playerCount, edition, since, myScore } = params
  return useQuery({
    queryKey: [
      'hall-of-fame',
      playerCount ?? 'all',
      edition ?? 'all',
      since ? since.toISOString().slice(0, 10) : 'all',
      myScore ?? 0,
    ],
    queryFn: () => fetchHallOfFame(params),
    staleTime: 10 * 60 * 1000,
  })
}
