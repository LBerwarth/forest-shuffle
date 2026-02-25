import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enCards from './locales/en/cards.json'
import frCommon from './locales/fr/common.json'
import frCards from './locales/fr/cards.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, cards: enCards },
    fr: { common: frCommon, cards: frCards },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'cards'],
  interpolation: { escapeValue: false },
})

export default i18n
