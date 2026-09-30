import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Layers, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { getSetupRemoval, SETUP_PLAYER_COUNTS, totalRemoved } from '@/data/setup'
import { cn } from '@/lib/utils'
import type { Expansion, GameEdition } from '@/types/card'

const BASE_SETS: Expansion[] = ['base', 'dartmoor_base', 'smoky_base']

interface SetupGuideProps {
  edition: GameEdition
  expansions: Expansion[]
  /** Collapsed by default behind a tappable header */
  collapsible?: boolean
  className?: string
}

export function SetupGuide({ edition, expansions, collapsible = false, className }: SetupGuideProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(!collapsible)
  const removal = getSetupRemoval(edition, expansions)
  const hasExmoor = expansions.includes('dartmoor_exmoor')

  const summary = [
    t(`settings.${edition}Edition`),
    ...expansions.filter((e) => !BASE_SETS.includes(e)).map((e) => t(`expansion.${e}`)),
  ].join(' · ')

  const header = (
    <div className="flex items-center gap-2">
      <Layers className="h-4 w-4 text-forest-500" />
      <h2 className="font-heading text-base font-semibold text-forest-700">{t('setup.title')}</h2>
      {collapsible && (
        <ChevronDown className={cn('ml-auto h-4 w-4 text-forest-400 transition-transform', open && 'rotate-180')} />
      )}
    </div>
  )

  return (
    <Card className={className}>
      {collapsible ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full text-left">
          <CardHeader className={open ? undefined : 'pb-4'}>
            {header}
            <p className="mt-0.5 text-xs text-forest-400">{summary}</p>
          </CardHeader>
        </button>
      ) : (
        <CardHeader>{header}</CardHeader>
      )}
      {open && (
        <CardContent>
          <p className="mb-3 text-xs text-forest-400">{t('setup.removeDesc')}</p>
          <div className="grid grid-cols-4 gap-2">
            {SETUP_PLAYER_COUNTS.map((count, i) => {
              const index = i as 0 | 1 | 2 | 3
              const parts = [removal.flat, removal.byPlayers[index], removal.rareExtra].filter((n) => n > 0)
              return (
                <div key={count} className="rounded-xl bg-forest-50 px-1 py-2 text-center ring-1 ring-forest-100">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-forest-500">
                    <Users className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">{t('setup.players', { count })}</span>
                    <span aria-hidden="true">{count}</span>
                  </div>
                  <p className="text-xl font-bold leading-tight text-forest-700">{totalRemoved(removal, index)}</p>
                  {parts.length > 1 && (
                    <p className="text-[10px] leading-tight text-forest-400">{parts.join(' + ')}</p>
                  )}
                </div>
              )
            })}
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-forest-500">
            {removal.flat > 0 && <li>{t('setup.noteFlat')}</li>}
            {removal.pileHints.map((h) => (
              <li key={h.players}>{t('setup.notePiles', { count: h.players, piles: h.piles, remove: h.remove })}</li>
            ))}
            {removal.rareExtra > 0 && <li>{t('setup.noteExploration')}</li>}
            {edition === 'dartmoor' && (
              <li>{t(hasExmoor ? 'setup.noteExmoorCaves' : 'setup.noteDartmoorCaves')}</li>
            )}
            <li>{t('setup.noteWinter')}</li>
            {removal.solo && <li>{t('setup.noteSolo', { count: totalRemoved(removal, 0) })}</li>}
          </ul>
          {collapsible && (
            <Link to="/settings" className="mt-3 inline-block text-xs font-medium text-forest-500 hover:text-forest-600">
              {t('newGame.changeInSettings')}
            </Link>
          )}
        </CardContent>
      )}
    </Card>
  )
}
