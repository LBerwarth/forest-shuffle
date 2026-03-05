import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultsDisplay, type RankedPlayer } from '@/components/scoring/ResultsDisplay'
import { useLiveSession } from '@/hooks/use-live-session'
import { useLiveSessionStore } from '@/store/live-session-store'
import { recalcPlayer } from '@/lib/scoring/recalc'
import { useCreateGame } from '@/hooks/use-games'
import { updateLiveSessionStatus } from '@/lib/supabase-api'
import type { GameWithPlayers, GamePlayer } from '@/types/game'

export function LiveResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { session, players: livePlayers, allDone, isLoading } = useLiveSession(sessionId)
  const { isHost, clearSession } = useLiveSessionStore()
  const createGameMutation = useCreateGame()

  // Compute cross-player scoring from all submitted data
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

    return withBreakdowns
      .sort((a, b) => (b.breakdown?.total ?? 0) - (a.breakdown?.total ?? 0))
      .map((p, idx) => ({
        playerId: p.playerId,
        playerName: p.playerName,
        breakdown: p.breakdown,
        rank: idx + 1,
      }))
  }, [session, allDone, livePlayers])

  async function handleSave() {
    if (!sessionId || !session || rankedPlayers.length === 0) return

    const gameId = crypto.randomUUID()
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

    await createGameMutation.mutateAsync(game)
    await updateLiveSessionStatus(sessionId, 'completed')
    clearSession()
    navigate('/history')
  }

  function handleHome() {
    clearSession()
    navigate('/')
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

      <div className="space-y-2">
        {isHost && (
          <Button size="lg" className="w-full" onClick={handleSave}>
            <Save className="h-5 w-5" />
            {t('result.saveGame')}
          </Button>
        )}
        <Button variant="ghost" className="w-full" onClick={handleHome}>
          <Home className="h-4 w-4" />
          {t('result.home')}
        </Button>
      </div>
    </div>
  )
}
