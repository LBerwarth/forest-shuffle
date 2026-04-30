import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { getCardIconUrl } from '@/data/cardIcons'
import { cn } from '@/lib/utils'
import type { CardAggregate } from '@/lib/stats'

type Mode = 'topScoring' | 'mostPoints' | 'mostPlayed' | 'bigPlays'

interface CardAnalyticsProps {
  cards: CardAggregate[]
}

export function CardAnalytics({ cards }: CardAnalyticsProps) {
  const { t, i18n } = useTranslation()
  const tc = useTranslation('cards').t
  const [mode, setMode] = useState<Mode>('topScoring')

  const sorted = useMemo(() => {
    const list = [...cards]
    if (mode === 'topScoring') {
      list.sort((a, b) => b.avgPointsPerAppearance - a.avgPointsPerAppearance)
    } else if (mode === 'mostPoints') {
      list.sort((a, b) => b.totalPoints - a.totalPoints)
    } else if (mode === 'mostPlayed') {
      list.sort((a, b) => b.appearances - a.appearances)
    } else {
      list.sort((a, b) => b.maxPointsSingle - a.maxPointsSingle)
    }
    return list.slice(0, 10)
  }, [cards, mode])

  const modes: { id: Mode; label: string }[] = [
    { id: 'topScoring', label: t('leaderboard.modeTopScoring') },
    { id: 'mostPoints', label: t('leaderboard.modeMostPoints') },
    { id: 'mostPlayed', label: t('leaderboard.modeMostPlayed') },
    { id: 'bigPlays', label: t('leaderboard.modeBigPlays') },
  ]

  const hint =
    mode === 'topScoring'
      ? t('leaderboard.topScoringHint')
      : mode === 'mostPoints'
        ? t('leaderboard.mostPointsHint')
        : mode === 'mostPlayed'
          ? t('leaderboard.mostPlayedHint')
          : t('leaderboard.bigPlaysHint')

  if (cards.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">
            {t('leaderboard.cardAnalytics')}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 text-center py-4">{t('leaderboard.noCardData')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700">
          {t('leaderboard.cardAnalytics')}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 mb-3 overflow-x-auto scrollbar-hide">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
                mode === m.id
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-forest-400 mb-2">{hint}</p>
        <div className="space-y-1.5">
          {sorted.map((c) => {
            const iconUrl = getCardIconUrl(c.cardKey)
            const name = tc(`${c.cardKey}.name`)
            return (
              <div
                key={c.cardKey}
                className="flex items-center gap-2 rounded-lg bg-forest-50 px-2.5 py-2"
              >
                {iconUrl && (
                  <img src={iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-forest-700 truncate">{name}</p>
                  <CardSubline mode={mode} card={c} lang={i18n.language} />
                </div>
                <CardPrimary mode={mode} card={c} />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function CardPrimary({ mode, card }: { mode: Mode; card: CardAggregate }) {
  if (mode === 'mostPlayed') {
    return (
      <span className="flex items-center gap-0.5 text-sm font-bold text-forest-600 tabular-nums shrink-0">
        × {card.appearances}
      </span>
    )
  }
  const value =
    mode === 'topScoring'
      ? card.avgPointsPerAppearance
      : mode === 'mostPoints'
        ? card.totalPoints
        : card.maxPointsSingle
  return (
    <span className="flex items-center gap-0.5 text-sm font-bold text-forest-600 tabular-nums shrink-0">
      {value}
      <AcornIcon className="h-3 w-3" />
    </span>
  )
}

function CardSubline({ mode, card, lang }: { mode: Mode; card: CardAggregate; lang: string }) {
  const { t } = useTranslation()
  if (mode === 'topScoring') {
    return (
      <p className="text-[10px] text-forest-400">
        {t('leaderboard.appearancesShort', { count: card.appearances })}
      </p>
    )
  }
  if (mode === 'mostPoints') {
    return (
      <p className="text-[10px] text-forest-400">
        {t('leaderboard.appearancesShort', { count: card.appearances })}
      </p>
    )
  }
  if (mode === 'mostPlayed') {
    return (
      <p className="text-[10px] text-forest-400">
        {t('leaderboard.totalPoints', { count: card.totalPoints })}
      </p>
    )
  }
  if (card.maxBy) {
    const date = new Date(card.maxBy.playedAt).toLocaleDateString(lang, {
      month: 'short',
      day: 'numeric',
    })
    return (
      <p className="text-[10px] text-forest-400 truncate">
        {t('leaderboard.byPlayerOnDate', { name: card.maxBy.playerName, date })}
      </p>
    )
  }
  return null
}
