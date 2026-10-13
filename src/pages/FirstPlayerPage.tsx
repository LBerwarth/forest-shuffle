import { useEffect, useState, type PointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

const COLORS = ['#e11d48', '#2563eb', '#f59e0b', '#16a34a', '#9333ea', '#0891b2', '#ea580c', '#db2777']
const HOLD_MS = 2000

interface Finger {
  x: number
  y: number
  color: string
}

export function FirstPlayerPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [{ fingers, winner }, setState] = useState<{ fingers: Map<number, Finger>; winner: number | null }>({
    fingers: new Map(),
    winner: null,
  })
  const idsKey = [...fingers.keys()].join(',')

  useEffect(() => {
    if (winner !== null || idsKey.split(',').length < 2) return
    const timer = setTimeout(() => {
      setState((s) => {
        const ids = [...s.fingers.keys()]
        return { ...s, winner: ids[Math.floor(Math.random() * ids.length)] }
      })
      navigator.vibrate?.(200)
    }, HOLD_MS)
    return () => clearTimeout(timer)
  }, [idsKey, winner])

  function down(e: PointerEvent) {
    const { pointerId, clientX: x, clientY: y } = e
    setState((s) => {
      if (s.winner !== null) return s
      const used = new Set([...s.fingers.values()].map((f) => f.color))
      const color = COLORS.find((c) => !used.has(c)) ?? COLORS[s.fingers.size % COLORS.length]
      return { ...s, fingers: new Map(s.fingers).set(pointerId, { x, y, color }) }
    })
  }

  function move(e: PointerEvent) {
    const { pointerId, clientX: x, clientY: y } = e
    setState((s) => {
      const f = s.fingers.get(pointerId)
      return f ? { ...s, fingers: new Map(s.fingers).set(pointerId, { ...f, x, y }) } : s
    })
  }

  function up(e: PointerEvent) {
    const { pointerId } = e
    setState((s) => {
      if (!s.fingers.has(pointerId)) return s
      const next = new Map(s.fingers)
      next.delete(pointerId)
      return { fingers: next, winner: next.size > 0 ? s.winner : null }
    })
  }

  const winnerColor = winner !== null ? fingers.get(winner)?.color : undefined
  const message =
    winner !== null ? t('firstPlayer.starts') : fingers.size >= 2 ? t('firstPlayer.hold') : t('firstPlayer.hint')

  return (
    <div
      className="fixed inset-0 touch-none select-none overflow-hidden bg-forest-900 transition-colors duration-500 [-webkit-touch-callout:none]"
      style={winnerColor ? { backgroundColor: winnerColor } : undefined}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => (location.key === 'default' ? navigate('/') : navigate(-1))}
        aria-label={t('firstPlayer.close')}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white"
      >
        <X className="h-6 w-6" />
      </button>

      <p className="pointer-events-none absolute inset-x-0 top-1/3 px-8 text-center font-heading text-2xl font-semibold text-white/90">
        {message}
      </p>

      {[...fingers].map(([id, f]) => {
        const isWinner = id === winner
        const hidden = winner !== null && !isWinner
        return (
          <div
            key={id}
            className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 transition-[opacity,scale] duration-500"
            style={{ left: f.x, top: f.y, opacity: hidden ? 0 : 1, scale: isWinner ? 1.6 : 1 }}
          >
            {winner === null && fingers.size >= 2 && (
              <div
                key={idsKey}
                className="absolute inset-0 animate-ping rounded-full"
                style={{ backgroundColor: f.color }}
              />
            )}
            <div
              className="absolute inset-0 rounded-full border-4 border-white shadow-lg"
              style={{ backgroundColor: f.color }}
            />
          </div>
        )
      })}
    </div>
  )
}
