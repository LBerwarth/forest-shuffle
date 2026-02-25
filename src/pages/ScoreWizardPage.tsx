import { useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardCounter } from '@/components/scoring/CardCounter'
import { WizardStepper, WIZARD_STEPS } from '@/components/scoring/WizardStepper'
import { ScoreSummary } from '@/components/scoring/ScoreSummary'
import { useScoringStore } from '@/store/scoring-store'
import { getCardsByCategory } from '@/data/cards'
import { scoreCard, buildForestContext } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import type { CardCategory } from '@/types/card'

const STEP_CATEGORIES: CardCategory[][] = [
  ['tree'],
  ['top'],
  ['bottom'],
  ['left'],
  ['right'],
  ['cave'],
]

export function ScoreWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const {
    sessionActive,
    players,
    includeAlpine,
    currentPlayerIndex,
    currentStep,
    setCurrentPlayer,
    setCurrentStep,
    setCardCount,
    setCardMetadata,
    setFullyOccupiedTrees,
  } = useScoringStore()

  const cardsByCategory = useMemo(() => getCardsByCategory(includeAlpine), [includeAlpine])

  const currentPlayer = players[currentPlayerIndex]

  const stepCards = useMemo(() => {
    if (!STEP_CATEGORIES[currentStep]) return []
    return STEP_CATEGORIES[currentStep]!.flatMap(
      (cat) => cardsByCategory[cat] || [],
    )
  }, [currentStep, cardsByCategory])

  const getCardPoints = useCallback(
    (cardKey: string) => {
      if (!currentPlayer) return 0
      const count = currentPlayer.cardCounts[cardKey] || 0
      if (count === 0) return 0
      const ctx = buildForestContext(
        currentPlayer.cardCounts,
        currentPlayer.cardMetadata,
        currentPlayer.fullyOccupiedTrees,
      )
      const metadata = currentPlayer.cardMetadata[cardKey]
      return scoreCard(cardKey, count, ctx, metadata)
    },
    [currentPlayer],
  )

  if (!sessionActive || !currentPlayer) {
    navigate('/new-game')
    return null
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1
  const isFirstStep = currentStep === 0
  const isLastPlayer = currentPlayerIndex === players.length - 1

  function handleNext() {
    if (isLastStep) {
      if (isLastPlayer) {
        navigate(`/score/${gameId}/results`)
      } else {
        setCurrentPlayer(currentPlayerIndex + 1)
        setCurrentStep(0)
      }
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrev() {
    if (isFirstStep) {
      if (currentPlayerIndex > 0) {
        setCurrentPlayer(currentPlayerIndex - 1)
        setCurrentStep(WIZARD_STEPS.length - 1)
      }
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-forest-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-forest-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => navigate('/new-game')} className="text-forest-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-heading text-lg font-bold text-forest-800">{t('wizard.scoreEntry')}</h1>
            <div className="w-5" />
          </div>

          {/* Player tabs */}
          <div className="flex gap-1 mb-2">
            {players.map((player, idx) => (
              <button
                key={player.playerId}
                type="button"
                onClick={() => {
                  setCurrentPlayer(idx)
                  setCurrentStep(0)
                }}
                className={cn(
                  'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all truncate',
                  idx === currentPlayerIndex
                    ? 'bg-forest-500 text-white'
                    : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
                )}
              >
                {player.playerName}
                {player.breakdown && (
                  <span className="ml-1 opacity-75">{player.breakdown.total}</span>
                )}
              </button>
            ))}
          </div>

          {/* Step indicator */}
          <WizardStepper
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-lg px-4 py-4">
        <div className="space-y-2">
          {/* Special: fully occupied trees for Oak step */}
          {currentStep === 0 && (
            <div className="flex items-center justify-between rounded-xl border border-bark-200 bg-bark-50 px-4 py-3 mb-3">
              <div>
                <p className="text-sm font-medium text-bark-700">{t('wizard.fullyOccupiedTrees')}</p>
                <p className="text-xs text-bark-500">{t('wizard.fullyOccupiedDesc')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFullyOccupiedTrees(currentPlayer.playerId, currentPlayer.fullyOccupiedTrees - 1)}
                  disabled={currentPlayer.fullyOccupiedTrees <= 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-bark-100 text-bark-600 hover:bg-bark-200 disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-bark-700 tabular-nums">
                  {currentPlayer.fullyOccupiedTrees}
                </span>
                <button
                  type="button"
                  onClick={() => setFullyOccupiedTrees(currentPlayer.playerId, currentPlayer.fullyOccupiedTrees + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-bark-200 text-bark-700 hover:bg-bark-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {stepCards.map((card) => (
            <CardCounter
              key={card.key}
              card={card}
              count={currentPlayer.cardCounts[card.key] || 0}
              points={getCardPoints(card.key)}
              onCountChange={(count) =>
                setCardCount(currentPlayer.playerId, card.key, count)
              }
              contextValue={currentPlayer.cardMetadata[card.key]?.contextValue}
              onContextChange={
                card.needsContext
                  ? (value) =>
                      setCardMetadata(currentPlayer.playerId, card.key, { contextValue: value })
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-forest-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3 space-y-2">
          <ScoreSummary breakdown={currentPlayer.breakdown} />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={isFirstStep && currentPlayerIndex === 0}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('wizard.back')}
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {isLastStep && isLastPlayer ? (
                <>
                  <Check className="h-4 w-4" />
                  {t('wizard.finish')}
                </>
              ) : (
                <>
                  {t('wizard.next')}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
