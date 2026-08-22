import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Mountain, Globe, Download, Trash2, MessageSquare, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/settings-store'
import { usePlayers } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import { useScoringStore } from '@/store/scoring-store'
import { deleteAllDeviceData } from '@/lib/supabase-api'
import { STAT_ICONS } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { LanguagePicker } from '@/components/LanguagePicker'
import { FeedbackForm } from '@/components/FeedbackForm'
import { isPlayStoreApp, openPlayStoreListing } from '@/lib/play-store'

export function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { edition, setEdition, includeAlpine, toggleAlpine, includeWoodland, toggleWoodland, includeExploration, toggleExploration, includeExmoor, toggleExmoor } = useSettingsStore()
  const endScoringSession = useScoringStore((s) => s.endSession)
  const scoringSessionActive = useScoringStore((s) => s.sessionActive)
  const { data: games = [] } = useGames()
  const { data: players = [] } = usePlayers()
  const [searchParams] = useSearchParams()
  const feedbackRef = useRef<HTMLDivElement>(null)

  // Deep link from the home-page notice (/settings?feedback=1) scrolls to the form.
  useEffect(() => {
    if (searchParams.get('feedback') !== null) {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

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

  async function handleClearData() {
    if (!confirm(t('settings.clearConfirm1'))) return
    if (!confirm(t('settings.clearConfirm2'))) return
    try {
      await deleteAllDeviceData()
    } catch (err) {
      console.error('Failed to delete device data from Supabase:', err)
      alert(t('settings.clearError'))
      return
    }
    // Wipe every forest-shuffle-* key from both storages so settings,
    // last-joined-player, active live sessions and the scoring wizard
    // all reset.
    for (const storage of [localStorage, sessionStorage]) {
      const keys: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key?.startsWith('forest-shuffle-')) keys.push(key)
      }
      for (const key of keys) storage.removeItem(key)
    }
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

      {/* Edition selector */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.edition')}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 mb-3">{t('settings.editionDesc')}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (edition !== 'classic') {
                  if (scoringSessionActive && !confirm(t('settings.editionChangeConfirm'))) return
                  setEdition('classic')
                  if (scoringSessionActive) endScoringSession()
                }
              }}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                edition === 'classic'
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
              )}
            >
              {t('settings.classicEdition')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (edition !== 'dartmoor') {
                  if (scoringSessionActive && !confirm(t('settings.editionChangeConfirm'))) return
                  setEdition('dartmoor')
                  if (scoringSessionActive) endScoringSession()
                }
              }}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                edition === 'dartmoor'
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
              )}
            >
              {t('settings.dartmoorEdition')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (edition !== 'smoky') {
                  if (scoringSessionActive && !confirm(t('settings.editionChangeConfirm'))) return
                  setEdition('smoky')
                  if (scoringSessionActive) endScoringSession()
                }
              }}
              className={cn(
                'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                edition === 'smoky'
                  ? 'bg-forest-500 text-white'
                  : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
              )}
            >
              {t('settings.smokyEdition')}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Expansion toggles — only for classic edition */}
      {edition === 'classic' && (
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
              <div className="flex items-center gap-2">
                <img src={STAT_ICONS.alpine} alt="" className="h-4 w-4 rounded-sm" />
                <p className="text-sm font-medium text-forest-700">{t('settings.alpineExpansion')}</p>
              </div>
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
              <div className="flex items-center gap-2">
                <img src={STAT_ICONS.woodland_edge} alt="" className="h-4 w-4 rounded-sm" />
                <p className="text-sm font-medium text-forest-700">{t('settings.woodlandExpansion')}</p>
              </div>
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src={STAT_ICONS.cave} alt="" className="h-4 w-4 rounded-sm" />
                <p className="text-sm font-medium text-forest-700">{t('settings.explorationExpansion')}</p>
              </div>
              <p className="text-xs text-forest-400">{t('settings.explorationDesc')}</p>
            </div>
            <button
              type="button"
              onClick={toggleExploration}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeExploration ? 'bg-forest-500' : 'bg-forest-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeExploration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
      )}

      {edition === 'dartmoor' && (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mountain className="h-4 w-4 text-blue-500" />
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.expansions')}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src={STAT_ICONS.exmoor} alt="" className="h-4 w-4" />
                <p className="text-sm font-medium text-forest-700">{t('settings.exmoorExpansion')}</p>
              </div>
              <p className="text-xs text-forest-400">{t('settings.exmoorDesc')}</p>
            </div>
            <button
              type="button"
              onClick={toggleExmoor}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                includeExmoor ? 'bg-forest-500' : 'bg-forest-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeExmoor ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
      )}

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
          <LanguagePicker />
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

      {/* Rate — only reachable from the Play Store build */}
      {isPlayStoreApp() && (
        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-forest-700">{t('settings.rateApp')}</p>
                  <p className="text-xs text-forest-400">{t('settings.rateDesc')}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={openPlayStoreListing}>
                {t('settings.rate')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      <Card ref={feedbackRef} className="relative z-20 mb-4 scroll-mt-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-forest-500" />
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('feedback.title')}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-forest-400 mb-3">{t('feedback.desc')}</p>
          <FeedbackForm />
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
