import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enCards from './locales/en/cards.json'
import frCommon from './locales/fr/common.json'
import frCards from './locales/fr/cards.json'
import deCommon from './locales/de/common.json'
import deCards from './locales/de/cards.json'
import esCommon from './locales/es/common.json'
import esCards from './locales/es/cards.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, cards: enCards },
    fr: { common: frCommon, cards: frCards },
    de: { common: deCommon, cards: deCards },
    es: { common: esCommon, cards: esCards },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'cards'],
  interpolation: { escapeValue: false },
})

export default i18n
