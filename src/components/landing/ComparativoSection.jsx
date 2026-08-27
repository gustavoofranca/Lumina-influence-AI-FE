import { useTranslation } from 'react-i18next'
import { X, Check } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Badge from '../ui/Badge.jsx'

function ItemList({ items, positive }) {
  const Icon  = positive ? Check : X
  const color = positive ? 'text-emerald-400' : 'text-tertiary-400'
  return (
    <ul className="mt-5 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
          <Icon size={15} className={cn('mt-0.5 shrink-0', color)} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function ComparativoSection() {
  const { t } = useTranslation()
  const chaos  = t('landing.comparativo.chaos',  { returnObjects: true })
  const lumina = t('landing.comparativo.lumina', { returnObjects: true })

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-label">{t('landing.comparativo.label')}</span>
          <h2 className="font-display text-4xl font-bold text-text-primary lg:text-5xl">
            {t('landing.comparativo.title')}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div
            data-reveal
            style={{ '--delay': '100ms' }}
            className="rounded-2xl border border-hairline/60 bg-bg-surface/50 p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-2xl font-bold text-text-primary">{chaos.title}</h3>
              <Badge variant="danger">{chaos.badge}</Badge>
            </div>
            <ItemList items={chaos.items} positive={false} />
          </div>

          <div
            data-reveal
            style={{ '--delay': '200ms' }}
            className="rounded-2xl border-2 border-primary-500/70 bg-bg-surface/50 p-8 shadow-glow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-2xl font-bold text-text-primary">{lumina.title}</h3>
              <Badge variant="success">{lumina.badge}</Badge>
            </div>
            <ItemList items={lumina.items} positive={true} />
          </div>
        </div>
      </div>
    </section>
  )
}
