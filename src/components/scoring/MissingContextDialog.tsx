import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { STAT_ICONS } from '@/assets/icons'
import { getCardIconUrl } from '@/data/cardIcons'
import type { CardDefinition } from '@/types/card'

interface MissingContextDialogProps {
  cards: CardDefinition[]
  onReview: (card: CardDefinition) => void
  onContinue: () => void
}

function cardIcon(card: CardDefinition): string | undefined {
  for (const tag of card.tags) {
    if (tag === 'alpine' || tag === 'woodland_edge') continue
    if (STAT_ICONS[tag]) return STAT_ICONS[tag]
  }
  return getCardIconUrl(card.key)
}

export function MissingContextDialog({ cards, onReview, onContinue }: MissingContextDialogProps) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <h2 className="font-heading text-base font-bold text-forest-800">
            {t('wizard.missingContextTitle')}
          </h2>
        </div>
        <p className="mb-3 text-sm text-forest-600">{t('wizard.missingContextDesc')}</p>
        <div className="mb-4 max-h-60 space-y-1.5 overflow-y-auto">
          {cards.map((card) => {
            const icon = cardIcon(card)
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onReview(card)}
                className="flex w-full items-center gap-2 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-left transition-colors hover:bg-forest-100"
              >
                {icon && <img src={icon} alt="" className="h-5 w-5 shrink-0 rounded-sm" />}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-forest-800">
                    {tc(`${card.key}.name`)}
                  </span>
                  <span className="block text-[11px] text-forest-500">
                    {tc(`${card.key}.context`)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onContinue} className="flex-1">
            {t('wizard.missingContextContinue')}
          </Button>
          <Button onClick={() => onReview(cards[0])} className="flex-1">
            {t('wizard.missingContextReview')}
          </Button>
        </div>
      </div>
    </div>
  )
}
