import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Home, Calculator, History, BarChart3, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { InstallBanner } from '@/components/InstallBanner'

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
    <div className="flex min-h-screen flex-col">
      {/* Forest photo backdrop, softened by a cream-green overlay so every
          screen reads as a faint atmospheric tint (kept legible for data). */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[url('/forest-bg.jpg')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-gradient-to-b from-forest-50/92 via-cream-warm/94 to-forest-100/95"
      />
      <InstallBanner />
      <main className={cn('flex-1', !isWizard && 'pb-20')}>
        <Outlet />
      </main>

      {!isWizard && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-forest-100 bg-white/85 backdrop-blur-md pb-safe">
          <div className="mx-auto flex max-w-lg items-center justify-around">
            {navItems.map(({ to, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                className="flex flex-1 flex-col items-center gap-1 px-2 pt-2 pb-2.5 text-[11px] font-medium"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full px-5 py-1 transition-colors',
                        isActive ? 'bg-forest-100 text-forest-700' : 'text-forest-400',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className={isActive ? 'text-forest-700' : 'text-forest-400'}>
                      {t(key)}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
