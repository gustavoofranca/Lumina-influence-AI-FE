import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { applyTheme, getStoredTheme, storeTheme } from '../lib/theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => applyTheme(getStoredTheme()))
  // Páginas públicas (landing, login, cadastro) têm arte dirigida em fundo
  // escuro — gradientes e seções que não são superfície de produto. Elas fixam
  // o escuro enquanto estão montadas, e a escolha do usuário volta a valer no
  // app autenticado.
  const [travadoEscuro, setTravadoEscuro] = useState(0)

  useEffect(() => {
    applyTheme(travadoEscuro > 0 ? 'dark' : theme)
  }, [theme, travadoEscuro])

  const lockDarkTheme = useCallback(() => {
    setTravadoEscuro((n) => n + 1)
    return () => setTravadoEscuro((n) => Math.max(0, n - 1))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((atual) => {
      const proximo = atual === 'dark' ? 'light' : 'dark'
      storeTheme(proximo)
      return proximo
    })
  }, [])

  const valor = useMemo(
    () => ({ theme, toggleTheme, lockDarkTheme }),
    [theme, toggleTheme, lockDarkTheme]
  )
  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return ctx
}
