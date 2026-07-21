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
import nlCommon from './locales/nl/common.json'
import nlCards from './locales/nl/cards.json'
import itCommon from './locales/it/common.json'
import itCards from './locales/it/cards.json'
import plCommon from './locales/pl/common.json'
import plCards from './locales/pl/cards.json'
import ptCommon from './locales/pt/common.json'
import ptCards from './locales/pt/cards.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, cards: enCards },
    fr: { common: frCommon, cards: frCards },
    de: { common: deCommon, cards: deCards },
    es: { common: esCommon, cards: esCards },
    nl: { common: nlCommon, cards: nlCards },
    it: { common: itCommon, cards: itCards },
    pl: { common: plCommon, cards: plCards },
    pt: { common: ptCommon, cards: ptCards },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'cards'],
  interpolation: { escapeValue: false },
})

export default i18n
