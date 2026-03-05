import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserPlus, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { usePlayers, useCreatePlayer, useDeletePlayer } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import { PLAYER_COLORS } from '@/types/player'

export function PlayersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: players = [] } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const deletePlayerMutation = useDeletePlayer()
  const { data: games = [] } = useGames()

  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    try {
      await createPlayerMutation.mutateAsync({
        id: crypto.randomUUID(),
        name: newName.trim(),
        color: PLAYER_COLORS[players.length % PLAYER_COLORS.length]!,
      })
    } catch (err) {
      console.error('Failed to create player:', err)
    }
    setNewName('')
    setShowForm(false)
  }

  function getPlayerStats(playerId: string) {
    const playerGames = games.filter((g) =>
      g.players.some((p) => p.player_id === playerId),
    )
    const wins = playerGames.filter((g) =>
      g.players.some((p) => p.player_id === playerId && p.is_winner),
    ).length
    return { gamesPlayed: playerGames.length, wins }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">{t('players.title')}</h1>
      </div>

      <div className="space-y-2 mb-4">
        {players.map((player) => {
          const stats = getPlayerStats(player.id)
          return (
            <Link key={player.id} to={`/players/${player.id}`}>
              <Card className="hover:shadow-card-hover transition-shadow">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shrink-0"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest-700 truncate">{player.name}</p>
                      <p className="text-xs text-forest-400">
                        {t('players.stats', { games: stats.gamesPlayed, wins: stats.wins })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (confirm(t('players.removeConfirm', { name: player.name }))) deletePlayerMutation.mutate(player.id)
                      }}
                      className="text-forest-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {players.length === 0 && (
          <p className="text-center text-sm text-forest-400 py-8">
            {t('players.noPlayers')}
          </p>
        )}
      </div>

      {showForm ? (
        <Card>
          <CardContent className="py-3">
            <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('players.playerName')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="flex-1 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={!newName.trim()}>
                {t('players.add')}
              </Button>
              <button type="button" onClick={() => setShowForm(false)} className="text-forest-400">
                <X className="h-4 w-4" />
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setShowForm(true)}>
          <UserPlus className="h-4 w-4" />
          {t('players.addPlayer')}
        </Button>
      )}
    </div>
  )
}
