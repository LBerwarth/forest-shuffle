import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calculator, History, Users, BarChart3, Settings, Trophy, Wifi } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { AcornLogo } from '@/components/ui/AcornLogo'
import { Badge } from '@/components/ui/Badge'
import { NoAppNotice } from '@/components/NoAppNotice'
import { usePlayers } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const { data: games = [] } = useGames()
  const { data: players = [] } = usePlayers()
  const recentGame = games[0]

  const quickActions = [
    { to: '/new-game', icon: Calculator, label: t('home.newGame'), description: t('home.scoreGame'), color: 'bg-forest-500' },
    { to: '/history', icon: History, label: t('home.history'), description: t('home.pastGames'), color: 'bg-bark-500' },
    { to: '/players', icon: Users, label: t('home.players'), description: t('home.managePlayers'), color: 'bg-forest-600' },
    { to: '/leaderboard', icon: BarChart3, label: t('home.leaderboard'), description: t('home.rankings'), color: 'bg-bark-600' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6">
      {/* Hero */}
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-forest-500 via-forest-600 to-forest-800 px-5 py-7 text-white shadow-hero">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-white/50">
            <AcornLogo className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {t('home.title')}
            </h1>
            <p className="mt-0.5 text-sm font-light text-forest-50/90">
              {t('home.subtitle')}
            </p>
          </div>
        </div>
        {/* Decorative rolling-hill silhouette along the bottom edge */}
        <svg
          className="pointer-events-none absolute -bottom-px left-0 w-full text-white/10"
          viewBox="0 0 400 48"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            d="M0 30 C 60 12, 120 38, 200 26 S 340 10, 400 28 V 48 H 0 Z"
            fill="currentColor"
          />
          <path
            d="M0 40 C 80 26, 160 44, 240 34 S 360 24, 400 40 V 48 H 0 Z"
            fill="currentColor"
            opacity="0.6"
          />
        </svg>
      </header>

      {/* Quick start */}
      <Link to="/new-game">
        <Button size="lg" className="w-full mb-3 text-base">
          <Calculator className="h-5 w-5" />
          {t('home.scoreNewGame')}
        </Button>
      </Link>
      <Link to="/join">
        <Button variant="secondary" size="lg" className="w-full mb-3 text-base">
          <Wifi className="h-5 w-5" />
          {t('live.joinSession')}
        </Button>
      </Link>

      <NoAppNotice className="mb-6" />

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickActions.map(({ to, icon: Icon, label, description, color }) => (
          <Link key={to} to={to}>
            <Card className="h-full hover:shadow-card-hover transition-shadow">
              <CardContent className="flex flex-col items-center gap-2 py-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-forest-700">{label}</p>
                  <p className="text-xs text-forest-400">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent game */}
      {recentGame && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <p className="text-xs text-forest-400 font-medium mb-1">{t('home.lastGame')}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-forest-700">
                  {t('home.playerCount', { count: recentGame.players.length })}
                </p>
                <p className="text-xs text-forest-400">
                  {new Date(recentGame.played_at).toLocaleDateString(i18n.language)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone="forest">
                  <Trophy className="h-3 w-3" />
                  {recentGame.players.find((p) => p.is_winner)?.player_name ?? '—'}
                </Badge>
                <p className="text-xs text-forest-400 flex items-center gap-0.5">
                  {recentGame.players.find((p) => p.is_winner)?.total_score ?? 0}
                  <AcornIcon className="h-3 w-3" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats summary */}
      <div className="flex gap-3">
        <Card className="flex-1">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-forest-600">{games.length}</p>
            <p className="text-xs text-forest-400">{t('home.games')}</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-forest-600">{players.length}</p>
            <p className="text-xs text-forest-400">{t('home.players')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings link */}
      <Link
        to="/settings"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-forest-400 hover:text-forest-500 transition-colors"
      >
        <Settings className="h-4 w-4" />
        {t('home.settings')}
      </Link>
    </div>
  )
}
