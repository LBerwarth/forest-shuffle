import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Save, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultsDisplay } from '@/components/scoring/ResultsDisplay'
import { useScoringStore } from '@/store/scoring-store'
import { useCreateGame } from '@/hooks/use-games'
import type { GameWithPlayers, GamePlayer } from '@/types/game'

export function GameResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { players, edition, endSession, recalculateAll } = useScoringStore()
  const createGameMutation = useCreateGame()

  // Recalculate to ensure cross-player scoring is current
  useMemo(() => recalculateAll(), [recalculateAll])

  const rankedPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => (b.breakdown?.total ?? 0) - (a.breakdown?.total ?? 0))
      .map((p, idx) => ({ ...p, rank: idx + 1 }))
  }, [players])

  const winner = rankedPlayers[0]

  async function handleSave() {
    if (!gameId) return

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

    await createGameMutation.mutateAsync(game)
    endSession()
    navigate('/history')
  }

  function handleNewGame() {
    endSession()
    navigate('/new-game')
  }

  if (!winner) {
    navigate('/new-game')
    return null
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-8">
      <div className="flex justify-end mb-2">
        <Link to="/settings" className="text-forest-500">
          <Settings className="h-5 w-5" />
        </Link>
      </div>

      <ResultsDisplay rankedPlayers={rankedPlayers} edition={edition} />

      {/* Actions */}
      <div className="space-y-2">
        <Button size="lg" className="w-full" onClick={handleSave}>
          <Save className="h-5 w-5" />
          {t('result.saveGame')}
        </Button>
        <Button variant="secondary" size="lg" className="w-full" onClick={handleNewGame}>
          <RotateCcw className="h-5 w-5" />
          {t('result.newGame')}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
          <Home className="h-4 w-4" />
          {t('result.home')}
        </Button>
      </div>
    </div>
  )
}
