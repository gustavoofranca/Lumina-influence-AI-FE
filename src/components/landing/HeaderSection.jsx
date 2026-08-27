import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Button from '../ui/Button.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'

const NAV_KEYS    = ['solutions', 'pricing', 'cases', 'api']
const NAV_ANCHORS = { solutions: '#features', pricing: '#plans', cases: '#features', api: '#features' }

export default function HeaderSection() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <Sparkles size={16} className="text-primary-400" />
          <span className="font-display text-lg font-bold text-gradient-brand">Lumina</span>
          <span className="hidden font-display text-lg font-bold text-text-secondary sm:inline">Influence AI</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_KEYS.map((key) => (
            <a
              key={key}
              href={NAV_ANCHORS[key]}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary',
                'transition-colors hover:bg-bg-surface hover:text-text-primary'
              )}
            >
              {t(`landing.nav.${key}`)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="secondary" size="sm">{t('landing.nav.login')}</Button>
          </Link>
          <Link to="/cadastro" className="hidden sm:block">
            <Button variant="primary" size="sm">{t('landing.nav.cta')}</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
