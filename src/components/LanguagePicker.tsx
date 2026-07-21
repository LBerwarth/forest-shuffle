import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'es' as const, label: 'Español' },
  { code: 'nl' as const, label: 'Nederlands' },
  { code: 'it' as const, label: 'Italiano' },
  { code: 'pl' as const, label: 'Polski' },
  { code: 'pt' as const, label: 'Português' },
  { code: 'cs' as const, label: 'Čeština' },
  { code: 'hu' as const, label: 'Magyar' },
  { code: 'uk' as const, label: 'Українська' },
  { code: 'ru' as const, label: 'Русский' },
  { code: 'tr' as const, label: 'Türkçe' },
  { code: 'ca' as const, label: 'Català' },
]

export function LanguagePicker() {
  const { language, setLanguage } = useSettingsStore()

  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
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
