import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Copy, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useLiveSession } from '@/hooks/use-live-session'
import { useLiveSessionStore } from '@/store/live-session-store'
import { updateLiveSessionStatus } from '@/lib/supabase-api'

export function LiveLobbyPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { sessionId } = useParams<{ sessionId: string }>()
  const { session, players, isHost, isLoading } = useLiveSession(sessionId)
  const clearSession = useLiveSessionStore((s) => s.clearSession)

  // Auto-navigate when host starts scoring
  useEffect(() => {
    if (session?.status === 'scoring') {
      navigate(`/live/${sessionId}/score`)
    }
  }, [session?.status, sessionId, navigate])

  async function handleStart() {
    if (!sessionId || players.length < 2) return
    await updateLiveSessionStatus(sessionId, 'scoring')
  }

  function handleCopyCode() {
    if (session?.code) {
      navigator.clipboard.writeText(session.code)
    }
  }

  function handleLeave() {
    clearSession()
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forest-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6 text-center">
        <p className="text-forest-500">{t('live.sessionNotFound')}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          {t('result.home')}
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={handleLeave} className="text-forest-500 hover:text-forest-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('live.lobby')}</h1>
      </div>

      {/* Join code */}
      <Card className="mb-6">
        <CardContent className="py-6 text-center">
          <p className="text-sm font-medium text-forest-500 mb-2">{t('live.joinCode')}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-bold tracking-[0.3em] text-forest-700">
              {session.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-lg bg-forest-100 p-2 text-forest-500 hover:bg-forest-200 transition-colors"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-forest-400">{t('live.shareCode')}</p>
        </CardContent>
      </Card>

      {/* Player list */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-forest-500" />
          <p className="text-sm font-medium text-forest-600">
            {t('live.players', { count: players.length })}
          </p>
        </div>
        <div className="space-y-2">
          {players.map((player) => (
            <Card key={player.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-500 text-white text-sm font-bold shrink-0">
                    {player.player_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-forest-700">
                    {player.player_name}
                  </span>
                  {player.player_id === session.host_player_id && (
                    <span className="ml-auto rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-medium text-forest-600">
                      {t('live.host')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions */}
      {isHost ? (
        <Button
          size="lg"
          className="w-full"
          onClick={handleStart}
          disabled={players.length < 2}
        >
          {t('live.startScoring')}
        </Button>
      ) : (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-forest-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">{t('live.waitingForHost')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
