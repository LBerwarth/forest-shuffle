import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInstallPrompt } from '@/hooks/use-install-prompt'
import { Button } from '@/components/ui/Button'

export function InstallBanner() {
  const { t } = useTranslation()
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (!canInstall || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-forest-600 text-white px-4 py-3 shadow-md">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <Download className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm">{t('install.message')}</p>
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0 bg-white text-forest-700 hover:bg-forest-100"
          onClick={install}
        >
          {t('install.action')}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-forest-500 transition-colors"
          aria-label={t('install.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
