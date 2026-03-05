import { useMemo, useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardCounter } from '@/components/scoring/CardCounter'
import { WizardStepper, getWizardSteps } from '@/components/scoring/WizardStepper'
import { ScoreSummary } from '@/components/scoring/ScoreSummary'
import { useScoringStore } from '@/store/scoring-store'
import { useLiveSessionStore } from '@/store/live-session-store'
import { useLiveSession } from '@/hooks/use-live-session'
import { getCardsByCategory } from '@/data/cards'
import { scoreCard, buildForestContext } from '@/lib/scoring'
import { cn } from '@/lib/utils'
import { CARD_ICONS } from '@/data/cardIcons'
import { getCategoryOrder } from '@/data/categories'
import { submitPlayerScoring, updateLivePlayerStatus } from '@/lib/supabase-api'

const SPECIAL_CAVE_KEYS = ['collectors_cave', 'bat_cave', 'lonely_cave'] as const

export function LiveScoreWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { session, players: livePlayers, allDone } = useLiveSession(sessionId)
  const { myPlayerId } = useLiveSessionStore()
  const [submitted, setSubmitted] = useState(false)

  const {
    sessionActive,
    players,
    expansions,
    edition,
    currentStep,
    setCurrentStep,
    setCardCount,
    setCardMetadata,
    setFullyOccupiedTrees,
  } = useScoringStore()
  const startSession = useScoringStore((s) => s.startSession)

  // Start a single-player scoring session for this player
  useEffect(() => {
    if (session && myPlayerId && !sessionActive) {
      const myLivePlayer = livePlayers.find((p) => p.player_id === myPlayerId)
      if (myLivePlayer) {
        startSession(
          [{ id: myLivePlayer.player_id, name: myLivePlayer.player_name }],
          session.expansions,
          session.edition,
        )
        updateLivePlayerStatus(myPlayerId, session.id, 'scoring')
      }
    }
  }, [session, myPlayerId, livePlayers, sessionActive, startSession])

  // Navigate to results when all done
  useEffect(() => {
    if (allDone && submitted) {
      navigate(`/live/${sessionId}/results`)
    }
  }, [allDone, submitted, sessionId, navigate])

  const wizardSteps = useMemo(() => getWizardSteps(edition), [edition])
  const stepCategories = useMemo(() => getCategoryOrder(edition).map((cat) => [cat]), [edition])
  const cardsByCategory = useMemo(() => getCardsByCategory(expansions, edition), [expansions, edition])

  const currentPlayer = players[0] // Only one player in live mode
  const tc = useTranslation('cards').t

  const isCaveStep = stepCategories[currentStep]?.[0] === 'cave'
  const hasExploration = edition === 'classic' && expansions.includes('exploration')

  const stepCards = useMemo(() => {
    if (!stepCategories[currentStep]) return []
    const cards = stepCategories[currentStep]!.flatMap(
      (cat) => cardsByCategory[cat as keyof typeof cardsByCategory] || [],
    )
    const sorted = cards.sort((a, b) =>
      tc(`${a.key}.name`).localeCompare(tc(`${b.key}.name`)),
    )
    if (isCaveStep && hasExploration) {
      return sorted.filter((c) => !(SPECIAL_CAVE_KEYS as readonly string[]).includes(c.key))
    }
    return sorted
  }, [currentStep, stepCategories, cardsByCategory, tc, isCaveStep, hasExploration])

  const selectedSpecialCave = useMemo(() => {
    if (!currentPlayer) return null
    return SPECIAL_CAVE_KEYS.find((k) => (currentPlayer.cardCounts[k] || 0) > 0) ?? null
  }, [currentPlayer])

  function handleSpecialCaveSelect(key: string | null) {
    if (!currentPlayer) return
    for (const k of SPECIAL_CAVE_KEYS) {
      setCardCount(currentPlayer.playerId, k, k === key ? 1 : 0)
    }
  }

  const getCardPoints = useCallback(
    (cardKey: string) => {
      if (!currentPlayer) return 0
      const count = currentPlayer.cardCounts[cardKey] || 0
      if (count === 0) return 0
      const entry = currentPlayer.breakdown?.entries.find((e) => e.cardKey === cardKey)
      if (entry) return entry.points
      if (edition !== 'dartmoor') {
        const ctx = buildForestContext(
          currentPlayer.cardCounts,
          currentPlayer.cardMetadata,
          currentPlayer.fullyOccupiedTrees,
        )
        const metadata = currentPlayer.cardMetadata[cardKey]
        return scoreCard(cardKey, count, ctx, metadata)
      }
      return 0
    },
    [currentPlayer, edition],
  )

  async function handleSubmit() {
    if (!currentPlayer || !sessionId || !myPlayerId) return
    setSubmitted(true)
    await submitPlayerScoring(myPlayerId, sessionId, {
      card_counts: currentPlayer.cardCounts,
      card_metadata: currentPlayer.cardMetadata,
      fully_occupied_trees: currentPlayer.fullyOccupiedTrees,
    })
  }

  if (!session || !currentPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
      </div>
    )
  }

  if (submitted && !allDone) {
    const donePlayers = livePlayers.filter((p) => p.status === 'done').length
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-forest-500 mb-4" />
        <p className="text-lg font-semibold text-forest-700">{t('live.waitingForOthers')}</p>
        <p className="mt-2 text-sm text-forest-500">
          {t('live.playersFinished', { done: donePlayers, total: livePlayers.length })}
        </p>
      </div>
    )
  }

  const isLastStep = currentStep === wizardSteps.length - 1
  const isFirstStep = currentStep === 0

  function handleNext() {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-forest-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-forest-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-forest-400">{currentPlayer.playerName}</div>
            <h1 className="font-heading text-lg font-bold text-forest-800">{t('wizard.scoreEntry')}</h1>
            <div className="text-xs text-forest-400">{session.code}</div>
          </div>

          <WizardStepper
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            edition={edition}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-lg px-4 py-4">
        <div className="space-y-2">
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

          {isCaveStep && hasExploration && (
            <div className="rounded-xl border border-forest-200 bg-white p-3 mb-1">
              <p className="text-xs font-medium text-forest-600 mb-2">{t('wizard.specialCave')}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSpecialCaveSelect(null)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    selectedSpecialCave === null
                      ? 'bg-forest-500 text-white'
                      : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
                  )}
                >
                  {t('wizard.noneCave')}
                </button>
                {SPECIAL_CAVE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSpecialCaveSelect(key)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      selectedSpecialCave === key
                        ? 'bg-forest-500 text-white'
                        : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
                    )}
                  >
                    {CARD_ICONS[key]} {tc(`${key}.name`)}
                    {selectedSpecialCave === key && (
                      <span className="ml-1 opacity-75">({getCardPoints(key)} {t('scoring.pts')})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stepCards.map((card) => (
            <CardCounter
              key={card.key}
              card={card}
              count={currentPlayer.cardCounts[card.key] || 0}
              points={getCardPoints(card.key)}
              onCountChange={(count) => setCardCount(currentPlayer.playerId, card.key, count)}
              contextValue={currentPlayer.cardMetadata[card.key]?.contextValue}
              onContextChange={
                card.needsContext
                  ? (value) => setCardMetadata(currentPlayer.playerId, card.key, { contextValue: value })
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 border-t border-forest-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3 space-y-2">
          <ScoreSummary breakdown={currentPlayer.breakdown} edition={edition} />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('wizard.back')}
            </Button>
            <Button onClick={handleNext} className="flex-1">
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  {t('live.submit')}
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
