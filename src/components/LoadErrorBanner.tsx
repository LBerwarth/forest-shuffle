import { useEffect, useState } from 'react'
import { useQueryClient, type Query } from '@tanstack/react-query'
import { WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'

const failed = (q: Query) => q.state.status === 'error'

// Pages render a failed load as empty, which reads like lost data.
export function LoadErrorBanner() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const cache = qc.getQueryCache()
    const check = () => setHasError(cache.findAll({ predicate: failed }).length > 0)
    check()
    return cache.subscribe(check)
  }, [qc])

  if (!hasError) return null

  return (
    <div role="alert" className="mx-4 mt-3 flex max-w-lg sm:mx-auto items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-red-800 shadow-sm">
      <WifiOff className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm">{t('loadError.message')}</p>
      <Button size="sm" onClick={() => qc.refetchQueries({ predicate: failed })}>
        {t('loadError.retry')}
      </Button>
    </div>
  )
}
