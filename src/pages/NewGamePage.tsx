import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, X, UserPlus, Wifi, Calculator, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { NoAppNotice } from '@/components/NoAppNotice'
import { usePlayers, useCreatePlayer, useDeletePlayer } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import { useScoringStore } from '@/store/scoring-store'
import { useSettingsStore } from '@/store/settings-store'
import { useLiveSessionStore } from '@/store/live-session-store'
import { createLiveSession, joinLiveSession } from '@/lib/supabase-api'
import { readLastJoinedPlayer, writeLastJoinedPlayer } from '@/lib/last-joined-player'
import { PLAYER_COLORS } from '@/types/player'
import { STAT_ICONS } from '@/assets/icons'
import { cn } from '@/lib/utils'
import { noAutofill } from '@/lib/no-autofill'
import type { Expansion } from '@/types/card'

export function NewGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: storedPlayers = [] } = usePlayers()
  const { data: games = [] } = useGames()
  const createPlayerMutation = useCreatePlayer()
  const deletePlayerMutation = useDeletePlayer()
  const startSession = useScoringStore((s) => s.startSession)
  const { setSession, setPlayer } = useLiveSessionStore()
  const { edition, setEdition, language, includeAlpine, toggleAlpine, includeWoodland, toggleWoodland, includeExploration, toggleExploration, includeExmoor, toggleExmoor } = useSettingsStore()

  const [step, setStep] = useState<'setup' | 'mode' | 'players'>('setup')
  const [mode, setMode] = useState<'local' | 'live' | null>(null)
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showNewPlayer, setShowNewPlayer] = useState(false)
  const [selectedLiveHostId, setSelectedLiveHostId] = useState<string | null>(null)
  const [creatingLive, setCreatingLive] = useState(false)

  // Pre-select the last-joined player as host once stored players load —
  // common case: the host running this device joins their own session as
  // themselves, so they should not have to tap anything.
  useEffect(() => {
    if (selectedLiveHostId) return
    const lastPlayer = readLastJoinedPlayer()
    if (lastPlayer && storedPlayers.some((p) => p.id === lastPlayer.id)) {
      setSelectedLiveHostId(lastPlayer.id)
    }
  }, [storedPlayers, selectedLiveHostId])

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : prev.length < 5 ? [...prev, id] : prev,
    )
  }

  function handleDeletePlayer(playerId: string, playerName: string) {
    const gameCount = games.filter((g) =>
      g.players.some((p) => p.player_id === playerId),
    ).length
    if (gameCount > 0) {
      if (!confirm(t('players.removeWithHistoryWarning', { name: playerName, count: gameCount }))) return
      if (!confirm(t('players.removeConfirmFinal', { name: playerName }))) return
    } else {
      if (!confirm(t('players.removeConfirm', { name: playerName }))) return
    }
    setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId))
    deletePlayerMutation.mutate(playerId)
  }

  async function handleAddPlayer() {
    if (!newPlayerName.trim()) return
    const id = crypto.randomUUID()
    const color = PLAYER_COLORS[storedPlayers.length % PLAYER_COLORS.length]!
    try {
      // createPlayer may return an existing same-name profile, whose id differs
      // from the one we generated — always select the id it hands back.
      const created = await createPlayerMutation.mutateAsync({ id, name: newPlayerName.trim(), color })
      if (mode === 'live') {
        setSelectedLiveHostId(created.id)
      } else {
        setSelectedPlayerIds((prev) =>
          prev.includes(created.id) ? prev : [...prev, created.id],
        )
      }
    } catch (err) {
      console.error('Failed to create player:', err)
    }
    setNewPlayerName('')
    setShowNewPlayer(false)
  }

  function handleStart() {
    if (selectedPlayerIds.length < 1) return
    const players = selectedPlayerIds
      .map((id) => storedPlayers.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({ id: p!.id, name: p!.name }))

    startSession(players, getExpansions(), edition)
    navigate(`/score/${crypto.randomUUID()}`)
  }

  function getExpansions(): Expansion[] {
    if (edition === 'smoky') return ['smoky_base']
    if (edition === 'dartmoor') return includeExmoor ? ['dartmoor_base', 'dartmoor_exmoor'] : ['dartmoor_base']
    const exp: Expansion[] = ['base']
    if (includeAlpine) exp.push('alpine')
    if (includeWoodland) exp.push('woodland')
    if (includeExploration) exp.push('exploration')
    return exp
  }

  async function handleCreateLive() {
    if (!selectedLiveHostId || creatingLive) return
    const host = storedPlayers.find((p) => p.id === selectedLiveHostId)
    if (!host) return
    setCreatingLive(true)

    try {
      writeLastJoinedPlayer({ id: host.id, name: host.name })

      const session = await createLiveSession(edition, getExpansions(), host.id, language)
      await joinLiveSession(session.id, host.id, host.name)
      setSession(session.id, session.code, true)
      setPlayer(host.id, host.name)
      navigate(`/live/${session.id}`)
    } catch (err) {
      console.error('Failed to create live session:', err)
    } finally {
      setCreatingLive(false)
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
              <button
                type="button"
                onClick={() => setEdition('smoky')}
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
              <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.expansions')}</h2>
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
              <h2 className="font-heading text-base font-semibold text-forest-700">{t('settings.expansions')}</h2>
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

  if (mode === 'live') {
    return (
      <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => setStep('mode')} className="text-forest-500 hover:text-forest-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-heading text-xl font-bold text-forest-800">{t('live.createSession')}</h1>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-forest-600 mb-2">{t('live.selectPlayer')}</p>
          <div className="space-y-2">
            {storedPlayers.map((player) => {
              const isSelected = selectedLiveHostId === player.id
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedLiveHostId(player.id)}
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
                </button>
              )
            })}
          </div>
        </div>

        {showNewPlayer ? (
          <Card className="mb-6">
            <CardContent className="py-3">
              <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer() }} autoComplete="off" className="flex items-center gap-2">
                <input
                  type="text"
                  name="player-name"
                  {...noAutofill}
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

        <NoAppNotice className="mb-6" />

        <Button
          size="lg"
          className="w-full"
          onClick={handleCreateLive}
          disabled={!selectedLiveHostId || creatingLive}
        >
          <Wifi className="h-5 w-5" />
          {creatingLive ? t('live.creating') : t('live.createSession')}
        </Button>
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
              <div
                key={player.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 transition-all',
                  isSelected
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-forest-100 bg-white hover:border-forest-200',
                )}
              >
                <button
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className="flex flex-1 items-center gap-3 text-left min-w-0"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-forest-700 truncate">{player.name}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs font-bold text-forest-500 shrink-0">
                      #{selectedPlayerIds.indexOf(player.id) + 1}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlayer(player.id, player.name)}
                  className="text-forest-300 hover:text-red-500 transition-colors p-1 shrink-0"
                  aria-label={t('players.removeConfirm', { name: player.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add new player */}
      {showNewPlayer ? (
        <Card className="mb-6">
          <CardContent className="py-3">
            <form onSubmit={(e) => { e.preventDefault(); handleAddPlayer() }} autoComplete="off" className="flex items-center gap-2">
              <input
                type="text"
                name="player-name"
                {...noAutofill}
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

      {/* Local mode start button */}
      {selectedPlayerIds.length === 1 && (
        <p className="mb-3 text-center text-xs text-forest-500">{t('newGame.soloHint')}</p>
      )}
      <Button
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={selectedPlayerIds.length < 1}
      >
        {t('newGame.startScoring', { count: selectedPlayerIds.length })}
      </Button>
    </div>
  )
}
