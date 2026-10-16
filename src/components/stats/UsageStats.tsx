import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { fetchUsageStats, type UsageRow } from '@/lib/supabase-api'
import type { Expansion, GameEdition } from '@/types/card'

const EDITION_KEY: Record<GameEdition, string> = {
  classic: 'leaderboard.editionClassic',
  dartmoor: 'leaderboard.editionDartmoor',
  smoky: 'leaderboard.editionSmoky',
}
const EXPANSION_ORDER: Expansion[] = ['alpine', 'woodland', 'exploration', 'dartmoor_exmoor']
const PERIODS = ['week', 'month', 'year', 'total'] as const

export function UsageStats() {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: fetchUsageStats,
    staleTime: 10 * 60 * 1000,
  })
  if (!data || data.length === 0) return null

  const label = (r: UsageRow) =>
    [
      t(EDITION_KEY[r.edition] ?? r.edition),
      ...EXPANSION_ORDER.filter((e) => r.expansions.includes(e)).map((e) => t(`expansion.${e}`)),
    ].join(' + ')
  const sum = (p: (typeof PERIODS)[number]) => data.reduce((n, r) => n + r[p], 0)
  const cell = 'py-1 pl-2 text-right tabular-nums'

  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="font-heading text-base font-semibold text-forest-700 flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4 text-forest-500" />
          {t('leaderboard.usageTitle')}
        </h2>
        <p className="text-[10px] text-forest-400 mt-0.5">{t('leaderboard.usageSubtitle')}</p>
      </CardHeader>
      <CardContent>
        <table className="w-full text-xs text-forest-700">
          <thead>
            <tr className="text-[10px] text-forest-400">
              <th className="py-1 text-left font-normal" />
              {PERIODS.map((p) => (
                <th key={p} className="py-1 pl-2 text-right font-normal">
                  {t(`leaderboard.usage${p[0].toUpperCase()}${p.slice(1)}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-forest-100 font-bold">
              <td className="py-1">{t('leaderboard.usageAll')}</td>
              {PERIODS.map((p) => (
                <td key={p} className={cell}>
                  {sum(p)}
                </td>
              ))}
            </tr>
            {data.map((r) => (
              <tr key={`${r.edition}-${r.expansions.join()}`}>
                <td className="py-1 break-words">{label(r)}</td>
                {PERIODS.map((p) => (
                  <td key={p} className={cell}>
                    {r[p]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
