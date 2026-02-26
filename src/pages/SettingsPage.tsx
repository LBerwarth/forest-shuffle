import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Mountain, Globe, Download, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/settings-store'
import { useGameStore } from '@/store/game-store'
import { cn } from '@/lib/utils'

const LANGUAGES = [
  { code: 'en' as const, label: 'English' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'es' as const, label: 'Español' },
]

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { includeAlpine, toggleAlpine, includeWoodland, toggleWoodland, language, setLanguage } = useSettingsStore()
  const games = useGameStore((s) => s.games)
  const players = useGameStore((s) => s.players)

  function handleExport() {
    const data = { players, games, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forest-shuffle-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleClearData() {
    if (!confirm(t('settings.clearConfirm1'))) return
    if (!confirm(t('settings.clearConfirm2'))) return
    localStorage.removeItem('forest-shuffle-games')
    localStorage.removeItem('forest-shuffle-settings')
    sessionStorage.removeItem('forest-shuffle-scoring')
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('settings.title')}</h1>
      </div>

      {/* Expansion toggles */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-blue-500" />
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.expansions')}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700">{t('settings.alpineExpansion')}</p>
              <p className="text-xs text-forest-400">{t('settings.alpineDesc')}</p>
            </div>
            <button
              type="button"
              onClick={toggleAlpine}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeAlpine ? 'bg-forest-500' : 'bg-forest-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeAlpine ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700">{t('settings.woodlandExpansion')}</p>
              <p className="text-xs text-forest-400">{t('settings.woodlandDesc')}</p>
            </div>
            <button
              type="button"
              onClick={toggleWoodland}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeWoodland ? 'bg-forest-500' : 'bg-forest-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeWoodland ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-forest-500" />
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.language')}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 mb-3">{t('settings.languageDesc')}</p>
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
        </CardContent>
      </Card>

      {/* Data management */}
      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.data')}</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700">{t('settings.exportData')}</p>
              <p className="text-xs text-forest-400">{t('settings.exportDesc')}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" />
              {t('settings.export')}
            </Button>
          </div>

          <div className="border-t border-forest-100 pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t('settings.clearData')}</p>
                <p className="text-xs text-forest-400">{t('settings.clearDesc')}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={handleClearData}>
                <Trash2 className="h-3.5 w-3.5" />
                {t('settings.clear')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="py-4 text-center">
          <p className="text-sm font-medium text-forest-600">{t('settings.appName')}</p>
          <p className="text-xs text-forest-400 mt-1">{t('settings.version')}</p>
          <p className="text-xs text-forest-300 mt-2">
            {t('settings.appDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
