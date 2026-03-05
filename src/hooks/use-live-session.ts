import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchLiveSession, fetchLiveSessionPlayers } from '@/lib/supabase-api'
import { useLiveSessionStore } from '@/store/live-session-store'

export function useLiveSession(sessionId: string | undefined) {
  const queryClient = useQueryClient()
  const myPlayerId = useLiveSessionStore((s) => s.myPlayerId)
  const isHost = useLiveSessionStore((s) => s.isHost)

  const sessionQuery = useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: () => fetchLiveSession(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false,
  })

  const playersQuery = useQuery({
    queryKey: ['live-session-players', sessionId],
    queryFn: () => fetchLiveSessionPlayers(sessionId!),
    enabled: !!sessionId,
    refetchInterval: false,
  })

  // Subscribe to realtime changes
  useEffect(() => {
    if (!sessionId || !supabase) return

    const channel = supabase
      .channel(`live-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions',
          filter: `id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] })
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_players',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['live-session-players', sessionId] })
        },
      )
      .subscribe()

    return () => {
      supabase!.removeChannel(channel)
    }
  }, [sessionId, queryClient])

  const session = sessionQuery.data ?? null
  const players = playersQuery.data ?? []
  const allDone = players.length > 0 && players.every((p) => p.status === 'done')

  return {
    session,
    players,
    allDone,
    isHost,
    myPlayerId,
    isLoading: sessionQuery.isLoading || playersQuery.isLoading,
    refetch: () => {
      sessionQuery.refetch()
      playersQuery.refetch()
    },
  }
}
