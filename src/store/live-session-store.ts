import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LiveSessionState {
  activeSessionId: string | null
  activeSessionCode: string | null
  myPlayerId: string | null
  myPlayerName: string | null
  isHost: boolean

  setSession: (id: string, code: string, isHost: boolean) => void
  setPlayer: (playerId: string, playerName: string) => void
  clearSession: () => void
}

export const useLiveSessionStore = create<LiveSessionState>()(
  persist(
    (set) => ({
      activeSessionId: null,
      activeSessionCode: null,
      myPlayerId: null,
      myPlayerName: null,
      isHost: false,

      setSession: (id, code, isHost) =>
        set({ activeSessionId: id, activeSessionCode: code, isHost }),

      setPlayer: (playerId, playerName) =>
        set({ myPlayerId: playerId, myPlayerName: playerName }),

      clearSession: () =>
        set({
          activeSessionId: null,
          activeSessionCode: null,
          myPlayerId: null,
          myPlayerName: null,
          isHost: false,
        }),
    }),
    {
      name: 'forest-shuffle-live-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
