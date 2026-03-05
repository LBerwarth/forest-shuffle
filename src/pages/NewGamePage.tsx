import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, X, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { usePlayers, useCreatePlayer } from '@/hooks/use-players'
import { useScoringStore } from '@/store/scoring-store'
import { useSettingsStore } from '@/store/settings-store'
import { PLAYER_COLORS } from '@/types/player'
import { cn } from '@/lib/utils'
import type { Expansion } from '@/types/card'

export function NewGamePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: storedPlayers = [], isLoading: playersLoading } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const startSession = useScoringStore((s) => s.startSession)
  const edition = useSettingsStore((s) => s.edition)
  const includeAlpine = useSettingsStore((s) => s.includeAlpine)
  const includeWoodland = useSettingsStore((s) => s.includeWoodland)
  const includeExploration = useSettingsStore((s) => s.includeExploration)

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

    let expansions: Expansion[]
    if (edition === 'dartmoor') {
      expansions = ['dartmoor_base']
    } else {
      expansions = ['base']
      if (includeAlpine) expansions.push('alpine')
      if (includeWoodland) expansions.push('woodland')
      if (includeExploration) expansions.push('exploration')
    }

    startSession(players, expansions, edition)
    navigate(`/score/${crypto.randomUUID()}`)
  }

  const expansionLabels: string[] = []
  if (edition === 'dartmoor') {
    expansionLabels.push('Dartmoor')
  } else {
    if (includeAlpine) expansionLabels.push('Alpine')
    if (includeWoodland) expansionLabels.push('Woodland')
    if (includeExploration) expansionLabels.push('Exploration')
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500 hover:text-forest-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('newGame.title')}</h1>
      </div>

      {/* Player selection */}
      <div className="mb-4">
        <p className="text-sm font-medium text-forest-600 mb-2">
          {t('newGame.selectPlayers')}
        </p>
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

      {/* Expansion info */}
      <p className="mb-4 text-xs text-center text-forest-400">
        {expansionLabels.length > 0
          ? `${expansionLabels.join(' + ')} ${t('newGame.expansionsEnabled')}`
          : t('newGame.baseOnly')
        } •{' '}
        <button type="button" onClick={() => navigate('/settings')} className="underline hover:text-forest-500">
          {t('newGame.changeInSettings')}
        </button>
      </p>

      {/* Start button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleStart}
        disabled={selectedPlayerIds.length < 2}
      >
        {t('newGame.startScoring', { count: selectedPlayerIds.length })}
      </Button>
    </div>
  )
}
