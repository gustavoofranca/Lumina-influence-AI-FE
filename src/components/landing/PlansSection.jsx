import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import checkAgencia from '../../assets/landing/check-agency.svg'
import checkEnterprise from '../../assets/landing/check-enterprise.svg'

function Features({ itens, icone, tom }) {
  return (
    <ul className="flex flex-col gap-4">
      {itens.map((texto) => (
        <li key={texto} className={cn('flex items-center gap-3 text-sm leading-5', tom)}>
          <img src={icone} alt="" aria-hidden className="size-[15px] shrink-0" />
          {texto}
        </li>
      ))}
    </ul>
  )
}

export default function PlansSection() {
  const { t } = useTranslation()
  const agency     = t('landing.plans.agency',     { returnObjects: true })
  const enterprise = t('landing.plans.enterprise', { returnObjects: true })

  return (
    <section id="plans" className="mx-auto w-full max-w-[1280px] px-8 py-24">
      <div className="flex flex-col items-center gap-16">
        <div data-reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-extrabold leading-10 text-landing-text lg:text-4xl">
            {t('landing.plans.title')}
          </h2>
          <p className="max-w-[576px] text-base leading-6 text-landing-muted">
            {t('landing.plans.subtitle')}
          </p>
        </div>

        <div className="grid w-full max-w-[896px] gap-8 lg:grid-cols-2">
          {/* Agência — moldura em gradiente, como no design */}
          <div
            data-reveal
            style={{ '--delay': '100ms', backgroundImage: 'linear-gradient(134deg, #BD9DFF 0%, #34B5FA 100%)' }}
            className="rounded-3xl p-1 drop-shadow-[0_0_20px_rgba(189,157,255,0.2)]"
          >
            <div className="flex h-full flex-col rounded-[22.4px] bg-landing-card p-10">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl font-bold leading-8 text-landing-text">
                  {agency.name}
                </h3>
                <span className={cn(
                  'shrink-0 rounded-full bg-landing-violet/20 px-3 py-1',
                  'text-[10px] font-semibold uppercase leading-[15px] tracking-[1px] text-landing-violet'
                )}>
                  {agency.badge}
                </span>
              </div>

              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold leading-10 text-landing-text">{agency.price}</span>
                <span className="text-base leading-6 text-landing-muted">{agency.period}</span>
              </p>

              <div className="mt-8">
                <Features itens={agency.features} icone={checkAgencia} tom="text-landing-text" />
              </div>

              <Link
                to="/cadastro"
                className={cn(
                  'mt-10 block rounded-xl bg-landing-violet py-4 text-center',
                  'text-base font-semibold text-landing-ink transition-opacity hover:opacity-90'
                )}
              >
                {agency.cta}
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div
            data-reveal
            style={{ '--delay': '200ms' }}
            className="flex flex-col rounded-3xl border border-landing-line/20 bg-landing-surface p-10"
          >
            <h3 className="font-display text-2xl font-bold leading-8 text-landing-text">
              {enterprise.name}
            </h3>
            <p className="mt-4 text-4xl font-semibold leading-10 text-landing-muted">
              {enterprise.price}
            </p>

            <div className="mt-8">
              <Features itens={enterprise.features} icone={checkEnterprise} tom="text-landing-muted" />
            </div>

            <Link
              to="/cadastro"
              className={cn(
                'mt-10 block rounded-xl border border-landing-line/30 bg-landing-elevated py-4',
                'text-center text-base font-semibold text-landing-text transition-colors',
                'hover:border-landing-line/50'
              )}
            >
              {enterprise.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
