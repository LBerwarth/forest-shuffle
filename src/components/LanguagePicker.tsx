import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en' as const, label: 'EN' },
  { code: 'fr' as const, label: 'FR' },
  { code: 'de' as const, label: 'DE' },
  { code: 'es' as const, label: 'ES' },
]

export function LanguagePicker() {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="flex gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            language === code
              ? 'bg-forest-500 text-white'
              : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
