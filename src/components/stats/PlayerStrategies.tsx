import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { STAT_ICONS } from '@/assets/icons'
import type { PlayerStrategies as PlayerStrategiesData } from '@/lib/stats'

interface PlayerStrategiesProps {
  players: PlayerStrategiesData[]
}

export function PlayerStrategies({ players }: PlayerStrategiesProps) {
  const { t } = useTranslation()

  if (players.length === 0) return null

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.strategies')}
        </h2>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] text-forest-400 mb-3">{t('leaderboard.strategiesHint')}</p>
        <div className="space-y-3">
          {players.map((p) => (
            <div key={p.playerId} className="rounded-lg bg-forest-50 px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-forest-700 truncate flex-1">{p.name}</p>
                <span className="text-[10px] text-forest-400 shrink-0">
                  {p.gamesPlayed} {t('leaderboard.games').toLowerCase()}
                </span>
              </div>
              <div className="space-y-1">
                {p.topStrategies.map((s) => (
                  <div key={s.tag} className="flex items-center gap-2">
                    {STAT_ICONS[s.tag] && (
                      <img src={STAT_ICONS[s.tag]} alt="" className="h-4 w-4 rounded-sm shrink-0" />
                    )}
                    <span className="text-xs font-medium text-forest-600 shrink-0 w-20 truncate">
                      {t(`tag.${s.tag}`)}
                    </span>
                    <span className="text-[10px] text-forest-400 flex-1">
                      {t('leaderboard.cardsLabel', { count: s.cards })}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-forest-600 tabular-nums shrink-0">
                      {s.avgPointsPerGame}
                      <AcornIcon className="h-3 w-3" />
                      <span className="text-[10px] font-normal text-forest-400 ml-0.5">
                        /{t('leaderboard.gameShort')}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
