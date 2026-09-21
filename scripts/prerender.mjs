// Post-build: static landing HTML + localized head for the 18 landing URLs.
import { build } from 'esbuild'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ORIGIN = 'https://forest-shuffle-app.vercel.app'
const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.forestshuffle.companion'
const OG_LOCALE = {
  en: 'en_US', fr: 'fr_FR', de: 'de_DE', es: 'es_ES', nl: 'nl_NL', it: 'it_IT',
  pl: 'pl_PL', pt: 'pt_PT', cs: 'cs_CZ', hu: 'hu_HU', uk: 'uk_UA', ru: 'ru_RU',
  tr: 'tr_TR', ca: 'ca_ES', da: 'da_DK', sv: 'sv_SE', no: 'nb_NO', fi: 'fi_FI',
}

const entryOut = path.join(root, 'node_modules', '.tmp', 'prerender-entry.mjs')
await mkdir(path.dirname(entryOut), { recursive: true })
await build({
  entryPoints: [path.join(root, 'scripts', 'prerender-entry.tsx')],
  outfile: entryOut,
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  alias: { '@': path.join(root, 'src') },
  logLevel: 'warning',
})
const { LANGS, render } = await import(`file://${entryOut}`)

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`prerender: tag not found for ${pattern}`)
  return html.replace(pattern, replacement)
}

function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function pageHtml(template, page) {
  const { lang, title, description, features, faq, body } = page
  const url = lang === 'en' ? `${ORIGIN}/` : `${ORIGIN}/${lang}`
  let html = template
  html = setTag(html, /<html lang="[^"]*">/, `<html lang="${lang}">`)
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:locale', OG_LOCALE[lang])
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)

  const links = [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" hreflang="en" href="${ORIGIN}/" />`,
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />`,
    ...LANGS.filter((l) => l !== 'en').map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}" />`,
    ),
  ]
  const schema = [
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Forest Shuffle Scorer',
      url,
      inLanguage: lang,
      description,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      installUrl: PLAY_URL,
      sameAs: [PLAY_URL],
      featureList: features,
      image: `${ORIGIN}/pwa-512x512.png`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    }),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    }),
  ]
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
  html = html.replace('</head>', `    ${[...links, ...schema].join('\n    ')}\n  </head>`)
  html = setTag(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`)
  return html
}

const template = await readFile(path.join(dist, 'index.html'), 'utf8')
for (const lang of LANGS) {
  const page = await render(lang)
  const html = pageHtml(template, page)
  const out = lang === 'en' ? path.join(dist, 'index.html') : path.join(dist, lang, 'index.html')
  await mkdir(path.dirname(out), { recursive: true })
  await writeFile(out, html)
}
console.log(`prerendered ${LANGS.length} landing pages`)
