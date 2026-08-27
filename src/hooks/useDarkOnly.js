import { useEffect } from 'react'

import { useTheme } from '../context/ThemeContext.jsx'

/**
 * Fixa o tema escuro enquanto a tela estiver montada.
 *
 * Para as páginas públicas, cuja arte é feita para fundo escuro: aplicar o tema
 * claro nelas deixaria texto claro sobre gradiente escuro.
 */
export function useDarkOnly() {
  const { lockDarkTheme } = useTheme()
  useEffect(() => lockDarkTheme(), [lockDarkTheme])
}
