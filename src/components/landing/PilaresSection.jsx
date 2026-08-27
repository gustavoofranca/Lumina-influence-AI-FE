import { useTranslation } from 'react-i18next'
import { ShieldCheck, Bot, TrendingUp } from 'lucide-react'

const ICONS = [ShieldCheck, Bot, TrendingUp]

export default function PilaresSection() {
  const { t } = useTranslation()
  const items = t('landing.pilares.items', { returnObjects: true })

  return (
    <section className="bg-neutral-950/50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-12 flex flex-col items-center gap-3 text-center">
          <span className="text-label">{t('landing.pilares.label')}</span>
          <h2 className="font-display text-4xl font-bold text-text-primary lg:text-5xl">
            {t('landing.pilares.title')}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={i}
                data-reveal
                style={{ '--delay': `${i * 150}ms` }}
                className="card-glass rounded-2xl p-8"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/15 text-primary-300 ring-1 ring-inset ring-primary-500/20">
                  <Icon size={22} />
                </div>
                <h3 className="font-display text-xl font-bold text-text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
