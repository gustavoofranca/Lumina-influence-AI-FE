import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

import { cn } from '../../lib/cn.js'

const PRODUCT_KEYS = ['solutions', 'pricing', 'cases', 'api']
const COMPANY_KEYS = ['about', 'blog', 'careers', 'legal']
const ANCHORS = {
  solutions: '#features', pricing: '#plans', cases: '#features', api: '#features',
  about: '#', blog: '#', careers: '#', legal: '#',
}

function LinkCol({ label, keys, t }) {
  return (
    <div>
      <span className="text-label">{label}</span>
      <ul className="mt-4 space-y-2">
        {keys.map((key) => (
          <li key={key}>
            <a
              href={ANCHORS[key]}
              className="text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              {t(`landing.footer.links.${key}`)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function FooterSection() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-primary/10 px-6 pb-8 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-400" />
              <span className="font-display text-lg font-bold text-gradient-brand">
                Lumina Influence AI
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">
              {t('landing.footer.tagline')}
            </p>
          </div>
          <LinkCol label={t('landing.footer.product')} keys={PRODUCT_KEYS} t={t} />
          <LinkCol label={t('landing.footer.company')} keys={COMPANY_KEYS} t={t} />
        </div>

        <div className={cn(
          'mt-12 flex flex-wrap items-center justify-between gap-4',
          'border-t border-primary/10 pt-6 text-xs text-text-muted'
        )}>
          <span>{t('landing.footer.copyright')}</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="transition-colors hover:text-text-primary"
          >
            {t('landing.footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  )
}
