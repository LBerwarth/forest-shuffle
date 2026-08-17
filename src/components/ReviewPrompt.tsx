import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useReviewStore } from '@/store/review-store'
import { isPlayStoreApp, openPlayStoreListing } from '@/lib/play-store'

const SHOW_DELAY_MS = 1500

export function ReviewPrompt({ gameId }: { gameId: string | undefined }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const countGame = useReviewStore((s) => s.countGame)
  const [visible, setVisible] = useState(false)

  // Let the results land before covering them with the prompt.
  useEffect(() => {
    if (!gameId || !isPlayStoreApp()) return
    countGame(gameId)
    if (!useReviewStore.getState().shouldPrompt()) return
    const timer = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [gameId, countGame])

  if (!visible) return null

  function handleRate() {
    useReviewStore.getState().stop()
    setVisible(false)
    openPlayStoreListing()
  }

  function handleFeedback() {
    useReviewStore.getState().snooze()
    setVisible(false)
    navigate('/settings?feedback=1')
  }

  function handleLater() {
    useReviewStore.getState().snooze()
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-center gap-2">
          <Star className="h-5 w-5 shrink-0 text-amber-500" />
          <h2 className="font-heading text-base font-bold text-forest-800">{t('review.title')}</h2>
        </div>
        <p className="mb-4 text-sm text-forest-600">{t('review.desc')}</p>
        <div className="space-y-2">
          <Button className="w-full" onClick={handleRate}>
            <Star className="h-4 w-4" />
            {t('review.rate')}
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleFeedback}>
            <MessageSquare className="h-4 w-4" />
            {t('review.feedback')}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleLater}>
            {t('review.later')}
          </Button>
        </div>
      </div>
    </div>
  )
}
