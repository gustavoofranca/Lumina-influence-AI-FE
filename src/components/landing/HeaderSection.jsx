import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import Button from '../ui/Button.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import LuminaWordmark from '../ui/LuminaWordmark.jsx'

const NAV_KEYS    = ['solutions', 'pricing', 'cases', 'api']
const NAV_ANCHORS = { solutions: '#features', pricing: '#plans', cases: '#features', api: '#features' }

export default function HeaderSection() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-bg-base/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Link to="/" className="shrink-0" aria-label="Lumina Influence AI">
          <LuminaWordmark compact markClassName="w-9" />
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
