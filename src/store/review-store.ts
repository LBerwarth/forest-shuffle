import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const FIRST_PROMPT_AFTER = 3
const SNOOZE_GAMES = 10
const MAX_ASKS = 2
const MAX_TRACKED_GAMES = 100

interface ReviewState {
  countedGames: string[]
  asks: number
  nextPromptAt: number
  stopped: boolean
  countGame: (gameId: string) => void
  shouldPrompt: () => boolean
  snooze: () => void
  stop: () => void
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      countedGames: [],
      asks: 0,
      nextPromptAt: FIRST_PROMPT_AFTER,
      stopped: false,
      // Keyed by game id so re-entering a result page (Edit Scores → finish)
      // doesn't count the same game twice.
      countGame: (gameId) => {
        const { countedGames } = get()
        if (countedGames.includes(gameId)) return
        set({ countedGames: [...countedGames, gameId].slice(-MAX_TRACKED_GAMES) })
      },
      shouldPrompt: () => {
        const { stopped, countedGames, nextPromptAt } = get()
        return !stopped && countedGames.length >= nextPromptAt
      },
      snooze: () => {
        const { asks, countedGames } = get()
        const nextAsks = asks + 1
        set({
          asks: nextAsks,
          stopped: nextAsks >= MAX_ASKS,
          nextPromptAt: countedGames.length + SNOOZE_GAMES,
        })
      },
      stop: () => set({ stopped: true }),
    }),
    {
      name: 'forest-shuffle-review',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
