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
import csCommon from './locales/cs/common.json'
import csCards from './locales/cs/cards.json'
import huCommon from './locales/hu/common.json'
import huCards from './locales/hu/cards.json'
import ukCommon from './locales/uk/common.json'
import ukCards from './locales/uk/cards.json'
import ruCommon from './locales/ru/common.json'
import ruCards from './locales/ru/cards.json'
import trCommon from './locales/tr/common.json'
import trCards from './locales/tr/cards.json'
import caCommon from './locales/ca/common.json'
import caCards from './locales/ca/cards.json'
import daCommon from './locales/da/common.json'
import daCards from './locales/da/cards.json'
import svCommon from './locales/sv/common.json'
import svCards from './locales/sv/cards.json'
import noCommon from './locales/no/common.json'
import noCards from './locales/no/cards.json'
import fiCommon from './locales/fi/common.json'
import fiCards from './locales/fi/cards.json'

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
    cs: { common: csCommon, cards: csCards },
    hu: { common: huCommon, cards: huCards },
    uk: { common: ukCommon, cards: ukCards },
    ru: { common: ruCommon, cards: ruCards },
    tr: { common: trCommon, cards: trCards },
    ca: { common: caCommon, cards: caCards },
    da: { common: daCommon, cards: daCards },
    sv: { common: svCommon, cards: svCards },
    no: { common: noCommon, cards: noCards },
    fi: { common: fiCommon, cards: fiCards },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'cards'],
  interpolation: { escapeValue: false },
})

export default i18n
