import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'

export const SEO_LANGS = [
  'fr', 'de', 'es', 'nl', 'it', 'pl', 'pt', 'cs', 'hu',
  'uk', 'ru', 'tr', 'ca', 'da', 'sv', 'no', 'fi',
] as const

type SeoLang = (typeof SEO_LANGS)[number]

const ORIGIN = 'https://forest-shuffle-app.vercel.app'

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.head.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}

function removeSeoLinks() {
  document.head
    .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
    .forEach((el) => el.remove())
}

export function LangRoute({ lang }: { lang?: SeoLang }) {
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  useEffect(() => {
    if (lang) setLanguage(lang)
  }, [lang, setLanguage])

  useEffect(() => {
    document.title = t('seo.title')
    document.documentElement.lang = i18n.language
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('seo.description'))

    // Canonical + hreflang only on the 18 landing URLs listed in the sitemap
    const isLanding = pathname === '/' || pathname === `/${lang}`
    if (isLanding) {
      upsertLink('canonical', lang ? `${ORIGIN}/${lang}` : `${ORIGIN}/`)
      upsertLink('alternate', `${ORIGIN}/`, 'en')
      upsertLink('alternate', `${ORIGIN}/`, 'x-default')
      for (const l of SEO_LANGS) upsertLink('alternate', `${ORIGIN}/${l}`, l)
    } else {
      removeSeoLinks()
    }
  }, [t, i18n.language, pathname, lang])

  return <Outlet />
}
