import { useTranslation } from 'react-i18next'
import { Globe, Copy } from 'lucide-react'

const WEB_URL = 'https://forest-shuffle-app.vercel.app'
const WEB_URL_DISPLAY = 'forest-shuffle-app.vercel.app'

interface NoAppNoticeProps {
  className?: string
}

export function NoAppNotice({ className = '' }: NoAppNoticeProps) {
  const { t } = useTranslation()

  function handleCopy() {
    navigator.clipboard.writeText(WEB_URL)
  }

  return (
    <div className={`rounded-xl border border-forest-200 bg-forest-50/60 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <Globe className="h-4 w-4 text-forest-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-forest-700 mb-1">
            {t('live.noAppTitle')}
          </p>
          <p className="text-xs text-forest-500 leading-snug">
            {t('live.noAppBody')}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-forest-600 border border-forest-200 hover:bg-forest-100 transition-colors"
          >
            <span className="font-mono">{WEB_URL_DISPLAY}</span>
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
