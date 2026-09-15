import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, UserPlus, X, Trash2, Pencil, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { usePlayers, useCreatePlayer, useUpdatePlayer, useDeletePlayer } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import { PLAYER_COLORS, type Player } from '@/types/player'
import { playerNameKey } from '@/lib/supabase-api'
import { noAutofill } from '@/lib/no-autofill'

const inputClass =
  'flex-1 min-w-0 rounded-lg border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700 placeholder:text-forest-300 focus:border-forest-400 focus:outline-none'

export function PlayersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: players = [] } = usePlayers()
  const createPlayerMutation = useCreatePlayer()
  const updatePlayerMutation = useUpdatePlayer()
  const deletePlayerMutation = useDeletePlayer()
  const { data: games = [] } = useGames()

  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)

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

  function startEdit(player: Player) {
    setEditingId(player.id)
    setEditName(player.name)
    setEditError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditError(null)
  }

  async function handleRename(player: Player) {
    const name = editName.trim()
    if (!name || name === player.name) {
      cancelEdit()
      return
    }
    const key = playerNameKey(name)
    const clash = players.find((p) => p.id !== player.id && playerNameKey(p.name) === key)
    if (clash) {
      setEditError(t('players.renameDuplicate', { name: clash.name }))
      return
    }
    try {
      await updatePlayerMutation.mutateAsync({ id: player.id, updates: { name } })
      cancelEdit()
    } catch (err) {
      console.error('Failed to rename player:', err)
      const code = (err as { code?: string } | null)?.code
      setEditError(
        code === '23505'
          ? t('players.renameDuplicate', { name })
          : t('players.renameFailed'),
      )
    }
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
          const avatar = (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold shrink-0"
              style={{ backgroundColor: player.color }}
            >
              {player.name.charAt(0).toUpperCase()}
            </div>
          )

          if (editingId === player.id) {
            return (
              <Card key={player.id}>
                <CardContent className="py-3">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleRename(player) }}
                    autoComplete="off"
                    className="flex items-center gap-2"
                  >
                    {avatar}
                    <input
                      type="text"
                      name="player-rename"
                      {...noAutofill}
                      aria-label={t('players.rename')}
                      value={editName}
                      onChange={(e) => { setEditName(e.target.value); setEditError(null) }}
                      onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
                      autoFocus
                      disabled={updatePlayerMutation.isPending}
                      className={inputClass}
                    />
                    <button
                      type="submit"
                      title={t('players.rename')}
                      disabled={!editName.trim() || updatePlayerMutation.isPending}
                      className="text-forest-500 hover:text-forest-700 disabled:text-forest-200 transition-colors p-1"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={cancelEdit} className="text-forest-400 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                  {editError && (
                    <p className="mt-2 text-xs text-red-600 pl-12">{editError}</p>
                  )}
                </CardContent>
              </Card>
            )
          }

          return (
            <Link key={player.id} to={`/players/${player.id}`}>
              <Card className="hover:shadow-card-hover transition-shadow">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    {avatar}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest-700 truncate">{player.name}</p>
                      <p className="text-xs text-forest-400">
                        {t('players.stats', { games: stats.gamesPlayed, wins: stats.wins })}
                      </p>
                    </div>
                    <button
                      type="button"
                      title={t('players.rename')}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        startEdit(player)
                      }}
                      className="text-forest-300 hover:text-forest-600 transition-colors p-1"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (stats.gamesPlayed > 0) {
                          if (!confirm(t('players.removeWithHistoryWarning', { name: player.name, count: stats.gamesPlayed }))) return
                          if (!confirm(t('players.removeConfirmFinal', { name: player.name }))) return
                        } else {
                          if (!confirm(t('players.removeConfirm', { name: player.name }))) return
                        }
                        deletePlayerMutation.mutate(player.id)
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
            <form onSubmit={(e) => { e.preventDefault(); handleAdd() }} autoComplete="off" className="flex items-center gap-2">
              <input
                type="text"
                name="player-name"
                {...noAutofill}
                placeholder={t('players.playerName')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className={inputClass}
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
