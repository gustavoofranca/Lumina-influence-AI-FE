import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import { useTheme } from '../../context/ThemeContext.jsx'

/**
 * ThemeSwitcher — alterna claro/escuro. Mesmo formato do seletor de idioma,
 * porque as duas são a mesma classe de escolha: preferência de exibição.
 */
export default function ThemeSwitcher({ className = '' }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const claro = theme === 'light'
  const destino = claro ? t('common.themeDark') : t('common.themeLight')

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={destino}
      title={destino}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary',
        'ring-1 ring-inset ring-transparent transition-all duration-200',
        'hover:bg-bg-elevated hover:text-text-primary hover:ring-hairline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        className
      )}
    >
      {claro ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
