/* eslint-disable react-refresh/only-export-components */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { createInstance } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { LandingSection, type FaqEntry } from '../src/components/LandingSection'

export const LANGS = ['en', 'fr', 'de', 'es', 'nl', 'it', 'pl', 'pt', 'cs', 'hu', 'uk', 'ru', 'tr', 'ca', 'da', 'sv', 'no', 'fi'] as const

const localesDir = path.resolve(process.cwd(), 'src', 'i18n', 'locales')

export interface Prerendered {
  lang: string
  title: string
  description: string
  features: string[]
  faq: FaqEntry[]
  body: string
}

// Reads the locale files straight off disk: the app's own i18n module relies on
// Vite's import.meta.glob, which this esbuild bundle cannot resolve.
function instanceFor(lang: string) {
  const common = JSON.parse(readFileSync(path.join(localesDir, lang, 'common.json'), 'utf8'))
  const instance = createInstance()
  instance.use(initReactI18next).init({
    lng: lang,
    fallbackLng: lang,
    resources: { [lang]: { common } },
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    initImmediate: false,
  })
  return instance
}

export async function render(lang: string): Promise<Prerendered> {
  const instance = instanceFor(lang)
  const t = instance.getFixedT(lang)
  const location = lang === 'en' ? '/' : `/${lang}`
  const body = renderToStaticMarkup(
    <I18nextProvider i18n={instance}>
      <StaticRouter location={location}>
        <div className="mx-auto max-w-lg px-4 pt-6 pb-6">
          <LandingSection />
        </div>
      </StaticRouter>
    </I18nextProvider>,
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
