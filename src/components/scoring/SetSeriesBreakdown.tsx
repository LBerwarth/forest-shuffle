import { useTranslation } from 'react-i18next'
import { AcornIcon } from '@/components/ui/AcornIcon'
import type { SetSeries } from '@/lib/scoring'

interface SetSeriesBreakdownProps {
  series: SetSeries[]
  iconUrl: string
  titleKey: string
}

export function SetSeriesBreakdown({ series, iconUrl, titleKey }: SetSeriesBreakdownProps) {
  const { t } = useTranslation()
  if (series.length === 0) return null
  const total = series.reduce((sum, s) => sum + s.points, 0)

  return (
    <div className="mb-3 rounded-lg border border-forest-200 bg-white/95 p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img src={iconUrl} alt="" className="h-5 w-5" />
          <span className="text-sm font-semibold text-forest-700">{t(titleKey)}</span>
        </div>
        <span className="flex items-center gap-0.5 text-sm font-bold text-forest-700 tabular-nums">
          {total}
          <AcornIcon className="h-4 w-4" />
        </span>
      </div>
      <ul className="space-y-1">
        {series.map(({ index, setSize, points }) => (
          <li key={index} className="flex items-center justify-between text-xs text-forest-600">
            <span className="flex items-center gap-1.5">
              <span className="font-medium">{t('wizard.series', { index })}</span>
              <span className="text-forest-400">·</span>
              <img src={iconUrl} alt="" className="h-3.5 w-3.5 opacity-70" />
              <span className="tabular-nums">{setSize}</span>
            </span>
            <span className="flex items-center gap-0.5 tabular-nums">
              {points}
              <AcornIcon className="h-3 w-3" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
