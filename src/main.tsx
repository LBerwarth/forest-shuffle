import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { changeLanguage, resolveInitialLanguage } from './i18n'
import './index.css'
import './pwa'
import App from './App.tsx'

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>,
  )
}

changeLanguage(resolveInitialLanguage()).catch(() => {}).finally(mount)
