import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trophy, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useGameStore } from '@/store/game-store'
import { CATEGORY_ORDER } from '@/data/categories'
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export function PlayerDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const player = useGameStore((s) => s.players.find((p) => p.id === id))
  const games = useGameStore((s) => s.games)

  const playerGames = useMemo(() => {
    return games
      .filter((g) => g.players.some((p) => p.player_id === id))
      .map((g) => ({
        ...g,
        playerData: g.players.find((p) => p.player_id === id)!,
      }))
      .sort((a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime())
  }, [games, id])

  const stats = useMemo(() => {
    if (playerGames.length === 0) return null
    const scores = playerGames.map((g) => g.playerData.total_score)
    const wins = playerGames.filter((g) => g.playerData.is_winner).length
    return {
      gamesPlayed: playerGames.length,
      wins,
      winRate: Math.round((wins / playerGames.length) * 100),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      bestScore: Math.max(...scores),
    }
  }, [playerGames])

  const radarData = useMemo(() => {
    if (playerGames.length === 0) return []
    const totals: Record<string, number> = {}
    for (const g of playerGames) {
      const bd = g.playerData.score_breakdown
      if (!bd) continue
      for (const [cat, pts] of Object.entries(bd.categoryTotals)) {
        totals[cat] = (totals[cat] || 0) + pts
      }
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: t(`category.${cat}`),
      value: Math.round((totals[cat] || 0) / playerGames.length),
    }))
  }, [playerGames, t])

  const scoreHistory = useMemo(() => {
    return playerGames.map((g, idx) => ({
      game: idx + 1,
      score: g.playerData.total_score,
      date: new Date(g.played_at).toLocaleDateString(i18n.language),
    }))
  }, [playerGames, i18n.language])

  if (!player) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-8 text-center">
        <p className="text-forest-500">{t('playerDetail.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
            style={{ backgroundColor: player.color }}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-heading text-xl font-bold text-forest-800">{player.name}</h1>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card>
            <CardContent className="py-3 text-center">
              <Trophy className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-forest-600">{stats.wins}</p>
              <p className="text-[10px] text-forest-400">{t('playerDetail.wins', { rate: stats.winRate })}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <Target className="h-4 w-4 text-forest-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-forest-600">{stats.avgScore}</p>
              <p className="text-[10px] text-forest-400">{t('playerDetail.avgScore')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <TrendingUp className="h-4 w-4 text-forest-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-forest-600">{stats.bestScore}</p>
              <p className="text-[10px] text-forest-400">{t('playerDetail.bestScore')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy Radar */}
      {radarData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('playerDetail.strategyProfile')}</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#d4e6d4" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#4a7c59' }} />
                <Radar
                  dataKey="value"
                  stroke="#4a7c59"
                  fill="#4a7c59"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Score History */}
      {scoreHistory.length > 1 && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('playerDetail.scoreHistory')}</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4e6d4" />
                <XAxis dataKey="game" tick={{ fontSize: 11 }} stroke="#8cc08c" />
                <YAxis tick={{ fontSize: 11 }} stroke="#8cc08c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f0f5f0',
                    border: '1px solid #d4e6d4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#4a7c59" strokeWidth={2} dot={{ fill: '#4a7c59' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Game list */}
      <Card>
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">{t('playerDetail.gameHistory')}</h2>
        </CardHeader>
        <CardContent>
          {playerGames.length === 0 ? (
            <p className="text-sm text-forest-400 text-center py-4">{t('playerDetail.noGames')}</p>
          ) : (
            <div className="space-y-2">
              {[...playerGames].reverse().map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => navigate(`/history/${g.id}`)}
                  className="flex w-full items-center justify-between rounded-lg bg-forest-50 px-3 py-2 text-left hover:bg-forest-100 transition-colors"
                >
                  <div>
                    <p className="text-xs text-forest-400">{new Date(g.played_at).toLocaleDateString(i18n.language)}</p>
                    <p className="text-sm text-forest-600">
                      {g.playerData.is_winner && '🏆 '}
                      {t('playerDetail.rank', { rank: g.playerData.rank, count: g.player_count })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-forest-600 tabular-nums">
                    {g.playerData.total_score} {t('scoring.pts')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
