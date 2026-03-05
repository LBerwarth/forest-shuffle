import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { CATEGORY_ICONS, CATEGORY_ORDER, getCategoryOrder } from '@/data/categories'
import type { GameEdition } from '@/types/card'

export const WIZARD_STEPS = CATEGORY_ORDER.map((cat, id) => ({
  id,
  category: cat,
  icon: CATEGORY_ICONS[cat],
}))

export function getWizardSteps(edition: GameEdition) {
  return getCategoryOrder(edition).map((cat, id) => ({
    id,
    category: cat,
    icon: CATEGORY_ICONS[cat],
  }))
}

interface WizardStepperProps {
  currentStep: number
  onStepChange: (step: number) => void
  completedSteps?: Set<number>
  edition?: GameEdition
}

export function WizardStepper({ currentStep, onStepChange, completedSteps, edition = 'classic' }: WizardStepperProps) {
  const { t } = useTranslation()
  const steps = getWizardSteps(edition)

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-1 py-2">
      {steps.map((step) => {
        const isComplete = completedSteps?.has(step.id) ?? false
        const isCurrent = step.id === currentStep

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepChange(step.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
              isCurrent
                ? 'bg-forest-500 text-white shadow-sm'
                : isComplete
                  ? 'bg-forest-100 text-forest-600'
                  : 'bg-white text-forest-400 border border-forest-200',
            )}
          >
            {isComplete && !isCurrent ? (
              <Check className="h-3 w-3" />
            ) : (
              <span className="text-xs">{step.icon}</span>
            )}
            {t(`category.${step.category}`)}
          </button>
        )
      })}
    </div>
  )
}
