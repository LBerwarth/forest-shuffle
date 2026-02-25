import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trophy, Home, Save, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useScoringStore } from '@/store/scoring-store'
import { useGameStore } from '@/store/game-store'
import { CATEGORY_ICONS, CATEGORY_ORDER } from '@/data/categories'
import type { GameWithPlayers, GamePlayer } from '@/types/game'
import { cn } from '@/lib/utils'

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export function GameResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const { players, endSession, recalculateAll } = useScoringStore()
  const addGame = useGameStore((s) => s.addGame)

  // Recalculate to ensure cross-player scoring is current
  useMemo(() => recalculateAll(), [recalculateAll])

  const rankedPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => (b.breakdown?.total ?? 0) - (a.breakdown?.total ?? 0))
      .map((p, idx) => ({ ...p, rank: idx + 1 }))
  }, [players])

  const winner = rankedPlayers[0]

  function handleSave() {
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
      players: gamePlayers,
    }

    addGame(game)
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
      {/* Winner announcement */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8 text-center"
      >
        <div className="mb-3 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold text-forest-800">
          {t('result.wins', { name: winner.playerName })}
        </h1>
        <p className="mt-1 text-3xl font-bold text-forest-600 tabular-nums">
          {t('result.points', { count: winner.breakdown?.total ?? 0 })}
        </p>
      </motion.div>

      {/* Podium */}
      <div className="mb-6 space-y-2">
        {rankedPlayers.map((player, idx) => (
          <motion.div
            key={player.playerId}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={cn(idx === 0 && 'border-yellow-300 bg-yellow-50/50')}>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                    style={{
                      backgroundColor: MEDAL_COLORS[idx] ?? '#94a3b8',
                    }}
                  >
                    {player.rank}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest-700 truncate">
                      {player.playerName}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-forest-600 tabular-nums">
                      {player.breakdown?.total ?? 0}
                    </p>
                  </div>
                </div>

                {/* Category breakdown */}
                {player.breakdown && (
                  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                    {CATEGORY_ORDER.map((cat) => {
                      const pts = player.breakdown?.categoryTotals[cat]
                      if (!pts || pts <= 0) return null
                      return (
                        <span
                          key={cat}
                          className="whitespace-nowrap rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-medium text-forest-600"
                        >
                          {t(`category.${cat}`)}: {pts}
                        </span>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detailed breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-heading text-lg font-semibold text-forest-700">
            {t('result.scoreBreakdown')}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-forest-200">
                  <th className="text-left py-2 pr-2 font-medium text-forest-500">{t('result.category')}</th>
                  {rankedPlayers.map((p) => (
                    <th key={p.playerId} className="text-right py-2 px-1 font-medium text-forest-500 truncate max-w-[80px]">
                      {p.playerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORY_ORDER.map((cat) => (
                  <tr key={cat} className="border-b border-forest-100">
                    <td className="py-1.5 pr-2 text-forest-600">{CATEGORY_ICONS[cat]} {t(`category.${cat}`)}</td>
                    {rankedPlayers.map((p) => (
                      <td key={p.playerId} className="text-right py-1.5 px-1 tabular-nums text-forest-700">
                        {p.breakdown?.categoryTotals[cat] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2 pr-2 text-forest-700">{t('result.total')}</td>
                  {rankedPlayers.map((p) => (
                    <td key={p.playerId} className="text-right py-2 px-1 tabular-nums text-forest-700">
                      {p.breakdown?.total ?? 0}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
