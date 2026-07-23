import { useTranslation } from 'react-i18next'
import { Trophy, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { getCardIconUrl } from '@/data/cardIcons'
import { useHallOfFame } from '@/hooks/use-hall-of-fame'
import type { EditionFilter, PlayerCountFilter } from '@/lib/stats'

interface HallOfFameProps {
  playerCount: PlayerCountFilter
  edition: EditionFilter
}

export function HallOfFame({ playerCount, edition }: HallOfFameProps) {
  const { t, i18n } = useTranslation()
  const tc = useTranslation('cards').t
  const { data, isLoading, isError } = useHallOfFame(
    playerCount === 'all' ? undefined : playerCount,
    edition === 'all' ? undefined : edition,
  )

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">
            {t('leaderboard.hallOfFame')}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 text-center py-4">
            {t('leaderboard.hallOfFameLoading')}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isError || !data) return null

  if (data.totalGames === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t('leaderboard.hallOfFame')}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 text-center py-4">
            {t('leaderboard.hallOfFameEmpty')}
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString(i18n.language, {
          month: 'short',
          year: 'numeric',
        })
      : ''

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700 flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          {t('leaderboard.hallOfFame')}
        </h2>
        <p className="text-[10px] text-forest-400 mt-0.5 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {t('leaderboard.hallOfFameSubtitle', {
            games: data.totalGames,
            players: data.totalPlayers,
          })}
          {' · '}
          {t('leaderboard.hallOfFameAllTime')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {data.topGame && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-forest-400">
                  {t('leaderboard.topGameScore')}
                </p>
                <p className="text-xs font-medium text-forest-700 truncate">
                  {data.topGame.playerName} · {formatDate(data.topGame.playedAt)}
                </p>
              </div>
              <span className="flex items-center gap-0.5 text-sm font-bold text-forest-700 tabular-nums shrink-0">
                {data.topGame.totalScore}
                <AcornIcon className="h-3 w-3" />
              </span>
            </div>
          )}
          {data.topCard && (
            <div className="flex items-center gap-2 rounded-lg bg-forest-50 px-2.5 py-2">
              {getCardIconUrl(data.topCard.cardKey) && (
                <img
                  src={getCardIconUrl(data.topCard.cardKey)}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-forest-400">
                  {t('leaderboard.topCardScore')}
                </p>
                <p className="text-xs font-medium text-forest-700 truncate">
                  {tc(`${data.topCard.cardKey}.name`)} · {data.topCard.playerName}
                </p>
              </div>
              <span className="flex items-center gap-0.5 text-sm font-bold text-forest-700 tabular-nums shrink-0">
                {data.topCard.points}
                <AcornIcon className="h-3 w-3" />
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
