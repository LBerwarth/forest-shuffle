import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { EditionFilter, TimeFilter, PlayerCountFilter } from '@/lib/stats'

interface StatsFiltersProps {
  edition: EditionFilter
  time: TimeFilter
  playerCount: PlayerCountFilter
  onEditionChange: (edition: EditionFilter) => void
  onTimeChange: (time: TimeFilter) => void
  onPlayerCountChange: (count: PlayerCountFilter) => void
}

const EDITION_OPTIONS: EditionFilter[] = ['all', 'classic', 'dartmoor']
const TIME_OPTIONS: TimeFilter[] = ['all', 'year', 'month', 'week']
const PLAYER_COUNT_OPTIONS: PlayerCountFilter[] = ['all', 2, 3, 4, 5, 6]

export function StatsFilters({
  edition,
  time,
  playerCount,
  onEditionChange,
  onTimeChange,
  onPlayerCountChange,
}: StatsFiltersProps) {
  const { t } = useTranslation()

  const editionLabel = (e: EditionFilter) =>
    e === 'all'
      ? t('leaderboard.editionAll')
      : e === 'classic'
        ? t('leaderboard.editionClassic')
        : t('leaderboard.editionDartmoor')

  const timeLabel = (tm: TimeFilter) =>
    tm === 'all'
      ? t('leaderboard.timeAll')
      : tm === 'year'
        ? t('leaderboard.timeYear')
        : tm === 'month'
          ? t('leaderboard.timeMonth')
          : t('leaderboard.timeWeek')

  const countLabel = (c: PlayerCountFilter) =>
    c === 'all' ? t('leaderboard.playerCountAll') : String(c)

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">{t('leaderboard.edition')}</span>
        {EDITION_OPTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onEditionChange(e)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              edition === e
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {editionLabel(e)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">{t('leaderboard.time')}</span>
        {TIME_OPTIONS.map((tm) => (
          <button
            key={tm}
            type="button"
            onClick={() => onTimeChange(tm)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              time === tm
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {timeLabel(tm)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">{t('leaderboard.playerCount')}</span>
        {PLAYER_COUNT_OPTIONS.map((c) => (
          <button
            key={String(c)}
            type="button"
            onClick={() => onPlayerCountChange(c)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              playerCount === c
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {countLabel(c)}
          </button>
        ))}
      </div>
    </div>
  )
}
