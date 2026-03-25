import { useMemo, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, RotateCcw, Settings, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultsDisplay } from '@/components/scoring/ResultsDisplay'
import { useScoringStore } from '@/store/scoring-store'
import { useCreateGame } from '@/hooks/use-games'
import { recalcPlayer } from '@/lib/scoring/recalc'
import type { GameWithPlayers, GamePlayer } from '@/types/game'

export function GameResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { players, expansions, edition, endSession } = useScoringStore()
  const createGameMutation = useCreateGame()
  const savedRef = useRef(false)

  // Recalculate with cross-player data to ensure comparison cards are scored correctly
  const rankedPlayers = useMemo(() => {
    const recalculated = players.map((p) => ({
      ...p,
      breakdown: recalcPlayer(p, players, expansions, edition),
    }))
    return recalculated
      .sort((a, b) => (b.breakdown?.total ?? 0) - (a.breakdown?.total ?? 0))
      .map((p, idx) => ({ ...p, rank: idx + 1 }))
  }, [players, expansions, edition])

  const winner = rankedPlayers[0]

  // Auto-save game when results are ready
  useEffect(() => {
    if (!gameId || !winner || savedRef.current || createGameMutation.isPending) return
    savedRef.current = true

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
      player_count: players.length,
      edition: edition !== 'classic' ? edition : undefined,
      players: gamePlayers,
    }

    createGameMutation.mutateAsync(game).catch(() => {
      savedRef.current = false
    })
  }, [gameId, winner, rankedPlayers, players.length, edition, createGameMutation])

  function handleNewGame() {
    endSession()
    navigate('/new-game')
  }

  if (!winner) {
    return <Navigate to="/new-game" replace />
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <div className="flex justify-end mb-2">
        <Link to="/settings" className="text-forest-500">
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <ResultsDisplay rankedPlayers={rankedPlayers} edition={edition} />

      {/* Save status */}
      {createGameMutation.isPending && (
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
        <Button variant="ghost" className="w-full" onClick={() => { endSession(); navigate('/') }}>
          <Home className="h-4 w-4" />
          {t('result.home')}
        </Button>
      </div>
    </div>
  )
}
