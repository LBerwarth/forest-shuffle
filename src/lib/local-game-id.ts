const PREFIX = 'forest-shuffle-game-id-'

/**
 * Returns a stable game-record UUID for this device + live session pair.
 * First call: generates a new UUID and persists it. Subsequent calls
 * (e.g. after Edit Scores) return the same UUID, so saveGame stays
 * idempotent on this device without clashing with other players who
 * also save the same live session into their own device-scoped history.
 */
export function getOrCreateLocalGameId(sessionId: string): string {
  const key = PREFIX + sessionId
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const newId = crypto.randomUUID()
  localStorage.setItem(key, newId)
  return newId
}
