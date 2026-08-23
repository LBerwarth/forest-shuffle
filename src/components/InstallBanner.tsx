import { useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { useTranslation, Trans } from 'react-i18next'
import { useInstallPrompt, PLAY_STORE_URL } from '@/hooks/use-install-prompt'
import { Button } from '@/components/ui/Button'

const PLAY_DISMISS_KEY = 'play-banner-dismissed'
const IOS_DISMISS_KEY = 'ios-banner-dismissed'

function readDismissed(key: string) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function persistDismissed(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* ignore */
  }
}

export function InstallBanner() {
  const { t } = useTranslation()
  const { canInstall, showPlayStore, showIos, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  const [playDismissed, setPlayDismissed] = useState(() => readDismissed(PLAY_DISMISS_KEY))
  const [iosDismissed, setIosDismissed] = useState(() => readDismissed(IOS_DISMISS_KEY))

  const showPlay = showPlayStore && !playDismissed
  const showApple = !showPlay && showIos && !iosDismissed
  const showPwa = !showPlay && !showApple && canInstall && !dismissed
  if (!showPlay && !showApple && !showPwa) return null

  function dismiss() {
    if (showPlay) {
      setPlayDismissed(true)
      persistDismissed(PLAY_DISMISS_KEY)
    } else if (showApple) {
      setIosDismissed(true)
      persistDismissed(IOS_DISMISS_KEY)
    } else {
      setDismissed(true)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-forest-600 text-white px-4 py-3 shadow-md">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Download className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm">
          {showApple ? (
            <Trans
              i18nKey="install.iosMessage"
              components={{
                icon: <Share className="inline h-4 w-4 align-[-2px]" aria-label="Share" />,
              }}
            />
          ) : (
            t(showPlay ? 'install.playMessage' : 'install.message')
          )}
        </p>
        {showPlay && (
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
        )}
        {showPwa && (
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
