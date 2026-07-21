import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Check, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/settings-store'
import { submitFeedback, type FeedbackItem } from '@/lib/supabase-api'
import { CARDS } from '@/data/cards'
import { DARTMOOR_CARDS } from '@/data/dartmoor-cards'
import { EXMOOR_CARDS } from '@/data/exmoor-cards'
import { cn } from '@/lib/utils'

const FEEDBACK_EMAIL = 'lena.berw@gmail.com'

// Every card key across all editions, deduped — a report can be about any of them.
const ALL_CARD_KEYS = Array.from(
  new Set([...CARDS, ...DARTMOOR_CARDS, ...EXMOOR_CARDS].map((c) => c.key)),
)

export function FeedbackForm() {
  const { t } = useTranslation()
  const tc = useTranslation('cards').t
  const language = useSettingsStore((s) => s.language)
  const appVersion = t('settings.version')

  const [items, setItems] = useState<FeedbackItem[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const pickerRef = useRef<HTMLDivElement>(null)

  const cardName = (key: string) => tc(`${key}.name`, { defaultValue: key })

  // Full card list sorted by localized name; the dropdown shows it as soon as
  // the picker is focused, before any typing.
  const sortedKeys = useMemo(
    () => [...ALL_CARD_KEYS].sort((a, b) => cardName(a).localeCompare(cardName(b))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language],
  )

  const chosen = new Set(items.map((i) => i.cardKey))
  const q = query.trim().toLowerCase()
  const options = sortedKeys.filter(
    (k) => !chosen.has(k) && (!q || cardName(k).toLowerCase().includes(q)),
  )

  useEffect(() => {
    if (!open) return
    function onDocMouseDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  function addCard(key: string) {
    setItems((prev) => [...prev, { cardKey: key, type: 'translation', proposition: '' }])
    setQuery('')
    // Keep the dropdown open so several cards can be added in a row.
  }

  function updateItem(index: number, patch: Partial<FeedbackItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const canSend = items.length > 0 || message.trim().length > 0

  function buildMailto(): string {
    const lines: string[] = []
    if (message.trim()) lines.push(message.trim())
    if (items.length) {
      if (lines.length) lines.push('')
      for (const it of items) {
        const type = t(`feedback.type_${it.type}`)
        lines.push(`• ${cardName(it.cardKey)} [${type}]${it.proposition.trim() ? `: ${it.proposition.trim()}` : ''}`)
      }
    }
    lines.push('', `— ${t('settings.language')}: ${language} · ${t('settings.appName')} ${appVersion}`)
    return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(t('feedback.emailSubject'))}&body=${encodeURIComponent(lines.join('\n'))}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend || status === 'sending') return
    setStatus('sending')
    // Store first; keep going to the email even if the DB write fails so the
    // feedback is never lost.
    try {
      await submitFeedback({ language, appVersion, message: message.trim() || undefined, items })
    } catch (err) {
      console.error('Failed to store feedback:', err)
    }
    window.location.href = buildMailto()
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-forest-50 px-3 py-3 text-sm text-forest-600">
        <Check className="h-4 w-4 shrink-0 text-forest-500" />
        {t('feedback.sent')}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Primary: free-text feedback — works on its own, no card needed */}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('feedback.messagePlaceholder')}
        rows={3}
        className="w-full resize-y rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none"
      />

      {/* Optional: attach one or more specific cards */}
      <div ref={pickerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-left text-sm text-forest-400 transition-colors hover:border-forest-300"
        >
          <span>{t('feedback.addCard')}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-forest-200 bg-white shadow-card">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('wizard.searchCards')}
              className="w-full border-b border-forest-100 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:outline-none"
            />
            <div className="max-h-56 overflow-y-auto">
              {options.length > 0 ? (
                options.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addCard(key)}
                    className="block w-full px-3 py-2 text-left text-sm text-forest-700 hover:bg-forest-50"
                  >
                    {cardName(key)}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-forest-300">{t('feedback.noMatches')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected cards */}
      {items.map((it, i) => (
        <div key={it.cardKey} className="rounded-xl border border-forest-200 bg-white p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-forest-800">{cardName(it.cardKey)}</span>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-forest-300 hover:text-red-500 transition-colors"
              aria-label={t('feedback.remove')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {(['translation', 'rule'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateItem(i, { type })}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-all',
                  it.type === type
                    ? 'bg-forest-500 text-white'
                    : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
                )}
              >
                {t(`feedback.type_${type}`)}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={it.proposition}
            onChange={(e) => updateItem(i, { proposition: e.target.value })}
            placeholder={t('feedback.propositionPlaceholder')}
            className="w-full rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none"
          />
        </div>
      ))}

      <Button type="submit" size="sm" disabled={!canSend || status === 'sending'}>
        <Send className="h-3.5 w-3.5" />
        {status === 'sending' ? t('feedback.sending') : t('feedback.send')}
      </Button>
    </form>
  )
}
