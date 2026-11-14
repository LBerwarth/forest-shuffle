export type Theme = 'system' | 'light' | 'dark'

const media = matchMedia('(prefers-color-scheme: dark)')

export function getTheme(): Theme {
  const t = localStorage.getItem('theme')
  return t === 'light' || t === 'dark' ? t : 'system'
}

function apply() {
  const t = getTheme()
  const dark = t === 'dark' || (t === 'system' && media.matches)
  if (dark) document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#0e1510' : '#4a7c59')
}

export function setTheme(t: Theme) {
  if (t === 'system') localStorage.removeItem('theme')
  else localStorage.setItem('theme', t)
  apply()
}

media.addEventListener('change', apply)
