import { useSettingsStore } from '@/store/settings-store'

const LANG_CYCLE = ['en', 'fr', 'de', 'es'] as const
const LANG_LABELS: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
}

export function LanguageToggle() {
  const { language, setLanguage } = useSettingsStore()

  function toggle() {
    const idx = LANG_CYCLE.indexOf(language)
    const next = LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]!
    setLanguage(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-md px-2 py-1 text-xs font-semibold text-forest-500 hover:bg-forest-100 transition-colors"
    >
      {LANG_LABELS[language]}
    </button>
  )
}
