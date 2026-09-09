import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAccount } from '@/hooks/use-account'
import { supabase } from '@/lib/supabase'

const DISMISS_KEY = 'forest-shuffle-account-hint-dismissed'

function readDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

/** Nudges anonymous users with history towards the optional e-mail link. */
export function AccountHint() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { ready, isAnonymous } = useAccount()
  const [dismissed, setDismissed] = useState(readDismissed)

  if (!supabase || !ready || !isAnonymous || dismissed) return null

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-forest-200 bg-forest-50/60 p-3">
      <div className="flex items-start gap-2">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium text-forest-700">{t('account.hintTitle')}</p>
          <p className="text-xs leading-snug text-forest-500">{t('account.hintBody')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigate('/settings?account=1')}>
              {t('account.hintAction')}
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t('account.hintDismiss')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
