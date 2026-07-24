import { registerSW } from 'virtual:pwa-register'

// autoUpdate reloads the page once as soon as the new worker activates, so a
// single reopen/refresh lands the latest deploy instead of several pull-downs.
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    // Re-check for a new deploy each time the app returns to the foreground.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update().catch(() => {})
    })
  },
})
