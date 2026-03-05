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
import { JoinSessionPage } from '@/pages/JoinSessionPage'
import { LiveLobbyPage } from '@/pages/LiveLobbyPage'
import { LiveScoreWizardPage } from '@/pages/LiveScoreWizardPage'
import { LiveResultPage } from '@/pages/LiveResultPage'

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
            <Route path="/join" element={<JoinSessionPage />} />
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
          {/* Live session routes without bottom nav */}
          <Route path="/live/:sessionId" element={<LiveLobbyPage />} />
          <Route path="/live/:sessionId/score" element={<LiveScoreWizardPage />} />
          <Route path="/live/:sessionId/results" element={<LiveResultPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
