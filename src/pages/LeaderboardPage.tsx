import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trophy } from 'lucide-react'
import { usePlayers } from '@/hooks/use-players'
import { useGames } from '@/hooks/use-games'
import {
  applyFilters,
  aggregatePlayers,
  aggregateCardStats,
  aggregatePlayerStrategies,
  computeAtAGlance,
  type EditionFilter,
  type TimeFilter,
} from '@/lib/stats'
import { StatsFilters } from '@/components/stats/StatsFilters'
import { AtAGlance } from '@/components/stats/AtAGlance'
import { LeaderboardList } from '@/components/stats/LeaderboardList'
import { PlayerStrategies } from '@/components/stats/PlayerStrategies'
import { CardAnalytics } from '@/components/stats/CardAnalytics'
import { Records } from '@/components/stats/Records'

export function LeaderboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: localPlayers = [] } = usePlayers()
  const { data: games = [] } = useGames()

  const [edition, setEdition] = useState<EditionFilter>('all')
  const [time, setTime] = useState<TimeFilter>('all')

  const filteredGames = useMemo(
    () => applyFilters(games, edition, time),
    [games, edition, time],
  )

  const aggregatedPlayers = useMemo(
    () => aggregatePlayers(filteredGames, localPlayers),
    [filteredGames, localPlayers],
  )

  const cardAggregates = useMemo(
    () => aggregateCardStats(filteredGames),
    [filteredGames],
  )

  const playerStrategies = useMemo(
    () => aggregatePlayerStrategies(filteredGames, localPlayers),
    [filteredGames, localPlayers],
  )

  const atAGlance = useMemo(() => computeAtAGlance(filteredGames), [filteredGames])

  const hasAnyGames = games.length > 0
  const filtersActive = edition !== 'all' || time !== 'all'

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-6">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="text-forest-500">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-forest-800">
          {t('leaderboard.title')}
        </h1>
      </div>

      {!hasAnyGames ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-forest-200 mx-auto mb-3" />
          <p className="text-sm text-forest-400">{t('leaderboard.noData')}</p>
        </div>
      ) : (
        <>
          <StatsFilters
            edition={edition}
            time={time}
            onEditionChange={setEdition}
            onTimeChange={setTime}
          />

          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-forest-200 mx-auto mb-3" />
              <p className="text-sm text-forest-400 mb-3">{t('leaderboard.noDataFiltered')}</p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={() => {
                    setEdition('all')
                    setTime('all')
                  }}
                  className="rounded-full bg-forest-100 px-4 py-1.5 text-xs font-medium text-forest-600 hover:bg-forest-200"
                >
                  {t('leaderboard.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              <AtAGlance metrics={atAGlance} />
              <LeaderboardList players={aggregatedPlayers} />
              <PlayerStrategies players={playerStrategies} />
              <CardAnalytics cards={cardAggregates} />
              <Records aggregatedPlayers={aggregatedPlayers} cardAggregates={cardAggregates} />
            </>
          )}
        </>
      )}
    </div>
  )
}
