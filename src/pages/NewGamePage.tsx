import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, X, UserPlus, Wifi, Globe, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { usePlayers, useCreatePlayer } from '@/hooks/use-players'
import { useScoringStore } from '@/store/scoring-store'
import { useSettingsStore } from '@/store/settings-store'
import { useLiveSessionStore } from '@/store/live-session-store'
import { createLiveSession, joinLiveSession } from '@/lib/supabase-api'
import { LanguagePicker } from '@/components/LanguagePicker'
import { PLAYER_COLORS } from '@/types/player'
import { cn } from '@/lib/utils'
import type { Expansion } from '@/types/card'

export function NewGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: storedPlayers = [] } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const startSession = useScoringStore((s) => s.startSession)
  const { setSession, setPlayer } = useLiveSessionStore()
  const { edition, setEdition, language, includeAlpine, toggleAlpine, includeWoodland, toggleWoodland, includeExploration, toggleExploration } = useSettingsStore()

  const [step, setStep] = useState<'setup' | 'mode' | 'players'>('setup')
  const [mode, setMode] = useState<'local' | 'live' | null>(null)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showNewPlayer, setShowNewPlayer] = useState(false)

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : prev.length < 5 ? [...prev, id] : prev,
    )
  }

  async function handleAddPlayer() {
    if (!newPlayerName.trim()) return
    const id = crypto.randomUUID()
    const color = PLAYER_COLORS[storedPlayers.length % PLAYER_COLORS.length]!
    try {
      await createPlayerMutation.mutateAsync({ id, name: newPlayerName.trim(), color })
    } catch (err) {
      console.error('Failed to create player:', err)
    }
    setSelectedPlayerIds((prev) => [...prev, id])
    setNewPlayerName('')
    setShowNewPlayer(false)
  }

  function handleStart() {
    if (selectedPlayerIds.length < 2) return
    const players = selectedPlayerIds
      .map((id) => storedPlayers.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, name: p!.name }))

    startSession(players, getExpansions(), edition)
    navigate(`/score/${crypto.randomUUID()}`)
  }

  function getExpansions(): Expansion[] {
    if (edition === 'dartmoor') return ['dartmoor_base']
    const exp: Expansion[] = ['base']
    if (includeAlpine) exp.push('alpine')
    if (includeWoodland) exp.push('woodland')
    if (includeExploration) exp.push('exploration')
    return exp
  }

  async function handleCreateLive() {
    if (selectedPlayerIds.length < 1) return
    const host = storedPlayers.find((p) => p.id === selectedPlayerIds[0])
    if (!host) return

    try {
      const session = await createLiveSession(edition, getExpansions(), host.id, language)
      await joinLiveSession(session.id, host.id, host.name)
      setSession(session.id, session.code, true)
      setPlayer(host.id, host.name)
      navigate(`/live/${session.id}`)
    } catch (err) {
      console.error('Failed to create live session:', err)
    }
  }

  if (step === 'setup') {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="text-forest-500 hover:text-forest-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-xl font-bold text-forest-800">{t('newGame.title')}</h1>
        </div>

        {/* Edition selector */}
        <Card className="mb-4">
          <CardHeader>
            <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.edition')}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-forest-400 mb-3">{t('settings.editionDesc')}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEdition('classic')}
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
                onClick={() => setEdition('dartmoor')}
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  edition === 'dartmoor'
                    ? 'bg-forest-500 text-white'
                    : 'bg-forest-100 text-forest-600 hover:bg-forest-200',
                )}
              >
                {t('settings.dartmoorEdition')}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Expansion toggles — only for classic edition */}
        {edition === 'classic' && (
          <Card className="mb-4">
            <CardHeader>
              <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.expansions')}</h2>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-forest-700">{t('settings.explorationExpansion')}</p>
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

        {/* Language */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-forest-500" />
              <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.language')}</h2>
            </div>
          </CardHeader>
          <CardContent>
            <LanguagePicker />
          </CardContent>
        </Card>

        {/* Continue to mode selection */}
        <Button
          size="lg"
          className="w-full"
          onClick={() => setStep('mode')}
        >
          {t('wizard.next')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (step === 'mode') {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => setStep('setup')} className="text-forest-500 hover:text-forest-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-xl font-bold text-forest-800">{t('newGame.title')}</h1>
        </div>

        <p className="text-sm font-medium text-forest-600 mb-4">{t('newGame.chooseMode')}</p>

        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => { setMode('local'); setStep('players') }}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-forest-100 bg-white px-4 py-4 text-left transition-all hover:border-forest-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-600 shrink-0">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-forest-700">{t('newGame.localMode')}</p>
              <p className="text-xs text-forest-400">{t('newGame.localModeDesc')}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setMode('live'); setStep('players') }}
            className="flex w-full items-center gap-4 rounded-xl border-2 border-forest-100 bg-white px-4 py-4 text-left transition-all hover:border-forest-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-100 text-forest-600 shrink-0">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-forest-700">{t('newGame.liveMode')}</p>
              <p className="text-xs text-forest-400">{t('newGame.liveModeDesc')}</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => setStep('mode')} className="text-forest-500 hover:text-forest-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('newGame.selectPlayers')}</h1>
      </div>

      {/* Player selection */}
      <div className="mb-4">
        <div className="space-y-2">
          {storedPlayers.map((player) => {
            const isSelected = selectedPlayerIds.includes(player.id)
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all text-left',
                  isSelected
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-forest-100 bg-white hover:border-forest-200',
                )}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-forest-700">{player.name}</span>
                {isSelected && (
                  <span className="ml-auto text-xs font-bold text-forest-500">
                    #{selectedPlayerIds.indexOf(player.id) + 1}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Add new player */}
      {showNewPlayer ? (
        <Card className="mb-6">
          <CardContent className="py-3">
            <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer() }} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('newGame.playerName')}
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                autoFocus
                className="flex-1 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={!newPlayerName.trim()}>
                {t('newGame.add')}
              </Button>
              <button type="button" onClick={() => setShowNewPlayer(false)} className="text-forest-400">
                <X className="h-4 w-4" />
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewPlayer(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-forest-200 py-3 text-sm font-medium text-forest-400 hover:border-forest-300 hover:text-forest-500 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {t('newGame.addNewPlayer')}
        </button>
      )}

      {/* Start button — depends on mode */}
      {mode === 'local' ? (
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          disabled={selectedPlayerIds.length < 2}
        >
          {t('newGame.startScoring', { count: selectedPlayerIds.length })}
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full"
          onClick={handleCreateLive}
          disabled={selectedPlayerIds.length < 1}
        >
          <Wifi className="h-5 w-5" />
          {t('live.createSession')}
        </Button>
      )}
    </div>
  )
}
