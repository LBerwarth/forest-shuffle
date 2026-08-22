import { useMemo, useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardCounter } from '@/components/scoring/CardCounter'
import { MissingContextDialog } from '@/components/scoring/MissingContextDialog'
import { SetSeriesBreakdown } from '@/components/scoring/SetSeriesBreakdown'
import { WizardStepper, getWizardSteps } from '@/components/scoring/WizardStepper'
import { ScoreSummary } from '@/components/scoring/ScoreSummary'
import { useScoringStore } from '@/store/scoring-store'
import { getCards, getCardsByCategory } from '@/data/cards'
import { scoreCard, buildForestContext, scoreDartmoorCard, buildDartmoorForestContext, scoreSmokyCard, buildSmokyForestContext, scoreButterflySet, scoreDragonflySet, getButterflySeriesBreakdown, getDragonflySeriesBreakdown, getSquirrelSeriesBreakdown } from '@/lib/scoring'
import { getMultiplierStats } from '@/lib/scoring/multiplier-stats'
import { findMissingContextCards } from '@/lib/scoring/missing-context'
import { cn } from '@/lib/utils'
import { noAutofill } from '@/lib/no-autofill'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { getCardIconUrl } from '@/data/cardIcons'
import { STAT_ICONS } from '@/assets/icons'
import { getCategoryOrder } from '@/data/categories'
import type { CardDefinition, CardTag, Expansion } from '@/types/card'

const EXPANSION_ORDER: readonly Expansion[] = ['alpine', 'woodland', 'exploration', 'dartmoor_exmoor'] as const

const EXPANSION_ICON_KEY: Record<Expansion, string | null> = {
  base: null,
  alpine: 'alpine',
  woodland: 'woodland_edge',
  exploration: 'cave',
  dartmoor_base: null,
  dartmoor_exmoor: 'exmoor',
  smoky_base: null,
}

const TAG_ORDER: readonly CardTag[] = [
  'tree', 'shrub', 'moor',
  'bird', 'butterfly', 'insect', 'dragonfly', 'bat', 'mouse',
  'pawed', 'cloven_hoofed', 'hoofed', 'deer',
  'amphibian', 'plant', 'mushroom',
] as const

const SPECIAL_CAVE_KEYS = ['collectors_cave', 'bat_cave', 'lonely_cave', 'smugglers_cave', 'supply_cave'] as const
const DARTMOOR_SPECIAL_CAVE_KEYS = ['lonely_cave_d'] as const

export function ScoreWizardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { gameId } = useParams<{ gameId: string }>()
  const {
    sessionActive,
    players,
    expansions,
    edition,
    currentPlayerIndex,
    currentStep,
    setCurrentPlayer,
    setCurrentStep,
    setCardCount,
    setCardMetadata,
    endSession,
  } = useScoringStore()

  function handleCancel() {
    if (!confirm(t('wizard.cancelConfirm'))) return
    navigate('/')
    endSession()
  }

  const wizardSteps = useMemo(() => getWizardSteps(edition), [edition])
  const stepCategories = useMemo(() => getCategoryOrder(edition).map(cat => [cat]), [edition])

  const cardsByCategory = useMemo(() => getCardsByCategory(expansions, edition), [expansions, edition])

  const currentPlayer = players[currentPlayerIndex]

  const availableHostKeys = useMemo<readonly string[]>(() => {
    if (!currentPlayer) return []
    const treeCards = cardsByCategory.tree || []
    return treeCards
      .filter((c) => !c.tags.includes('shrub'))
      .filter((c) => (currentPlayer.cardCounts[c.key] || 0) > 0)
      .map((c) => c.key)
  }, [cardsByCategory, currentPlayer])

  const availableHostPlantKeys = useMemo<readonly string[]>(() => {
    if (!currentPlayer) return []
    const bottomCards = cardsByCategory.bottom || []
    return bottomCards
      .filter((c) => c.tags.includes('plant'))
      .filter((c) => (currentPlayer.cardCounts[c.key] || 0) > 0)
      .map((c) => c.key)
  }, [cardsByCategory, currentPlayer])

  const availableHostBirdKeys = useMemo<readonly string[]>(() => {
    if (!currentPlayer) return []
    return getCards(expansions, edition)
      .filter((c) => c.tags.includes('bird'))
      .filter((c) => (currentPlayer.cardCounts[c.key] || 0) > 0)
      .map((c) => c.key)
  }, [expansions, edition, currentPlayer])

  const tc = useTranslation('cards').t

  const [cardSearch, setCardSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<CardTag | null>(null)
  const [expansionFilter, setExpansionFilter] = useState<Expansion | null>(null)
  const [missingContextCards, setMissingContextCards] = useState<CardDefinition[] | null>(null)

  useEffect(() => {
    setTagFilter(null)
    setExpansionFilter(null)
  }, [currentStep])

  const isCaveStep = stepCategories[currentStep]?.[0] === 'cave'
  const hasExploration = edition === 'classic' && expansions.includes('exploration')
  const isDartmoor = edition === 'dartmoor'
  // Exmoor replaces the base caves, so Cave 4 (lonely_cave_d) is not selectable
  const hasExmoor = isDartmoor && expansions.includes('dartmoor_exmoor')
  const activeSpecialCaveKeys = hasExploration ? SPECIAL_CAVE_KEYS : isDartmoor && !hasExmoor ? DARTMOOR_SPECIAL_CAVE_KEYS : []
  const hasSpecialCaves = activeSpecialCaveKeys.length > 0

  const stepCards = useMemo(() => {
    if (!stepCategories[currentStep]) return []
    const cards = stepCategories[currentStep]!.flatMap(
      (cat) => cardsByCategory[cat as keyof typeof cardsByCategory] || [],
    )
    const sorted = cards.sort((a, b) =>
      tc(`${a.key}.name`).localeCompare(tc(`${b.key}.name`)),
    )
    // Filter out special caves — they're shown as a pill selector
    if (isCaveStep && hasSpecialCaves) {
      return sorted.filter(c => !(activeSpecialCaveKeys as readonly string[]).includes(c.key))
    }
    return sorted
  }, [currentStep, stepCategories, cardsByCategory, tc, isCaveStep, hasSpecialCaves, activeSpecialCaveKeys])

  // Snapshot which cards have counts when entering a step, so the sort
  // order stays stable while the user is actively editing.
  const countsSnapshotRef = useRef<Record<string, number>>({})
  const prevStepRef = useRef(currentStep)
  if (currentStep !== prevStepRef.current) {
    prevStepRef.current = currentStep
    countsSnapshotRef.current = currentPlayer ? { ...currentPlayer.cardCounts } : {}
  }

  const availableStepTags = useMemo<CardTag[]>(() => {
    const present = new Set<CardTag>()
    for (const c of stepCards) for (const tag of c.tags) present.add(tag)
    return TAG_ORDER.filter((tag) => present.has(tag) && STAT_ICONS[tag])
  }, [stepCards])

  const availableStepExpansions = useMemo<Expansion[]>(() => {
    const present = new Set<Expansion>()
    for (const c of stepCards) present.add(c.expansion)
    return EXPANSION_ORDER.filter((exp) => present.has(exp))
  }, [stepCards])

  const filteredCards = useMemo(() => {
    let cards = stepCards
    if (cardSearch.trim()) {
      const query = cardSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      cards = cards.filter(card =>
        tc(`${card.key}.name`).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(query),
      )
    }
    if (tagFilter) {
      cards = cards.filter(card => card.tags.includes(tagFilter))
    }
    if (expansionFilter) {
      cards = cards.filter(card => card.expansion === expansionFilter)
    }
    const snapshot = countsSnapshotRef.current
    return [...cards].sort((a, b) => {
      const aHas = (snapshot[a.key] || 0) > 0 ? 0 : 1
      const bHas = (snapshot[b.key] || 0) > 0 ? 0 : 1
      return aHas - bHas
    })
  }, [stepCards, cardSearch, tagFilter, expansionFilter, tc, currentStep])

  const selectedSpecialCave = useMemo(() => {
    if (!currentPlayer) return null
    return activeSpecialCaveKeys.find(
      k => (currentPlayer.cardCounts[k] || 0) > 0,
    ) ?? null
  }, [currentPlayer, activeSpecialCaveKeys])

  function handleSpecialCaveSelect(key: string | null) {
    if (!currentPlayer) return
    for (const k of activeSpecialCaveKeys) {
      setCardCount(currentPlayer.playerId, k, k === key ? 1 : 0)
    }
  }

  const getCardPoints = useCallback(
    (cardKey: string) => {
      if (!currentPlayer) return 0
      // Always check the pre-computed breakdown first — it includes synergy effects
      const entry = currentPlayer.breakdown?.entries.find(e => e.cardKey === cardKey)
      if (entry) return entry.points
      // Fallback: compute inline
      const count = currentPlayer.cardCounts[cardKey] || 0
      if (count === 0) return 0
      if (edition === 'smoky') {
        const ctx = buildSmokyForestContext(
          currentPlayer.cardCounts,
          currentPlayer.cardMetadata,
          currentPlayer.fullyOccupiedTrees,
        )
        const metadata = currentPlayer.cardMetadata[cardKey]
        return scoreSmokyCard(cardKey, count, ctx, metadata)
      }
      if (edition === 'dartmoor') {
        const ctx = buildDartmoorForestContext(
          currentPlayer.cardCounts,
          currentPlayer.cardMetadata,
          currentPlayer.fullyOccupiedTrees,
        )
        const metadata = currentPlayer.cardMetadata[cardKey]
        return scoreDartmoorCard(cardKey, count, ctx, metadata)
      }
      const ctx = buildForestContext(
        currentPlayer.cardCounts,
        currentPlayer.cardMetadata,
        currentPlayer.fullyOccupiedTrees,
      )
      const metadata = currentPlayer.cardMetadata[cardKey]
      return scoreCard(cardKey, count, ctx, metadata)
    },
    [currentPlayer, edition],
  )

  const forestContext = useMemo(() => {
    if (!currentPlayer) return null
    if (edition === 'smoky') {
      return buildSmokyForestContext(
        currentPlayer.cardCounts,
        currentPlayer.cardMetadata,
        currentPlayer.fullyOccupiedTrees,
      )
    }
    if (edition === 'dartmoor') {
      return buildDartmoorForestContext(
        currentPlayer.cardCounts,
        currentPlayer.cardMetadata,
        currentPlayer.fullyOccupiedTrees,
      )
    }
    return buildForestContext(
      currentPlayer.cardCounts,
      currentPlayer.cardMetadata,
      currentPlayer.fullyOccupiedTrees,
    )
  }, [currentPlayer, edition])

  if (!sessionActive || !currentPlayer) {
    return <Navigate to="/new-game" replace />
  }

  const isLastStep = currentStep === wizardSteps.length - 1
  const isFirstStep = currentStep === 0
  const isLastPlayer = currentPlayerIndex === players.length - 1

  function finishPlayer() {
    if (isLastPlayer) {
      navigate(`/score/${gameId}/results`)
    } else {
      setCurrentPlayer(currentPlayerIndex + 1)
      setCurrentStep(0)
    }
  }

  function handleNext() {
    setCardSearch('')
    if (isLastStep) {
      if (!currentPlayer) return
      const missing = findMissingContextCards(
        getCards(expansions, edition),
        currentPlayer.cardCounts,
        currentPlayer.cardMetadata,
      )
      if (missing.length > 0) {
        setMissingContextCards(missing)
        return
      }
      finishPlayer()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleReviewMissing(card: CardDefinition) {
    setMissingContextCards(null)
    const step = stepCategories.findIndex((cats) => cats.includes(card.category))
    if (step >= 0) setCurrentStep(step)
    setCardSearch(tc(`${card.key}.name`))
  }

  function handlePrev() {
    setCardSearch('')
    if (isFirstStep) {
      if (currentPlayerIndex > 0) {
        setCurrentPlayer(currentPlayerIndex - 1)
        setCurrentStep(wizardSteps.length - 1)
      }
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-forest-50">
      {missingContextCards && (
        <MissingContextDialog
          cards={missingContextCards}
          onReview={handleReviewMissing}
          onContinue={() => {
            setMissingContextCards(null)
            finishPlayer()
          }}
        />
      )}
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-forest-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => navigate('/new-game')} className="text-forest-500">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-heading text-lg font-bold text-forest-800">{t('wizard.scoreEntry')}</h1>
            <button
              type="button"
              onClick={handleCancel}
              aria-label={t('wizard.cancel')}
              className="text-forest-400 hover:text-red-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
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
                  <span className="ml-1 opacity-75 inline-flex items-center gap-0.5">{player.breakdown.total}<AcornIcon className="h-3 w-3" /></span>
                )}
              </button>
            ))}
          </div>

          {/* Step indicator */}
          <WizardStepper
            currentStep={currentStep}
            onStepChange={(step) => { setCardSearch(''); setCurrentStep(step) }}
            edition={edition}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto w-full max-w-lg px-4 py-4">
        <div className="space-y-2">
          {/* Card search filter */}
          <div className="relative mb-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              name="card-search"
              {...noAutofill}
              value={cardSearch}
              onChange={(e) => setCardSearch(e.target.value)}
              placeholder={t('wizard.searchCards')}
              className="w-full rounded-xl border border-forest-200 bg-white py-2.5 pl-9 pr-9 text-sm text-forest-800 placeholder:text-forest-400 focus:border-forest-500 focus:outline-none"
            />
            {cardSearch && (
              <button
                type="button"
                onClick={() => setCardSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tag + expansion filter chips */}
          {(availableStepTags.length > 0 || availableStepExpansions.length > 0) && (
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
              <button
                type="button"
                onClick={() => {
                  setTagFilter(null)
                  setExpansionFilter(null)
                }}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all shrink-0',
                  tagFilter === null && expansionFilter === null
                    ? 'bg-forest-500 text-white'
                    : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
                )}
              >
                {t('leaderboard.allTags')}
              </button>
              {availableStepTags.map((tag) => {
                const active = tagFilter === tag
                return (
                  <button
                    key={`tag-${tag}`}
                    type="button"
                    onClick={() => setTagFilter(active ? null : tag)}
                    title={t(`tag.${tag}`)}
                    aria-label={t(`tag.${tag}`)}
                    className={cn(
                      'flex items-center justify-center rounded-full p-0.5 transition-all shrink-0',
                      active
                        ? 'ring-2 ring-forest-500 bg-forest-500'
                        : 'bg-forest-100 hover:bg-forest-200',
                    )}
                  >
                    <img
                      src={STAT_ICONS[tag]}
                      alt=""
                      className="h-5 w-5 rounded-full"
                    />
                  </button>
                )
              })}
              {availableStepExpansions.map((exp) => {
                const iconKey = EXPANSION_ICON_KEY[exp]
                if (!iconKey) return null
                const active = expansionFilter === exp
                return (
                  <button
                    key={`exp-${exp}`}
                    type="button"
                    onClick={() => setExpansionFilter(active ? null : exp)}
                    title={t(`expansion.${exp}`)}
                    aria-label={t(`expansion.${exp}`)}
                    className={cn(
                      'flex items-center justify-center rounded-full p-0.5 transition-all shrink-0',
                      active
                        ? 'ring-2 ring-forest-500 bg-forest-500'
                        : 'bg-forest-100 hover:bg-forest-200',
                    )}
                  >
                    <img
                      src={STAT_ICONS[iconKey]}
                      alt=""
                      className="h-5 w-5 rounded-full"
                    />
                  </button>
                )
              })}
            </div>
          )}

          {/* Special cave selector */}
          {isCaveStep && hasSpecialCaves && (
            <div className="rounded-xl border border-forest-200 bg-white p-3 mb-1">
              <p className="text-xs font-medium text-forest-600 mb-2">{t('wizard.specialCave')}</p>
              <div className="flex flex-wrap gap-1.5">
                {/* None option */}
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
                {activeSpecialCaveKeys.map(key => (
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
                    {getCardIconUrl(key) && <img src={getCardIconUrl(key)} alt="" className="inline-block h-4 w-4 rounded-sm" />} {tc(`${key}.name`)}
                    {selectedSpecialCave === key && (
                      <span className="ml-1 opacity-75 inline-flex items-center gap-0.5">({getCardPoints(key)}<AcornIcon className="h-3 w-3" />)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentPlayer && (() => {
            const totalCards = stepCards.reduce((sum, card) => sum + (currentPlayer.cardCounts[card.key] || 0), 0)
            return totalCards > 0 ? (
              <div className="flex items-center justify-between rounded-lg bg-forest-100 px-3 py-1.5">
                <span className="text-xs font-medium text-forest-600">{t('wizard.categoryTotal')}</span>
                <span className="text-sm font-bold text-forest-700 tabular-nums">{totalCards} {totalCards === 1 ? t('wizard.card') : t('wizard.cards')}</span>
              </div>
            ) : null
          })()}

          {stepCategories[currentStep]?.[0] === 'top' && forestContext && (
            edition === 'smoky' ? (
              <SetSeriesBreakdown
                series={getSquirrelSeriesBreakdown(forestContext)}
                iconUrl={STAT_ICONS.pawed}
                titleKey="wizard.squirrelSet"
              />
            ) : edition === 'dartmoor' ? (
              <SetSeriesBreakdown
                series={getDragonflySeriesBreakdown(forestContext)}
                iconUrl={STAT_ICONS.dragonfly}
                titleKey="wizard.dragonflySet"
              />
            ) : (
              <SetSeriesBreakdown
                series={getButterflySeriesBreakdown(forestContext)}
                iconUrl={STAT_ICONS.butterfly}
                titleKey="wizard.butterflySet"
              />
            )
          )}

          {filteredCards.map((card) => (
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
                card.needsContext &&
                (!card.contextOnlyWithExpansion || expansions.includes(card.contextOnlyWithExpansion))
                  ? (value) =>
                      setCardMetadata(currentPlayer.playerId, card.key, { contextValue: value })
                  : undefined
              }
              hostCardKeys={currentPlayer.cardMetadata[card.key]?.hostCardKeys}
              availableHostKeys={
                card.needsHostTreeContext
                  ? availableHostKeys
                  : card.needsHostPlantContext
                    ? availableHostPlantKeys
                    : card.needsHostBirdContext
                      ? availableHostBirdKeys
                      : undefined
              }
              availableHostCounts={
                card.needsHostPlantContext || card.needsHostBirdContext ? currentPlayer.cardCounts : undefined
              }
              onHostsChange={
                card.needsHostTreeContext || card.needsHostPlantContext || card.needsHostBirdContext
                  ? (next) =>
                      setCardMetadata(currentPlayer.playerId, card.key, { hostCardKeys: next })
                  : undefined
              }
              multiplierStats={forestContext ? getMultiplierStats(card.key, forestContext, edition) : undefined}
              setBonus={
                card.scoringType === 'set' && forestContext
                  ? card.tags.includes('dragonfly')
                    ? scoreDragonflySet(forestContext)
                    : card.tags.includes('butterfly')
                      ? scoreButterflySet(forestContext)
                      : undefined
                  : undefined
              }
              solo={players.length === 1}
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
