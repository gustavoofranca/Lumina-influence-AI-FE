import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import iconeCaos from '../../assets/landing/chaos-icon.svg'
import balaCaos from '../../assets/landing/chaos-bullet.svg'
import ornamentoCaos from '../../assets/landing/chaos-ornament.svg'
import iconeOrdem from '../../assets/landing/order-icon.svg'
import balaOrdem from '../../assets/landing/order-bullet.svg'
import ornamentoOrdem from '../../assets/landing/order-ornament.svg'

function Cartao({ dados, variante }) {
  const caos = variante === 'caos'
  const cor = caos ? 'text-landing-danger' : 'text-landing-violet'

  return (
    <div className={cn(
      'relative flex flex-col gap-6 overflow-hidden rounded-2xl p-8',
      caos
        ? 'border border-landing-line/10 bg-landing-surface'
        : cn(
            'border border-landing-violet/20 bg-landing-card',
            'shadow-[0_25px_50px_-12px_rgba(189,157,255,0.05)]'
          )
    )}>
      <img
        src={caos ? ornamentoCaos : ornamentoOrdem}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 size-32"
      />

      <h3 className={cn('relative flex items-center gap-2 text-xl font-semibold leading-7', cor)}>
        <img
          src={caos ? iconeCaos : iconeOrdem}
          alt=""
          aria-hidden
          className={caos ? 'size-3.5 shrink-0' : 'size-5 shrink-0'}
        />
        {dados.title}
      </h3>

      <ul className="relative flex flex-col gap-4">
        {dados.items.map((item, i) => (
          <li
            key={i}
            className={cn(
              'flex items-start gap-3 text-sm leading-5',
              caos ? 'text-landing-muted' : 'text-landing-text'
            )}
          >
            <img
              src={caos ? balaCaos : balaOrdem}
              alt=""
              aria-hidden
              className={caos ? 'mt-0.5 size-2.5 shrink-0' : 'mt-0.5 h-[10.5px] w-[11px] shrink-0'}
            />
            {item}
          </li>
        ))}
      </ul>

      <div className="relative flex flex-col gap-2 border-t border-landing-line/10 pt-10">
        <span className={cn('text-[10px] font-semibold uppercase leading-[15px] tracking-[1px]',
          caos ? 'text-landing-danger' : 'text-landing-blue')}>
          {dados.metricLabel}
        </span>
        <span className={cn('text-3xl font-semibold leading-9',
          caos ? 'text-landing-danger' : 'text-landing-blue')}>
          {dados.metricValue}
        </span>
      </div>
    </div>
  )
}

export default function ComparativoSection() {
  const { t } = useTranslation()
  const chaos  = t('landing.comparativo.chaos',  { returnObjects: true })
  const lumina = t('landing.comparativo.lumina', { returnObjects: true })

  return (
    <section id="features" className="mx-auto w-full max-w-[1280px] px-8 py-24">
      <div className="flex flex-col gap-16">
        <div data-reveal className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-3xl font-extrabold leading-tight text-landing-text lg:text-5xl lg:leading-[48px]">
            {t('landing.comparativo.title')}
          </h2>
          <p className="max-w-[672px] text-base leading-6 text-landing-muted">
            {t('landing.comparativo.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div data-reveal style={{ '--delay': '100ms' }}>
            <Cartao dados={chaos} variante="caos" />
          </div>
          <div data-reveal style={{ '--delay': '200ms' }}>
            <Cartao dados={lumina} variante="ordem" />
          </div>
        </div>
      </div>
    </section>
  )
}
