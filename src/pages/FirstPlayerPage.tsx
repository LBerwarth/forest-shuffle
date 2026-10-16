import { useEffect, useState, type PointerEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { AcornIcon } from '@/components/ui/AcornIcon'
import { AcornLogo } from '@/components/ui/AcornLogo'
import { HillSilhouette } from '@/components/ui/HillSilhouette'

const COLORS = ['#5c9468', '#b5452f', '#d9a536', '#8e3b62', '#3f7f9a', '#8c7040', '#c8702a', '#8cc08c']
const HOLD_MS = 2000

interface Finger {
  x: number
  y: number
  color: string
  lifted?: boolean
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
      if (s.winner !== null) {
        // the result stays on screen until everyone has let go and someone taps again
        if (![...s.fingers.values()].every((f) => f.lifted)) return s
        return { fingers: new Map([[pointerId, { x, y, color: COLORS[0] }]]), winner: null }
      }
      const used = new Set([...s.fingers.values()].map((f) => f.color))
      const color = COLORS.find((c) => !used.has(c)) ?? COLORS[s.fingers.size % COLORS.length]
      return { ...s, fingers: new Map(s.fingers).set(pointerId, { x, y, color }) }
    })
  }

  function move(e: PointerEvent) {
    const { pointerId, clientX: x, clientY: y } = e
    setState((s) => {
      const f = s.fingers.get(pointerId)
      return f && !f.lifted ? { ...s, fingers: new Map(s.fingers).set(pointerId, { ...f, x, y }) } : s
    })
  }

  function up(e: PointerEvent) {
    const { pointerId } = e
    setState((s) => {
      const f = s.fingers.get(pointerId)
      if (!f) return s
      const next = new Map(s.fingers)
      if (pointerId === s.winner) next.set(pointerId, { ...f, lifted: true })
      else next.delete(pointerId)
      return { fingers: next, winner: next.size > 0 ? s.winner : null }
    })
  }

  const winnerColor = winner !== null ? fingers.get(winner)?.color : undefined
  const message =
    winner !== null ? t('firstPlayer.starts') : fingers.size >= 2 ? t('firstPlayer.hold') : t('firstPlayer.hint')

  return (
    <div
      className="fixed inset-0 touch-none select-none overflow-hidden bg-forest-900 bg-[url('/forest-bg.jpg')] bg-cover bg-center [-webkit-touch-callout:none]"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-forest-700/90 via-forest-800/92 to-forest-900/95" />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: winnerColor, opacity: winnerColor ? 0.85 : 0 }}
      />
      <HillSilhouette className="h-24 text-white/10" />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => (location.key === 'default' ? navigate('/') : navigate(-1))}
        aria-label={t('firstPlayer.close')}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full bg-white/15 p-2 text-white ring-1 ring-white/25 backdrop-blur-md"
      >
        <X className="h-6 w-6" />
      </button>

      <header className="pointer-events-none absolute inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] flex flex-col items-center px-8 text-center text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-white/50">
            <AcornLogo className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-xl font-bold tracking-tight">{t('firstPlayer.title')}</h1>
        </div>
        <p
          className={
            winner !== null
              ? 'mt-6 font-heading text-4xl font-bold drop-shadow'
              : 'mt-4 text-sm font-light text-forest-50/90'
          }
        >
          {message}
        </p>
      </header>

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
              className="absolute inset-0 flex items-center justify-center rounded-full shadow-hero ring-4 ring-white/90"
              style={{ backgroundColor: f.color }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
                {isWinner ? <AcornLogo className="h-9 w-9" /> : <AcornIcon className="h-7 w-7" />}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
