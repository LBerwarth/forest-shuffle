import { useMemo, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, RotateCcw, Settings, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultsDisplay } from '@/components/scoring/ResultsDisplay'
import { GameInsights } from '@/components/scoring/GameInsights'
import { useScoringStore } from '@/store/scoring-store'
import { useSaveGame } from '@/hooks/use-games'
import { recalcPlayer } from '@/lib/scoring/recalc'
import type { GameWithPlayers, GamePlayer } from '@/types/game'

export function GameResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { players, expansions, edition, endSession } = useScoringStore()
  const saveGameMutation = useSaveGame()
  const savedRef = useRef(false)

  // Recalculate with cross-player data to ensure comparison cards are scored
  // correctly, then assign competition ranks (1,1,3,4 style) so tied players
  // share the same rank instead of one being arbitrarily picked as #1.
  const rankedPlayers = useMemo(() => {
    const recalculated = players.map((p) => ({
      ...p,
      breakdown: recalcPlayer(p, players, expansions, edition),
    }))
    const sorted = recalculated.sort(
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
      return { ...p, rank: currentRank }
    })
  }, [players, expansions, edition])

  const winner = rankedPlayers[0]

  // Auto-save game when results are ready. saveGameMutation is idempotent on
  // game.id, so re-finishing after Edit Scores replaces the prior record
  // instead of inserting a duplicate.
  useEffect(() => {
    if (!gameId || !winner || savedRef.current || saveGameMutation.isPending) return
    savedRef.current = true

    const gamePlayers: GamePlayer[] = rankedPlayers.map((p) => ({
      id: crypto.randomUUID(),
      game_id: gameId,
      player_id: p.playerId,
      player_name: p.playerName,
      total_score: p.breakdown?.total ?? 0,
      rank: p.rank,
      // Solo games have no winner — rank 1 is guaranteed, not earned.
      is_winner: players.length >= 2 && p.rank === 1,
      score_breakdown: p.breakdown!,
    }))

    const game: GameWithPlayers = {
      id: gameId,
      played_at: new Date().toISOString(),
      player_count: players.length,
      edition: edition !== 'classic' ? edition : undefined,
      players: gamePlayers,
    }

    saveGameMutation.mutateAsync(game).catch((err) => {
      // Keep savedRef true on failure so the effect doesn't tight-loop the
      // failing save. User can refresh or use Edit Scores → finish again
      // to retry instead of seeing "Saving..." forever.
      console.error('Failed to save game:', err)
    })
  }, [gameId, winner, rankedPlayers, players.length, edition, saveGameMutation])

  function handleNewGame() {
    // Navigate first so the result page unmounts before endSession() clears
    // the players array — otherwise the !winner guard below races the route
    // change and replaces the URL with /new-game (which the bottom nav labels
    // "Score", confusing users who actually want Home).
    navigate('/new-game')
    endSession()
  }

  if (!winner) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <div className="flex justify-end mb-2">
        <Link to="/settings" className="text-forest-500">
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <ResultsDisplay rankedPlayers={rankedPlayers} edition={edition} />

      <GameInsights rankedPlayers={rankedPlayers} />

      {/* Save status */}
      {saveGameMutation.isPending && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-forest-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('result.saving')}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Button size="lg" className="w-full" onClick={() => navigate(`/score/${gameId}`)}>
          <ArrowLeft className="h-5 w-5" />
          {t('result.editScores')}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={handleNewGame}>
          <RotateCcw className="h-5 w-5" />
          {t('result.newGame')}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => { navigate('/'); endSession() }}>
          <Home className="h-4 w-4" />
          {t('result.home')}
        </Button>
      </div>
    </div>
  )
}
