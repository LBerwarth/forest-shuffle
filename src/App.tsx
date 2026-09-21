import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { AuthListener } from '@/components/AuthListener'
import { LangRoute, SEO_LANGS } from '@/components/LangRoute'
import { HomePage } from '@/pages/HomePage'

// Everything but the landing page loads on demand: the charting and animation
// bundles are dead weight on first paint, which is what Google measures.
const NewGamePage = lazy(() => import('@/pages/NewGamePage').then((m) => ({ default: m.NewGamePage })))
const ScoreWizardPage = lazy(() => import('@/pages/ScoreWizardPage').then((m) => ({ default: m.ScoreWizardPage })))
const GameResultPage = lazy(() => import('@/pages/GameResultPage').then((m) => ({ default: m.GameResultPage })))
const GameHistoryPage = lazy(() => import('@/pages/GameHistoryPage').then((m) => ({ default: m.GameHistoryPage })))
const GameDetailPage = lazy(() => import('@/pages/GameDetailPage').then((m) => ({ default: m.GameDetailPage })))
const PlayersPage = lazy(() => import('@/pages/PlayersPage').then((m) => ({ default: m.PlayersPage })))
const PlayerDetailPage = lazy(() => import('@/pages/PlayerDetailPage').then((m) => ({ default: m.PlayerDetailPage })))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const JoinSessionPage = lazy(() => import('@/pages/JoinSessionPage').then((m) => ({ default: m.JoinSessionPage })))
const LiveLobbyPage = lazy(() => import('@/pages/LiveLobbyPage').then((m) => ({ default: m.LiveLobbyPage })))
const LiveScoreWizardPage = lazy(() => import('@/pages/LiveScoreWizardPage').then((m) => ({ default: m.LiveScoreWizardPage })))
const LiveResultPage = lazy(() => import('@/pages/LiveResultPage').then((m) => ({ default: m.LiveResultPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function RouteFallback() {
  return <div className="min-h-[60vh]" aria-busy="true" />
}

const appRoutes = (
  <>
    <Route element={<AppShell />}>
      <Route index element={<HomePage />} />
      <Route path="new-game" element={<NewGamePage />} />
      <Route path="join" element={<JoinSessionPage />} />
      <Route path="history" element={<GameHistoryPage />} />
      <Route path="history/:id" element={<GameDetailPage />} />
      <Route path="players" element={<PlayersPage />} />
      <Route path="players/:id" element={<PlayerDetailPage />} />
      <Route path="leaderboard" element={<LeaderboardPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
    </Route>
    {/* Wizard routes without bottom nav */}
    <Route path="score/:gameId" element={<ScoreWizardPage />} />
    <Route path="score/:gameId/results" element={<GameResultPage />} />
    {/* Live session routes without bottom nav */}
    <Route path="live/:sessionId" element={<LiveLobbyPage />} />
    <Route path="live/:sessionId/score" element={<LiveScoreWizardPage />} />
    <Route path="live/:sessionId/results" element={<LiveResultPage />} />
  </>
)

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LangRoute />}>
              {appRoutes}
            </Route>
            {/* Language-prefixed copies of every route so Google can index each locale */}
            {SEO_LANGS.map((lang) => (
              <Route key={lang} path={`/${lang}`} element={<LangRoute lang={lang} />}>
                {appRoutes}
              </Route>
            ))}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
