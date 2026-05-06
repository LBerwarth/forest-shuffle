import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { STAT_ICONS } from '@/assets/icons'
import type { TagSynergyAggregate } from '@/lib/stats'

interface TagSynergiesProps {
  rows: TagSynergyAggregate[]
  singleGame?: boolean
}

export function TagSynergies({ rows, singleGame = false }: TagSynergiesProps) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">
            {t('leaderboard.tagSynergies')}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 text-center py-4">{t('leaderboard.noTagData')}</p>
        </CardContent>
      </Card>
    )
  }

  const labelFor = (iconKey: string) => {
    const tagLabel = t(`tag.${iconKey}`, { defaultValue: '' })
    if (tagLabel) return tagLabel
    const synergyLabel = t(`leaderboard.synergyLabel.${iconKey}`, { defaultValue: '' })
    if (synergyLabel) return synergyLabel
    return iconKey
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.tagSynergies')}
        </h2>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] text-forest-400 mb-2">{t('leaderboard.tagSynergiesHint')}</p>
        <div className="space-y-1.5">
          {rows.map((row) => {
            const iconUrl = STAT_ICONS[row.iconKey]
            return (
              <div
                key={row.iconKey}
                className="flex items-center gap-2 rounded-lg bg-forest-50 px-2.5 py-2"
              >
                {iconUrl && (
                  <img src={iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-forest-700 truncate">
                    {labelFor(row.iconKey)}
                  </p>
                  <p className="text-[10px] text-forest-400 truncate">
                    {singleGame
                      ? row.byPlayer.map((p) => `${p.playerName} (${p.points})`).join(' · ')
                      : t('leaderboard.tagSynergiesSubline', { count: row.cardCount })}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 text-sm font-bold text-forest-600 tabular-nums shrink-0">
                  {row.totalPoints}
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
