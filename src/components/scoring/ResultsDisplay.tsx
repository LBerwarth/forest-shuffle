import { useTranslation } from 'react-i18next'
import { Trophy, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { CATEGORY_ICON_URLS, getCategoryOrder, getCategoryLabel } from '@/data/categories'
import { getCardIconUrl } from '@/data/cardIcons'
import type { ScoreBreakdown } from '@/types/scoring'
import type { GameEdition } from '@/types/card'
import { cn } from '@/lib/utils'

const COMPARISON_CARD_KEYS = ['linden', 'great_spotted_woodpecker', 'black_tailed_godwit', 'dartmoor_pony']

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']

export interface RankedPlayer {
  playerId: string
  playerName: string
  breakdown: ScoreBreakdown | null
  rank: number
}

interface ResultsDisplayProps {
  rankedPlayers: RankedPlayer[]
  edition: GameEdition
}

export function ResultsDisplay({ rankedPlayers, edition }: ResultsDisplayProps) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t
  const categoryOrder = getCategoryOrder(edition)
  const winner = rankedPlayers[0]

  if (!winner) return null

  return (
    <>
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
        <p className="mt-1 flex items-center justify-center gap-1 text-3xl font-bold text-forest-600 tabular-nums">
          {winner.breakdown?.total ?? 0}
          <AcornIcon className="h-7 w-7" />
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
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: MEDAL_COLORS[idx] ?? '#94a3b8' }}
                  >
                    {player.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest-700 truncate">
                      {player.playerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <p className="text-lg font-bold text-forest-600 tabular-nums">
                      {player.breakdown?.total ?? 0}
                    </p>
                    <AcornIcon className="h-4 w-4" />
                  </div>
                </div>

                {player.breakdown && (
                  <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                    {categoryOrder.map((cat) => {
                      const pts = player.breakdown?.categoryTotals[cat]
                      if (!pts || pts <= 0) return null
                      return (
                        <span
                          key={cat}
                          className="whitespace-nowrap rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-medium text-forest-600"
                        >
                          {t(`category.${getCategoryLabel(cat, edition)}`)}: {pts}
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
                  <th className="text-left py-2 pr-2 font-medium text-forest-500">
                    {t('result.category')}
                  </th>
                  {rankedPlayers.map((p) => (
                    <th
                      key={p.playerId}
                      className="text-right py-2 px-1 font-medium text-forest-500 truncate max-w-[80px]"
                    >
                      {p.playerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryOrder.map((cat) => (
                  <tr key={cat} className="border-b border-forest-100">
                    <td className="py-1.5 pr-2 text-forest-600">
                      <img src={CATEGORY_ICON_URLS[cat]} alt="" className="inline-block h-4 w-4 rounded-sm mr-1" />{t(`category.${getCategoryLabel(cat, edition)}`)}
                    </td>
                    {rankedPlayers.map((p) => (
                      <td
                        key={p.playerId}
                        className="text-right py-1.5 px-1 tabular-nums text-forest-700"
                      >
                        {p.breakdown?.categoryTotals[cat] ?? 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-2 pr-2 text-forest-700">{t('result.total')}</td>
                  {rankedPlayers.map((p) => (
                    <td
                      key={p.playerId}
                      className="text-right py-2 px-1 tabular-nums text-forest-700"
                    >
                      {p.breakdown?.total ?? 0}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Comparison card details */}
      {rankedPlayers.some((p) =>
        p.breakdown?.entries.some((e) => COMPARISON_CARD_KEYS.includes(e.cardKey)),
      ) && (
        <Card className="mb-6 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <h2 className="font-heading text-base font-semibold text-forest-700">
                {t('result.comparisonTitle')}
              </h2>
            </div>
            <p className="text-xs text-forest-500 mt-1">{t('result.comparisonDesc')}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {COMPARISON_CARD_KEYS.filter((key) =>
                rankedPlayers.some((p) =>
                  p.breakdown?.entries.some((e) => e.cardKey === key && e.count > 0),
                ),
              ).map((cardKey) => (
                <div key={cardKey} className="mb-3 last:mb-0">
                  <p className="text-xs font-medium text-forest-700 mb-1.5">
                    {getCardIconUrl(cardKey) && <img src={getCardIconUrl(cardKey)} alt="" className="inline-block h-4 w-4 rounded-sm mr-1" />}{tc(`${cardKey}.name`)}
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="text-left py-1 pr-2 font-medium text-forest-500">{t('result.player')}</th>
                        <th className="text-right py-1 px-2 font-medium text-forest-500">{t('result.cards')}</th>
                        <th className="text-right py-1 px-2 font-medium text-forest-500">{t('result.perCard')}</th>
                        <th className="text-right py-1 pl-2 font-medium text-forest-500">{t('result.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedPlayers
                        .filter((p) =>
                          p.breakdown?.entries.some((e) => e.cardKey === cardKey && e.count > 0),
                        )
                        .map((p) => {
                          const entry = p.breakdown?.entries.find((e) => e.cardKey === cardKey)
                          const count = entry?.count ?? 0
                          const points = entry?.points ?? 0
                          const perCard = count > 0 ? Math.round(points / count) : 0
                          return (
                            <tr key={p.playerId} className="border-b border-blue-50">
                              <td className="py-1.5 pr-2 text-forest-600">{p.playerName}</td>
                              <td className="text-right py-1.5 px-2 tabular-nums text-forest-500">{count}</td>
                              <td className="text-right py-1.5 px-2 tabular-nums text-forest-500"><span className="inline-flex items-center gap-0.5">{perCard}<AcornIcon className="h-3 w-3" /></span></td>
                              <td className="text-right py-1.5 pl-2 tabular-nums font-semibold text-forest-700">{points}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
