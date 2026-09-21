import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enCards from './locales/en/cards.json'

export const LANGS = [
  'en', 'fr', 'de', 'es', 'nl', 'it', 'pl', 'pt', 'cs',
  'hu', 'uk', 'ru', 'tr', 'ca', 'da', 'sv', 'no', 'fi',
] as const

export type Lang = (typeof LANGS)[number]

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

// One chunk per language instead of all 18 in the entry bundle.
const localeLoaders = import.meta.glob<{ default: Record<string, unknown> }>('./locales/*/*.json')

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, cards: enCards },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'cards'],
  interpolation: { escapeValue: false },
})

export async function loadLanguage(lang: string): Promise<void> {
  if (lang === 'en' || !isLang(lang)) return
  if (i18n.hasResourceBundle(lang, 'common') && i18n.hasResourceBundle(lang, 'cards')) return
  const [common, cards] = await Promise.all([
    localeLoaders[`./locales/${lang}/common.json`](),
    localeLoaders[`./locales/${lang}/cards.json`](),
  ])
  i18n.addResourceBundle(lang, 'common', common.default, true, true)
  i18n.addResourceBundle(lang, 'cards', cards.default, true, true)
}

export async function changeLanguage(lang: string): Promise<void> {
  await loadLanguage(lang)
  await i18n.changeLanguage(lang)
}

const SETTINGS_KEY = 'forest-shuffle-settings'

// The URL prefix wins over the stored setting so /de renders German on a device
// whose last choice was something else.
export function resolveInitialLanguage(): Lang {
  const fromPath = window.location.pathname.split('/')[1]
  if (isLang(fromPath)) return fromPath
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')?.state?.language
    if (isLang(stored)) return stored
  } catch {
    // storage blocked or corrupt: fall back to English
  }
  return 'en'
}

export default i18n
