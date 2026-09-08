import type { CardMetadata } from '@/types/scoring'

/** Sum of per-copy context answers; falls back to the legacy single answer */
export function sumPerCopyContext(count: number, metadata?: CardMetadata): number {
  const values = metadata?.contextValues
  if (values) return values.slice(0, count).reduce((sum, v) => sum + (v ?? 0), 0)
  return metadata?.contextValue ?? 0
}

/** True when any of the first `count` copies still has no answer */
export function hasMissingPerCopyContext(count: number, metadata?: CardMetadata): boolean {
  const values = metadata?.contextValues
  if (!values) return metadata?.contextValue === undefined
  for (let i = 0; i < count; i++) {
    if (values[i] === undefined) return true
  }
  return false
}
