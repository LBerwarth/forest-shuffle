/* eslint-disable react-refresh/only-export-components */
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import i18n from '../src/i18n'
import { LandingSection, type FaqEntry } from '../src/components/LandingSection'

export const LANGS = ['en', 'fr', 'de', 'es', 'nl', 'it', 'pl', 'pt', 'cs', 'hu', 'uk', 'ru', 'tr', 'ca', 'da', 'sv', 'no', 'fi'] as const

export interface Prerendered {
  lang: string
  title: string
  description: string
  features: string[]
  faq: FaqEntry[]
  body: string
}

export async function render(lang: string): Promise<Prerendered> {
  await i18n.changeLanguage(lang)
  const t = i18n.getFixedT(lang)
  const path = lang === 'en' ? '/' : `/${lang}`
  const body = renderToStaticMarkup(
    <StaticRouter location={path}>
      <div className="mx-auto max-w-lg px-4 pt-6 pb-6">
        <LandingSection />
      </div>
    </StaticRouter>,
  )
  return {
    lang,
    title: t('seo.title'),
    description: t('seo.description'),
    features: t('landing.features', { returnObjects: true }) as string[],
    faq: t('landing.faq', { returnObjects: true }) as FaqEntry[],
    body,
  }
}
