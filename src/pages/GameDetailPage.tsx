import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useGameStore } from '@/store/game-store'
import { CATEGORY_ICONS, CATEGORY_ORDER } from '@/data/categories'

export function GameDetailPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const game = useGameStore((s) => s.games.find((g) => g.id === id))

  if (!game) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-8 text-center">
        <p className="text-forest-500">{t('gameDetail.notFound')}</p>
      </div>
    )
  }

  const sortedPlayers = [...game.players].sort((a, b) => a.rank - b.rank)

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-heading text-xl font-bold text-forest-800">{t('gameDetail.title')}</h1>
          <div className="flex items-center gap-3 text-xs text-forest-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(game.played_at).toLocaleDateString(i18n.language, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {t('gameDetail.playerCount', { count: game.player_count })}
            </span>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="space-y-2 mb-6">
        {sortedPlayers.map((p) => (
          <Card key={p.id} className={p.is_winner ? 'border-yellow-300 bg-yellow-50/50' : undefined}>
            <CardContent className="py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-100 text-sm font-bold text-forest-600 shrink-0">
                  #{p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-forest-700 truncate">
                    {p.is_winner && '🏆 '}{p.player_name}
                  </p>
                </div>
                <span className="text-lg font-bold text-forest-600 tabular-nums">
                  {p.total_score}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">{t('gameDetail.scoreBreakdown')}</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-forest-200">
                  <th className="text-left py-2 pr-2 font-medium text-forest-500">{t('gameDetail.category')}</th>
                  {sortedPlayers.map((p) => (
                    <th key={p.id} className="text-right py-2 px-1 font-medium text-forest-500">
                      {p.player_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORY_ORDER.map((cat) => (
                  <tr key={cat} className="border-b border-forest-100">
                    <td className="py-1.5 pr-2 text-forest-600">{CATEGORY_ICONS[cat]} {t(`category.${cat}`)}</td>
                    {sortedPlayers.map((p) => (
                      <td key={p.id} className="text-right py-1.5 px-1 tabular-nums text-forest-700">
                        {p.score_breakdown?.categoryTotals[cat] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2 pr-2 text-forest-700">{t('gameDetail.total')}</td>
                  {sortedPlayers.map((p) => (
                    <td key={p.id} className="text-right py-2 px-1 tabular-nums text-forest-700">
                      {p.total_score}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
