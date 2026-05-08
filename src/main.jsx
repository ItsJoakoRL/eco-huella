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
