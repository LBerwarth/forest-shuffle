import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown, Trophy, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PLAY_STORE_URL } from '@/hooks/use-install-prompt'

export interface FaqEntry {
  q: string
  a: string
}

export function LandingSection() {
  const { t } = useTranslation()
  const features = t('landing.features', { returnObjects: true }) as string[]
  const faq = t('landing.faq', { returnObjects: true }) as FaqEntry[]

  return (
    <section aria-labelledby="landing-heading" className="mt-8 space-y-4">
      <Card>
        <CardContent className="pt-4">
          <h2 id="landing-heading" className="font-heading text-lg font-bold text-forest-700">
            {t('landing.heading')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-forest-600">{t('landing.intro')}</p>
          <ul className="mt-3 space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-forest-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                {t('landing.playStore')}
              </a>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/leaderboard">
                <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                {t('landing.hallOfFame')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h2 className="font-heading text-lg font-bold text-forest-700">{t('landing.faqHeading')}</h2>
          <div className="mt-1 divide-y divide-forest-100">
            {faq.map(({ q, a }) => (
              <details key={q} className="group py-2.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-forest-700 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-semibold">{q}</h3>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-forest-400 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-1.5 text-sm leading-relaxed text-forest-600">{a}</p>
              </details>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
