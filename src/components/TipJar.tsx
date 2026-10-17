import { useTranslation } from 'react-i18next'
import { Coffee } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const TIP_URL = 'https://ko-fi.com/lenab71554'

// Nothing unlocks in return: keeps it a peer-to-peer payment under Play billing rules.
export function TipJar({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <Card className={className}>
      <CardContent className="py-5 text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest-500 text-white shadow-sm">
          <Coffee className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-forest-800">{t('tip.title')}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-forest-600">{t('tip.desc')}</p>
        <Button asChild size="sm" className="mt-4">
          <a href={TIP_URL} target="_blank" rel="noopener noreferrer">
            <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
            {t('tip.button')}
          </a>
        </Button>
        <p className="mt-3 text-xs text-forest-400">{t('tip.note')}</p>
      </CardContent>
    </Card>
  )
}
