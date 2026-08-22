import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInstallPrompt, PLAY_STORE_URL } from '@/hooks/use-install-prompt'
import { Button } from '@/components/ui/Button'

const PLAY_DISMISS_KEY = 'play-banner-dismissed'

function readPlayDismissed() {
  try {
    return localStorage.getItem(PLAY_DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function InstallBanner() {
  const { t } = useTranslation()
  const { canInstall, showPlayStore, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [playDismissed, setPlayDismissed] = useState(readPlayDismissed)

  const showPlay = showPlayStore && !playDismissed
  const showPwa = !showPlay && canInstall && !dismissed
  if (!showPlay && !showPwa) return null

  function dismiss() {
    if (showPlay) {
      setPlayDismissed(true)
      try {
        localStorage.setItem(PLAY_DISMISS_KEY, '1')
      } catch {
        /* ignore */
      }
    } else {
      setDismissed(true)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-forest-600 text-white px-4 py-3 shadow-md">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Download className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm">{t(showPlay ? 'install.playMessage' : 'install.message')}</p>
        {showPlay ? (
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white text-forest-700 hover:bg-forest-100"
            asChild
          >
            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
              {t('install.playAction')}
            </a>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 bg-white text-forest-700 hover:bg-forest-100"
            onClick={install}
          >
            {t('install.action')}
          </Button>
        )}
        <button
          onClick={dismiss}
          className="shrink-0 p-1 rounded-full hover:bg-forest-500 transition-colors"
          aria-label={t('install.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
