import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'es' as const, label: 'Español' },
]

export function LanguagePicker() {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="grid grid-cols-2 gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition-all',
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
