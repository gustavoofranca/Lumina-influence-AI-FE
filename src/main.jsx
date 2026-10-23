import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './i18n/index.js'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { aplicarModoLeve } from './lib/modoLeve.js'

// Antes da primeira pintura: navegador sem aceleração de hardware recebe as
// telas públicas sem os efeitos que o derrubavam (ver `lib/modoLeve.js`).
aplicarModoLeve()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
