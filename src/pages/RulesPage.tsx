import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, BookOpen, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { CARDS } from '@/data/cards'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'
import { getCardIconUrl } from '@/data/cardIcons'
import { CATEGORY_ICON_URLS } from '@/data/categories'
import { STAT_ICONS } from '@/assets/icons'
import { cn } from '@/lib/utils'
import type { CardCategory, CardDefinition, GameEdition } from '@/types/card'

type EditionFilter = 'all' | GameEdition
type CategoryFilter = 'all' | CardCategory

const CLASSIC_CATEGORIES: CardCategory[] = ['tree', 'top', 'bottom', 'lateral', 'cave']
const DARTMOOR_CATEGORIES: CardCategory[] = ['tree', 'moor', 'top', 'bottom', 'lateral', 'cave']

export function RulesPage() {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [edition, setEdition] = useState<EditionFilter>('all')
  const [category, setCategory] = useState<CategoryFilter>('all')

  const allCards = useMemo<CardDefinition[]>(() => {
    if (edition === 'classic') return CARDS
    if (edition === 'dartmoor') return DARTMOOR_CARDS
    return [...CARDS, ...DARTMOOR_CARDS]
  }, [edition])

  const availableCategories = useMemo<CardCategory[]>(() => {
    if (edition === 'dartmoor') return DARTMOOR_CATEGORIES
    if (edition === 'classic') return CLASSIC_CATEGORIES
    return DARTMOOR_CATEGORIES
  }, [edition])

  const filtered = useMemo(() => {
    const query = search.trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    return allCards
      .filter((card) => {
        if (category !== 'all' && card.category !== category) return false
        if (query) {
          const name = tc(`${card.key}.name`).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
          if (!name.includes(query)) return false
        }
        return true
      })
      .sort((a, b) => {
        if (a.category !== b.category) {
          return availableCategories.indexOf(a.category) - availableCategories.indexOf(b.category)
        }
        return tc(`${a.key}.name`).localeCompare(tc(`${b.key}.name`))
      })
  }, [allCards, category, search, tc, availableCategories])

  const grouped = useMemo(() => {
    const map = new Map<CardCategory, CardDefinition[]>()
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, [])
      map.get(c.category)!.push(c)
    }
    return map
  }, [filtered])

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('rules.title')}</h1>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('rules.search')}
          className="w-full rounded-xl border border-forest-200 bg-white py-2.5 pl-9 pr-9 text-sm text-forest-800 placeholder:text-forest-400 focus:border-forest-500 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Edition filter */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">
          {t('rules.edition')}
        </span>
        {(['all', 'classic', 'dartmoor'] as EditionFilter[]).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => {
              setEdition(e)
              setCategory('all')
            }}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
              edition === e
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {t(`rules.edition_${e}`)}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <span className="shrink-0 text-[11px] font-medium text-forest-400 mr-1">
          {t('rules.category')}
        </span>
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all',
            category === 'all'
              ? 'bg-forest-500 text-white'
              : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
          )}
        >
          {t('rules.category_all')}
        </button>
        {availableCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all',
              category === c
                ? 'bg-forest-500 text-white'
                : 'bg-forest-100 text-forest-500 hover:bg-forest-200',
            )}
          >
            {CATEGORY_ICON_URLS[c] && (
              <img src={CATEGORY_ICON_URLS[c]} alt="" className="h-3.5 w-3.5" />
            )}
            {t(`category.${c}`)}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-forest-200 mx-auto mb-3" />
          <p className="text-sm text-forest-400">{t('rules.noMatches')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableCategories.map((cat) => {
            const cards = grouped.get(cat)
            if (!cards || cards.length === 0) return null
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  {CATEGORY_ICON_URLS[cat] && (
                    <img src={CATEGORY_ICON_URLS[cat]} alt="" className="h-4 w-4" />
                  )}
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-forest-500">
                    {t(`category.${cat}`)}
                  </h2>
                  <span className="text-[10px] text-forest-400">({cards.length})</span>
                </div>
                <div className="space-y-1.5">
                  {cards.map((card) => (
                    <CardRow key={card.key} card={card} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CardRow({ card }: { card: CardDefinition }) {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t
  const iconUrl = getCardIconUrl(card.key)
  const name = tc(`${card.key}.name`)
  const scoring = tc(`${card.key}.scoring`, { defaultValue: '' })
  const context = card.needsContext ? tc(`${card.key}.context`, { defaultValue: '' }) : ''

  const visibleTags = card.tags.filter((t) => STAT_ICONS[t])

  return (
    <Card>
      <CardContent className="py-2.5 px-3">
        <div className="flex items-start gap-3">
          {iconUrl && (
            <img src={iconUrl} alt="" className="h-8 w-8 rounded-md shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-semibold text-forest-800">{name}</span>
              {card.expansion !== 'base' && card.expansion !== 'dartmoor_base' && (
                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-medium text-blue-700">
                  {t(`rules.exp_${card.expansion}`)}
                </span>
              )}
              {visibleTags.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {visibleTags.map((tag) => (
                    <img
                      key={tag}
                      src={STAT_ICONS[tag]}
                      alt={tag}
                      title={t(`tag.${tag}`, { defaultValue: tag })}
                      className="h-3.5 w-3.5"
                    />
                  ))}
                </div>
              )}
            </div>
            {scoring && (
              <p className="text-xs text-forest-600 leading-snug">{scoring}</p>
            )}
            {context && (
              <p className="text-[11px] text-bark-600 mt-1 italic">↳ {context}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
