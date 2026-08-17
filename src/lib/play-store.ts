const PACKAGE_ID = 'app.forestshuffle.companion'
const LISTING_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_ID}`
const INSTALLED_FLAG = 'forest-shuffle-play-app'
const SCHEME_FALLBACK_MS = 1500

// A Trusted Web Activity only sets this referrer on the initial document load,
// so latch it — a reload inside the app would otherwise look like a browser.
export function isPlayStoreApp(): boolean {
  if (localStorage.getItem(INSTALLED_FLAG) === '1') return true
  if (!document.referrer.startsWith(`android-app://${PACKAGE_ID}`)) return false
  localStorage.setItem(INSTALLED_FLAG, '1')
  return true
}

export function openPlayStoreListing() {
  // market:// hands off to the Play app via Android intent; if nothing claims
  // the scheme the page stays visible and we send it to the web listing.
  const fallback = window.setTimeout(() => {
    if (document.visibilityState === 'visible') window.location.href = LISTING_URL
  }, SCHEME_FALLBACK_MS)
  document.addEventListener('visibilitychange', () => window.clearTimeout(fallback), { once: true })
  window.location.href = `market://details?id=${PACKAGE_ID}`
}
