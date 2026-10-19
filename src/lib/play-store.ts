const PACKAGE_ID = 'app.forestshuffle.companion'
const LISTING_URL = `https://play.google.com/store/apps/details?id=${PACKAGE_ID}`
const INSTALLED_FLAG = 'forest-shuffle-play-app'

// A Trusted Web Activity only sets this referrer on the initial document load,
// so latch it — a reload inside the app would otherwise look like a browser.
export function isPlayStoreApp(): boolean {
  if (localStorage.getItem(INSTALLED_FLAG) === '1') return true
  if (!document.referrer.startsWith(`android-app://${PACKAGE_ID}`)) return false
  localStorage.setItem(INSTALLED_FLAG, '1')
  return true
}

export function requestInAppReview() {
  // App builds without ReviewActivity (< 1.0.12) let Chrome follow the fallback URL.
  const fallback = encodeURIComponent(LISTING_URL)
  window.location.href = `intent://review#Intent;scheme=forestshuffle;package=${PACKAGE_ID};S.browser_fallback_url=${fallback};end`
}
