import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { STAT_ICONS } from '@/assets/icons'
import type { TagAggregate } from '@/lib/stats'

interface TagInsightsProps {
  tags: TagAggregate[]
  singleGame?: boolean
}

export function TagInsights({ tags, singleGame = false }: TagInsightsProps) {
  const { t } = useTranslation()

  if (tags.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">
            {t('leaderboard.tagInsights')}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 text-center py-4">{t('leaderboard.noTagData')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.tagInsights')}
        </h2>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] text-forest-400 mb-2">{t('leaderboard.tagInsightsHint')}</p>
        <div className="space-y-1.5">
          {tags.map((row) => {
            const iconUrl = STAT_ICONS[row.tag]
            return (
              <div
                key={row.tag}
                className="flex items-center gap-2 rounded-lg bg-forest-50 px-2.5 py-2"
              >
                {iconUrl && (
                  <img src={iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-forest-700 truncate">
                    {t(`tag.${row.tag}`)}
                  </p>
                  <p className="text-[10px] text-forest-400 truncate">
                    {singleGame
                      ? row.byPlayer.map((p) => `${p.playerName} (${p.points})`).join(' · ')
                      : t('leaderboard.tagInsightsSubline', {
                          games: row.playerGames,
                          cards: row.totalCards,
                        })}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-sm font-bold text-forest-600 tabular-nums shrink-0">
                  {row.avgPointsPerPlayerGame}
                  <AcornIcon className="h-3 w-3" />
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
