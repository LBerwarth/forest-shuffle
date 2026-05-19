const STORAGE_KEY = 'forest-shuffle-last-joined-player'

export interface LastJoinedPlayer {
  id: string
  name: string
}

export function readLastJoinedPlayer(): LastJoinedPlayer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.id === 'string' && typeof parsed?.name === 'string') {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function writeLastJoinedPlayer(player: LastJoinedPlayer) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
}
