import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'

function FeatureItem({ text }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-text-secondary">
      <Check size={14} className="shrink-0 text-primary-400" />
      {text}
    </li>
  )
}

export default function PlansSection() {
  const { t } = useTranslation()
  const agency     = t('landing.plans.agency',     { returnObjects: true })
  const enterprise = t('landing.plans.enterprise', { returnObjects: true })

  return (
    <section id="plans" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-label">{t('landing.plans.label')}</span>
          <h2 className="font-display text-4xl font-bold text-text-primary lg:text-5xl">
            {t('landing.plans.title')}
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
          {/* Agência — destacado */}
          <div
            data-reveal
            style={{ '--delay': '100ms' }}
            className="relative rounded-2xl border-2 border-primary-500/70 bg-bg-surface/70 p-8 shadow-glow-primary"
          >
            <div className="absolute -top-3 left-8">
              <Badge variant="organic">{agency.badge}</Badge>
            </div>
            <h3 className="font-display text-2xl font-bold text-text-primary">{agency.name}</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="font-display text-5xl font-extrabold text-text-primary">{agency.price}</span>
              <span className="mb-1 text-sm text-text-muted">{agency.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {agency.features.map((f, i) => <FeatureItem key={i} text={f} />)}
            </ul>
            <Link to="/cadastro" className="mt-8 block">
              <Button variant="primary" fullWidth size="lg">{agency.cta}</Button>
            </Link>
          </div>

          {/* Enterprise */}
          <div
            data-reveal
            style={{ '--delay': '200ms' }}
            className="rounded-2xl border border-hairline/60 bg-bg-surface/50 p-8"
          >
            <h3 className="font-display text-2xl font-bold text-text-primary">{enterprise.name}</h3>
            <div className="mt-4">
              <span className="font-display text-4xl font-bold text-text-secondary">{enterprise.price}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {enterprise.features.map((f, i) => <FeatureItem key={i} text={f} />)}
            </ul>
            <Link to="/cadastro" className="mt-8 block">
              <Button variant="outlined" fullWidth size="lg">{enterprise.cta}</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
