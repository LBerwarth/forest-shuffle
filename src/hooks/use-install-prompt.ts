import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PLAY_APP_ID = 'app.forestshuffle.companion'

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${PLAY_APP_ID}`

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [playAppInstalled, setPlayAppInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    const nav = navigator as Navigator & {
      getInstalledRelatedApps?: () => Promise<Array<{ id?: string }>>
    }
    nav
      .getInstalledRelatedApps?.()
      .then((apps) => {
        if (apps.some((app) => app.id === PLAY_APP_ID)) setPlayAppInstalled(true)
      })
      .catch(() => {})

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function install() {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    return outcome === 'accepted'
  }

  const isAndroidBrowser = /android/i.test(navigator.userAgent)
  // iPadOS 13+ reports as Macintosh; touch support tells it apart
  const isIosBrowser =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    // prefer_related_applications suppresses beforeinstallprompt on Android,
    // so Android browsers get a Play Store link instead
    showPlayStore: isAndroidBrowser && !isInstalled && !playAppInstalled,
    // iOS has no install prompt at all — show manual Add-to-Home-Screen hint
    showIos: isIosBrowser && !isInstalled,
    isInstalled,
    install,
  }
}
