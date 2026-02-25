export interface Player {
  id: string
  name: string
  color: string
  created_at: string
}

export const PLAYER_COLORS = [
  '#4a7c59', // forest green
  '#c4a77d', // warm bark
  '#6a8caf', // sky blue
  '#c97c5d', // fox orange
  '#8b6f9e', // lavender
  '#b5534b', // berry red
  '#5c9e8f', // teal
  '#d4a843', // golden
] as const
