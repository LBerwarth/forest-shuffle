import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { usePlayers, useCreatePlayer } from '@/hooks/use-players'
import { useLiveSessionStore } from '@/store/live-session-store'
import { fetchLiveSessionByCode, joinLiveSession } from '@/lib/supabase-api'
import { PLAYER_COLORS } from '@/types/player'
import { cn } from '@/lib/utils'

export function JoinSessionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: storedPlayers = [] } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const { setSession, setPlayer } = useLiveSessionStore()

  const [code, setCode] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showNewPlayer, setShowNewPlayer] = useState(false)

  async function handleAddPlayer() {
    if (!newPlayerName.trim()) return
    const id = crypto.randomUUID()
    const color = PLAYER_COLORS[storedPlayers.length % PLAYER_COLORS.length]!
    try {
      await createPlayerMutation.mutateAsync({ id, name: newPlayerName.trim(), color })
      setSelectedPlayerId(id)
    } catch (err) {
      console.error('Failed to create player:', err)
    }
    setNewPlayerName('')
    setShowNewPlayer(false)
  }

  async function handleJoin() {
    if (code.length !== 4 || !selectedPlayerId) return
    setError(null)
    setJoining(true)

    try {
      const session = await fetchLiveSessionByCode(code)
      if (!session) {
        setError(t('live.sessionNotFound'))
        setJoining(false)
        return
      }
      if (session.status !== 'waiting') {
        setError(t('live.sessionAlreadyStarted'))
        setJoining(false)
        return
      }

      const player = storedPlayers.find((p) => p.id === selectedPlayerId)
      if (!player) return

      await joinLiveSession(session.id, player.id, player.name)
      setSession(session.id, session.code, false)
      setPlayer(player.id, player.name)
      navigate(`/live/${session.id}`)
    } catch (err) {
      console.error('Failed to join session:', err)
      setError(t('live.joinError'))
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500 hover:text-forest-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('live.joinTitle')}</h1>
      </div>

      {/* Code input */}
      <div className="mb-6">
        <p className="text-sm font-medium text-forest-600 mb-2">{t('live.enterCode')}</p>
        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ''))}
          placeholder="ABCD"
          className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-forest-700 placeholder:text-forest-200 placeholder:tracking-[0.5em] focus:border-forest-400 focus:outline-none"
        />
      </div>

      {/* Player selection */}
      <div className="mb-4">
        <p className="text-sm font-medium text-forest-600 mb-2">{t('live.selectPlayer')}</p>
        <div className="space-y-2">
          {storedPlayers.map((player) => {
            const isSelected = selectedPlayerId === player.id
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
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

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleJoin}
        disabled={code.length !== 4 || !selectedPlayerId || joining}
      >
        {joining ? t('live.joining') : t('live.joinSession')}
      </Button>
    </div>
  )
}
