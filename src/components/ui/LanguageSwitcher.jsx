import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

import { cn } from '../../lib/cn.js'

const LANGS = [
  { code: 'pt', label: 'PT' },
  { code: 'en', label: 'EN' },
]

/**
 * LanguageSwitcher — toggle pt/en integrado ao react-i18next.
 *
 * variant:
 *   'pill' (padrao) — par de botoes "PT | EN" tipo segmented control
 *   'icon'          — icon button compacto que alterna o idioma
 */
export default function LanguageSwitcher({ variant = 'pill', className = '' }) {
  const { i18n, t } = useTranslation()
  const current = i18n.language?.startsWith('pt') ? 'pt' : 'en'

  const setLang = (code) => {
    i18n.changeLanguage(code)
    document.documentElement.lang = code === 'pt' ? 'pt-BR' : 'en'
  }

  if (variant === 'icon') {
    const next = current === 'pt' ? 'en' : 'pt'
    return (
      <button
        type="button"
        onClick={() => setLang(next)}
        aria-label={t('common.language')}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-2xl text-text-secondary',
          'ring-1 ring-inset ring-transparent transition-all duration-200',
          'hover:bg-bg-surface hover:text-text-primary hover:ring-hairline',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
          className
        )}
        title={`${t('common.language')}: ${current.toUpperCase()} → ${next.toUpperCase()}`}
      >
        <Globe size={18} />
      </button>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-2xl bg-bg-surface p-0.5',
        'ring-1 ring-inset ring-hairline',
        className
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {LANGS.map((lang) => {
        const active = lang.code === current
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLang(lang.code)}
            aria-pressed={active}
            className={cn(
              'inline-flex h-8 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold tracking-wide transition-all duration-200',
              active
                ? 'bg-primary-600 text-white shadow-glow-soft'
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
            )}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
