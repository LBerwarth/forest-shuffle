import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchLiveSession, fetchLiveSessionPlayers } from '@/lib/supabase-api'
import { useLiveSessionStore } from '@/store/live-session-store'

export function useLiveSession(sessionId: string | undefined) {
  const queryClient = useQueryClient()
  const myPlayerId = useLiveSessionStore((s) => s.myPlayerId)
  const isHost = useLiveSessionStore((s) => s.isHost)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const prevPlayersRef = useRef<string>('')

  const sessionQuery = useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: () => fetchLiveSession(sessionId!),
    enabled: !!sessionId,
    // Poll every 5s as fallback when Realtime is not connected
    refetchInterval: realtimeConnected ? false : 5000,
  })

  const playersQuery = useQuery({
    queryKey: ['live-session-players', sessionId],
    queryFn: () => fetchLiveSessionPlayers(sessionId!),
    enabled: !!sessionId,
    refetchInterval: realtimeConnected ? false : 5000,
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
      .subscribe((status) => {
        setRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase!.removeChannel(channel)
      setRealtimeConnected(false)
    }
  }, [sessionId, queryClient])

  const session = sessionQuery.data ?? null
  const players = playersQuery.data ?? []
  const allDone = players.length > 0 && players.every((p) => p.status === 'done')

  // Track when a player finishes and notify
  useEffect(() => {
    const currentKey = players.map((p) => `${p.player_id}:${p.status}`).join(',')
    if (prevPlayersRef.current && prevPlayersRef.current !== currentKey) {
      const prevStatuses = new Map(
        prevPlayersRef.current.split(',').filter(Boolean).map((s) => {
          const [id, status] = s.split(':')
          return [id, status] as [string, string]
        }),
      )
      for (const p of players) {
        if (p.status === 'done' && prevStatuses.get(p.player_id) !== 'done' && p.player_id !== myPlayerId) {
          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${p.player_name} has finished scoring!`)
          }
        }
      }
    }
    prevPlayersRef.current = currentKey
  }, [players, myPlayerId])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

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
