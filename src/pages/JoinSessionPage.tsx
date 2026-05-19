import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePlayers, useCreatePlayer, useUpdatePlayer } from '@/hooks/use-players'
import { useLiveSessionStore } from '@/store/live-session-store'
import { useSettingsStore } from '@/store/settings-store'
import { fetchLiveSessionByCode, joinLiveSession } from '@/lib/supabase-api'
import { readLastJoinedPlayer, writeLastJoinedPlayer } from '@/lib/last-joined-player'
import { PLAYER_COLORS } from '@/types/player'

export function JoinSessionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: storedPlayers = [] } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const updatePlayerMutation = useUpdatePlayer()
  const { setSession, setPlayer } = useLiveSessionStore()
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  const lastPlayer = useMemo(() => readLastJoinedPlayer(), [])
  const [code, setCode] = useState('')
  const [playerName, setPlayerName] = useState(lastPlayer?.name ?? '')
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  async function handleJoin() {
    const trimmedName = playerName.trim()
    if (code.length !== 4 || !trimmedName) return
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

      // Resolve player identity: reuse the last-joined player if still in DB,
      // updating the stored name if the user tweaked it. Otherwise create a
      // fresh player record.
      let playerId: string
      const existing = lastPlayer
        ? storedPlayers.find((p) => p.id === lastPlayer.id)
        : null
      if (existing) {
        playerId = existing.id
        if (existing.name !== trimmedName) {
          await updatePlayerMutation.mutateAsync({
            id: existing.id,
            updates: { name: trimmedName },
          })
        }
      } else {
        playerId = crypto.randomUUID()
        const color = PLAYER_COLORS[storedPlayers.length % PLAYER_COLORS.length]!
        await createPlayerMutation.mutateAsync({
          id: playerId,
          name: trimmedName,
          color,
        })
      }

      writeLastJoinedPlayer({ id: playerId, name: trimmedName })

      await joinLiveSession(session.id, playerId, trimmedName)
      setSession(session.id, session.code, false)
      setPlayer(playerId, trimmedName)
      // Force the joining player's language to match the session's language
      setLanguage(session.language)
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

      {/* Player name */}
      <div className="mb-6">
        <p className="text-sm font-medium text-forest-600 mb-2">{t('live.yourName')}</p>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder={t('newGame.playerName')}
          autoFocus={!lastPlayer}
          className="w-full rounded-xl border-2 border-forest-200 bg-white px-4 py-3 text-base text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none"
        />
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-red-500">{error}</p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleJoin}
        disabled={code.length !== 4 || !playerName.trim() || joining}
      >
        {joining ? t('live.joining') : t('live.joinSession')}
      </Button>
    </div>
  )
}
