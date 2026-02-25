import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { NewGamePage } from '@/pages/NewGamePage'
import { ScoreWizardPage } from '@/pages/ScoreWizardPage'
import { GameResultPage } from '@/pages/GameResultPage'
import { GameHistoryPage } from '@/pages/GameHistoryPage'
import { GameDetailPage } from '@/pages/GameDetailPage'
import { PlayersPage } from '@/pages/PlayersPage'
import { PlayerDetailPage } from '@/pages/PlayerDetailPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { SettingsPage } from '@/pages/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/new-game" element={<NewGamePage />} />
            <Route path="/history" element={<GameHistoryPage />} />
            <Route path="/history/:id" element={<GameDetailPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/:id" element={<PlayerDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          {/* Wizard routes without bottom nav */}
          <Route path="/score/:gameId" element={<ScoreWizardPage />} />
          <Route path="/score/:gameId/results" element={<GameResultPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
