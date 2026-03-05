import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar, Users, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useGames, useDeleteGame } from '@/hooks/use-games'

export function GameHistoryPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: games = [], isLoading } = useGames()
  const deleteGameMutation = useDeleteGame()

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('history.title')}</h1>
        <span className="ml-auto text-sm text-forest-400">{t('history.gameCount', { count: games.length })}</span>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-forest-200 mx-auto mb-3" />
          <p className="text-sm text-forest-400">{t('history.noGames')}</p>
          <p className="text-xs text-forest-300 mt-1">{t('history.noGamesHint')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => navigate(`/history/${game.id}`)}
                className="w-full text-left"
              >
                <Card className="hover:shadow-card-hover transition-shadow">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3.5 w-3.5 text-forest-400 shrink-0" />
                          <span className="text-xs text-forest-400">
                            {new Date(game.played_at).toLocaleDateString(i18n.language, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-forest-400">
                            <Users className="h-3 w-3" />
                            {game.player_count}
                          </span>
                          {game.edition === 'dartmoor' && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Dartmoor
                            </span>
                          )}
                        </div>

                        {/* Player scores */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {game.players
                            .sort((a, b) => a.rank - b.rank)
                            .map((p) => (
                              <span
                                key={p.id}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  p.is_winner
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-forest-100 text-forest-600'
                                }`}
                              >
                                {p.is_winner && '🏆 '}
                                {p.player_name}: {p.total_score}
                              </span>
                            ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(t('history.deleteConfirm'))) deleteGameMutation.mutate(game.id)
                        }}
                        className="shrink-0 p-1 text-forest-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
