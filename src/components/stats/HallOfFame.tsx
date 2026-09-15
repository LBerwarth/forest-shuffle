import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Flame, Layers, Sparkles, Swords, Trophy, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { getCardIconUrl } from '@/data/cardIcons'
import { CATEGORY_ICON_URLS, getCategoryLabel, getCategoryOrder } from '@/data/categories'
import { useHallOfFame } from '@/hooks/use-hall-of-fame'
import { cn } from '@/lib/utils'
import { timeFilterCutoff, type EditionFilter, type PlayerCountFilter, type TimeFilter } from '@/lib/stats'
import type { HofRecord } from '@/lib/supabase-api'
import type { CardCategory } from '@/types/card'

interface HallOfFameProps {
  playerCount: PlayerCountFilter
  edition: EditionFilter
  time: TimeFilter
  myScore: number | null
}

export function HallOfFame({ playerCount, edition, time, myScore }: HallOfFameProps) {
  const { t, i18n } = useTranslation()
  const tc = useTranslation('cards').t
  const [expanded, setExpanded] = useState(false)
  const since = useMemo(() => timeFilterCutoff(time), [time])

  const { data, isLoading, isError } = useHallOfFame({
    playerCount: playerCount === 'all' ? undefined : playerCount,
    edition: edition === 'all' ? undefined : edition,
    since,
    myScore,
  })

  const windowLabel =
    time === 'all'
      ? t('leaderboard.hallOfFameAllTime')
      : time === 'year'
        ? t('leaderboard.timeYear')
        : time === 'month'
          ? t('leaderboard.timeMonth')
          : t('leaderboard.timeWeek')

  const title = (
    <h2 className="font-heading text-base font-semibold text-forest-700 flex items-center gap-1.5">
      <Trophy className="h-4 w-4 text-amber-500" />
      {t('leaderboard.hallOfFame')}
    </h2>
  )

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardHeader>{title}</CardHeader>
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
        <CardHeader>{title}</CardHeader>
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
      ? new Date(iso).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })
      : ''

  const holders = (r: HofRecord) => {
    const shown = r.names.join(' & ')
    const rest = r.holders - r.names.length
    return rest > 0 ? `${shown} +${rest}` : shown
  }

  const who = (r: HofRecord) => (
    <>
      {holders(r)}
      {r.isMine && (
        <span className="ml-1 rounded-full bg-forest-200 px-1.5 py-px text-[9px] font-semibold text-forest-600">
          {t('leaderboard.hallOfFameYours')}
        </span>
      )}
    </>
  )

  const soloOnly = playerCount === 1
  const catEdition = edition === 'all' ? 'classic' : edition
  const order = getCategoryOrder(catEdition)
  // A record can come from an edition the filter doesn't name, so a category
  // missing from this edition's order goes last instead of first.
  const catRank = (c: CardCategory) => {
    const i = order.indexOf(c)
    return i === -1 ? order.length : i
  }
  const categoryBests = [...data.categoryBests].sort(
    (a, b) => catRank(a.cardCategory) - catRank(b.cardCategory),
  )
  const multiTables = data.topTables.filter((tt) => tt.players > 1)
  const hasMore =
    categoryBests.length > 0 ||
    data.topForests.length > 0 ||
    data.mostGamesTop.length > 0 ||
    data.cardMeta.mostPlayed.length > 0 ||
    (!soloOnly && (data.topMargins.length > 0 || multiTables.length > 0))

  return (
    <Card className="mb-4">
      <CardHeader>
        {title}
        <p className="text-[10px] text-forest-400 mt-0.5 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {t('leaderboard.hallOfFameSubtitle', {
            games: data.totalGames,
            players: data.totalPlayers,
          })}
          {' · '}
          {windowLabel}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {data.me && myScore !== null && (
            <div className="flex items-center gap-2 rounded-lg bg-forest-100/70 px-2.5 py-2">
              <Sparkles className="h-4 w-4 text-forest-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-forest-400">
                  {t('leaderboard.hallOfFameYourBest')}
                </p>
                <p className="text-xs font-medium text-forest-700 truncate">
                  {t('leaderboard.hallOfFameBeats', { pct: data.me.betterThanPct })}
                  {' · '}
                  {t('leaderboard.hallOfFameRank', {
                    rank: data.me.rank,
                    total: data.me.total,
                  })}
                </p>
              </div>
              <Value points={data.me.bestScore} />
            </div>
          )}

          <Ranked
            tone="amber"
            icon={<Trophy className="h-4 w-4 text-amber-500 shrink-0" />}
            label={t('leaderboard.topGameScore')}
            items={data.topGames.map((r) => ({
              key: String(r.totalScore),
              detail: (
                <>
                  {who(r)} · {formatDate(r.playedAt)}
                </>
              ),
              value: <Value points={r.totalScore} />,
            }))}
          />

          {data.topCards.length > 0 && (
            <Ranked
              icon={<CardIcon cardKey={data.topCards[0].cardKey} />}
              label={t('leaderboard.topCardScore')}
              items={data.topCards.map((c) => ({
                key: `${c.cardKey}-${c.points}`,
                detail: (
                  <>
                    {tc(`${c.cardKey}.name`)} · {who(c)}
                  </>
                ),
                value: <Value points={c.points} />,
              }))}
            />
          )}

          {expanded && (
            <>
              {!soloOnly && (
                <Ranked
                  icon={<Users className="h-4 w-4 text-forest-400 shrink-0" />}
                  label={t('leaderboard.topTableScore')}
                  items={multiTables.map((tt) => ({
                    key: `${tt.totalScore}-${tt.playedAt}`,
                    detail: (
                      <>
                        {t('gameDetail.playerCount', { count: tt.players })} ·{' '}
                        {formatDate(tt.playedAt)}
                      </>
                    ),
                    value: <Value points={tt.totalScore} />,
                  }))}
                />
              )}

              {!soloOnly && (
                <Ranked
                  icon={<Swords className="h-4 w-4 text-forest-400 shrink-0" />}
                  label={t('leaderboard.topMargin')}
                  items={data.topMargins.map((r) => ({
                    key: String(r.margin),
                    detail: (
                      <>
                        {who(r)} · {formatDate(r.playedAt)}
                      </>
                    ),
                    value: <Value points={r.margin} />,
                  }))}
                />
              )}

              <Ranked
                icon={<Layers className="h-4 w-4 text-forest-400 shrink-0" />}
                label={t('leaderboard.topForest')}
                items={data.topForests.map((r) => ({
                  key: String(r.cards),
                  detail: (
                    <>
                      {who(r)} · {formatDate(r.playedAt)}
                    </>
                  ),
                  value: (
                    <span className="text-sm font-bold text-forest-700 tabular-nums shrink-0">
                      {t('leaderboard.topForestCards', { count: r.cards })}
                    </span>
                  ),
                }))}
              />

              <Ranked
                icon={<Flame className="h-4 w-4 text-forest-400 shrink-0" />}
                label={t('leaderboard.mostGames')}
                items={data.mostGamesTop.map((r) => ({
                  key: String(r.games),
                  detail: who(r),
                  value: (
                    <span className="text-sm font-bold text-forest-700 tabular-nums shrink-0">
                      {t('leaderboard.mostGamesCount', { count: r.games })}
                    </span>
                  ),
                }))}
              />

              {categoryBests.map((c) => (
                <Row
                  key={c.cardCategory}
                  icon={
                    <img
                      src={CATEGORY_ICON_URLS[c.cardCategory]}
                      alt=""
                      className="h-4 w-4 shrink-0"
                    />
                  }
                  label={t('leaderboard.topCategoryBest', {
                    category: t(`category.${getCategoryLabel(c.cardCategory, catEdition)}`),
                  })}
                  detail={
                    <>
                      {tc(`${c.cardKey}.name`)} · {who(c)}
                    </>
                  }
                  value={<Value points={c.points} />}
                />
              ))}

              {data.cardMeta.mostPlayed.length > 0 && (
                <Ranked
                  icon={<CardIcon cardKey={data.cardMeta.mostPlayed[0].cardKey} />}
                  label={t('leaderboard.cardMetaMostPlayed')}
                  items={data.cardMeta.mostPlayed.map((c) => ({
                    key: c.cardKey,
                    detail: tc(`${c.cardKey}.name`),
                    value: (
                      <span className="text-sm font-bold text-forest-700 tabular-nums shrink-0">
                        {t('leaderboard.cardMetaPlays', { count: c.appearances })}
                      </span>
                    ),
                  }))}
                />
              )}

              {data.cardMeta.bestAverage.length > 0 && (
                <Ranked
                  icon={<CardIcon cardKey={data.cardMeta.bestAverage[0].cardKey} />}
                  label={t('leaderboard.cardMetaBestAverage')}
                  items={data.cardMeta.bestAverage.map((c) => ({
                    key: c.cardKey,
                    detail: (
                      <>
                        {tc(`${c.cardKey}.name`)} ·{' '}
                        {t('leaderboard.cardMetaPlays', { count: c.appearances })}
                      </>
                    ),
                    value: <Value points={c.avgPoints} />,
                  }))}
                />
              )}
            </>
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] font-medium text-forest-500"
          >
            {t('leaderboard.hallOfFameMore')}
            <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function Row({
  icon,
  label,
  detail,
  value,
  tone = 'forest',
}: {
  icon: ReactNode
  label: string
  detail: ReactNode
  value: ReactNode
  tone?: 'forest' | 'amber'
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-2',
        tone === 'amber' ? 'bg-amber-50' : 'bg-forest-50',
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-forest-400">{label}</p>
        <p className="text-xs font-medium text-forest-700 truncate">{detail}</p>
      </div>
      {value}
    </div>
  )
}

function Ranked({
  icon,
  label,
  items,
  tone = 'forest',
}: {
  icon: ReactNode
  label: string
  items: { key: string; detail: ReactNode; value: ReactNode }[]
  tone?: 'forest' | 'amber'
}) {
  if (items.length === 0) return null
  if (items.length === 1) {
    return (
      <Row icon={icon} label={label} detail={items[0].detail} value={items[0].value} tone={tone} />
    )
  }
  return (
    <div
      className={cn('rounded-lg px-2.5 py-2', tone === 'amber' ? 'bg-amber-50' : 'bg-forest-50')}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[10px] text-forest-400">{label}</p>
      </div>
      <ol className="mt-1 space-y-1">
        {items.map((it, i) => (
          <li key={it.key} className="flex items-center gap-2 pl-6">
            <span className="w-3 shrink-0 text-[10px] font-semibold text-forest-400 tabular-nums">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-forest-700">
              {it.detail}
            </span>
            {it.value}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Value({ points }: { points: number }) {
  return (
    <span className="flex items-center gap-0.5 text-sm font-bold text-forest-700 tabular-nums shrink-0">
      {points}
      <AcornIcon className="h-3 w-3" />
    </span>
  )
}

function CardIcon({ cardKey }: { cardKey: string }) {
  const url = getCardIconUrl(cardKey)
  if (!url) return <Sparkles className="h-4 w-4 text-forest-400 shrink-0" />
  return <img src={url} alt="" className="h-5 w-5 shrink-0 rounded-sm" />
}
