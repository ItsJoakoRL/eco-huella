import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const markMaterialSymbolsAsNotranslate = () => {
  document.querySelectorAll('.material-symbols-outlined').forEach((icon) => {
    icon.classList.add('notranslate')
    icon.setAttribute('translate', 'no')
    icon.setAttribute('aria-hidden', icon.getAttribute('aria-hidden') || 'true')
  })
}

const iconObserver = new MutationObserver(markMaterialSymbolsAsNotranslate)
iconObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

markMaterialSymbolsAsNotranslate()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'activated' &&
              navigator.serviceWorker.controller &&
              sessionStorage.getItem('ecohuella_sw_refreshed') !== 'true'
            ) {
              sessionStorage.setItem('ecohuella_sw_refreshed', 'true')
              window.location.reload()
            }
          })
        })
      })
      .catch((error) => {
        console.error('No se pudo registrar la app instalable:', error)
      })
  })
}
