import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Calculator, History, BarChart3, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, key: 'nav.home' },
  { to: '/new-game', icon: Calculator, key: 'nav.score' },
  { to: '/history', icon: History, key: 'nav.history' },
  { to: '/leaderboard', icon: BarChart3, key: 'nav.stats' },
  { to: '/settings', icon: Settings, key: 'nav.settings' },
] as const

export function AppShell() {
  const location = useLocation()
  const isWizard = location.pathname.startsWith('/score/')
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-forest-50">
      <main className={cn('flex-1', !isWizard && 'pb-20')}>
        <Outlet />
      </main>

      {!isWizard && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-forest-200 bg-white/95 backdrop-blur-sm pb-safe">
          <div className="mx-auto flex max-w-lg items-center justify-around">
            {navItems.map(({ to, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-4 py-3 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-forest-600'
                      : 'text-forest-400 hover:text-forest-500',
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{t(key)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
