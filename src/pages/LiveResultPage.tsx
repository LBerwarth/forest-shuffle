import { useMemo, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Home, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultsDisplay, type RankedPlayer } from '@/components/scoring/ResultsDisplay'
import { GameInsights } from '@/components/scoring/GameInsights'
import { useLiveSession } from '@/hooks/use-live-session'
import { useLiveSessionStore } from '@/store/live-session-store'
import { recalcPlayer } from '@/lib/scoring/recalc'
import { useSaveGame } from '@/hooks/use-games'
import { updateLivePlayerStatus, updateLiveSessionStatus } from '@/lib/supabase-api'
import { getOrCreateLocalGameId } from '@/lib/local-game-id'
import type { GameWithPlayers, GamePlayer } from '@/types/game'

export function LiveResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { session, players: livePlayers, allDone, isLoading } = useLiveSession(sessionId)
  const { isHost, myPlayerId, clearSession } = useLiveSessionStore()
  const saveGameMutation = useSaveGame()
  const savedRef = useRef(false)

  // Compute cross-player scoring from all submitted data, then assign
  // competition ranks (1,1,3,4 style) so tied players share the same rank.
  const rankedPlayers = useMemo<RankedPlayer[]>(() => {
    if (!session || !allDone || livePlayers.length === 0) return []

    const scoringData = livePlayers.map((p) => ({
      playerId: p.player_id,
      playerName: p.player_name,
      cardCounts: p.card_counts,
      cardMetadata: p.card_metadata,
      fullyOccupiedTrees: p.fully_occupied_trees,
    }))

    const withBreakdowns = scoringData.map((player) => ({
      ...player,
      breakdown: recalcPlayer(player, scoringData, session.expansions, session.edition),
    }))

    const sorted = withBreakdowns.sort(
      (a, b) => (b.breakdown?.total ?? 0) - (a.breakdown?.total ?? 0),
    )
    let lastScore = Infinity
    let currentRank = 0
    return sorted.map((p, idx) => {
      const score = p.breakdown?.total ?? 0
      if (score < lastScore) {
        currentRank = idx + 1
        lastScore = score
      }
      return {
        playerId: p.playerId,
        playerName: p.playerName,
        breakdown: p.breakdown,
        rank: currentRank,
      }
    })
  }, [session, allDone, livePlayers])

  // Auto-save game when results are ready. Each device persists its own
  // stable gameId for this session in localStorage so Edit Scores → finish
  // is idempotent on this device, while host and other players each save
  // their own copy of the game into their own device-scoped history
  // without primary-key collisions on the shared sessionId.
  useEffect(() => {
    if (!sessionId || !session || rankedPlayers.length === 0 || savedRef.current || saveGameMutation.isPending) return
    savedRef.current = true

    const gameId = getOrCreateLocalGameId(sessionId)
    const gamePlayers: GamePlayer[] = rankedPlayers.map((p) => ({
      id: crypto.randomUUID(),
      game_id: gameId,
      player_id: p.playerId,
      player_name: p.playerName,
      total_score: p.breakdown?.total ?? 0,
      rank: p.rank,
      is_winner: p.rank === 1,
      score_breakdown: p.breakdown!,
    }))

    const game: GameWithPlayers = {
      id: gameId,
      played_at: new Date().toISOString(),
      player_count: rankedPlayers.length,
      edition: session.edition !== 'classic' ? session.edition : undefined,
      players: gamePlayers,
    }

    saveGameMutation.mutateAsync(game).then(() => {
      if (isHost) {
        updateLiveSessionStatus(sessionId, 'completed')
      }
    }).catch((err) => {
      // Keep savedRef true on failure so the effect doesn't tight-loop the
      // failing save (used to spin "saving in progress" forever). User can
      // refresh or use Edit Scores → finish again to retry.
      console.error('Failed to save live game:', err)
    })
  }, [sessionId, session, rankedPlayers, isHost, saveGameMutation])

  async function handleEditScores() {
    if (myPlayerId && sessionId) {
      await updateLivePlayerStatus(myPlayerId, sessionId, 'scoring')
      navigate(`/live/${sessionId}/score`)
    }
  }

  function handleHome() {
    navigate('/')
    clearSession()
  }

  if (isLoading || !allDone) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <ResultsDisplay rankedPlayers={rankedPlayers} edition={session?.edition ?? 'classic'} />

      <GameInsights rankedPlayers={rankedPlayers} />

      {/* Save status */}
      {saveGameMutation.isPending && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-forest-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('result.saving')}
        </div>
      )}

      <div className="space-y-2">
        <Button size="lg" className="w-full" onClick={handleEditScores}>
          <ArrowLeft className="h-5 w-5" />
          {t('result.editScores')}
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleHome}>
          <Home className="h-4 w-4" />
          {t('result.home')}
        </Button>
      </div>
    </div>
  )
}
