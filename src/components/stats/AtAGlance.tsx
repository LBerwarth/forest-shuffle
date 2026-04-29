import { useTranslation } from 'react-i18next'
import { Calendar, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { AcornIcon } from '@/components/ui/AcornIcon'
import type { AtAGlanceMetrics } from '@/lib/stats'

interface AtAGlanceProps {
  metrics: AtAGlanceMetrics
}

export function AtAGlance({ metrics }: AtAGlanceProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <Card>
        <CardContent className="py-3 text-center">
          <Calendar className="h-4 w-4 text-forest-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-forest-600 tabular-nums">{metrics.totalGames}</p>
          <p className="text-[10px] text-forest-400">{t('leaderboard.totalGames')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-3 text-center">
          <Target className="h-4 w-4 text-forest-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-forest-600 tabular-nums flex items-center justify-center gap-0.5">
            {metrics.avgScore}
            <AcornIcon className="h-4 w-4" />
          </p>
          <p className="text-[10px] text-forest-400">{t('leaderboard.avgScore')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-3 text-center">
          <TrendingUp className="h-4 w-4 text-forest-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-forest-600 tabular-nums flex items-center justify-center gap-0.5">
            {metrics.bestScore}
            <AcornIcon className="h-4 w-4" />
          </p>
          <p className="text-[10px] text-forest-400">{t('leaderboard.bestScore')}</p>
        </CardContent>
      </Card>
    </div>
  )
}
