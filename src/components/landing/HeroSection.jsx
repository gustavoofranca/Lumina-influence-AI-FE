import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import setaCta from '../../assets/landing/cta-arrow.svg'
import iconeInsight from '../../assets/landing/insight-icon.svg'
import painel from '../../assets/landing/hero-dashboard.png'

/** Cartão flutuante sobre a arte do painel: o achado que o produto existe para dar. */
function CartaoInsight({ t }) {
  const c = t('landing.hero.card', { returnObjects: true })

  return (
    <div className={cn(
      'absolute -bottom-8 -left-8 w-[240px] max-w-[calc(100%-2rem)] rounded-xl p-6',
      'border border-landing-violet/30 bg-landing-glass/40 backdrop-blur-md',
      'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
    )}>
      <div className="flex items-center gap-3">
        <img src={iconeInsight} alt="" aria-hidden className="h-[35px] w-[38px] shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase leading-[15px] tracking-[0.5px] text-landing-muted">
            {c.label}
          </p>
          <p className="text-sm font-semibold leading-5 text-landing-text">{c.title}</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-landing-card">
        <div
          className="h-full rounded-full bg-landing-danger shadow-[0_0_8px_0_rgba(255,111,126,0.6)]"
          style={{ width: '87%' }}
        />
      </div>

      <div className="mt-2 flex items-start justify-between gap-2">
        <span className="text-[10px] font-medium leading-[15px] text-landing-muted">{c.metric}</span>
        <span className="text-[10px] font-medium leading-[15px] text-landing-danger">{c.value}</span>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      {/* Halo radial atrás do conteúdo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(59% 59% at 50% 50%, rgba(189,157,255,0.15) 0%, rgba(189,157,255,0) 70%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-16 px-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <span className={cn(
            'inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5',
            'border border-landing-line/30 bg-landing-elevated'
          )}>
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-landing-blue opacity-75" />
              <span className="relative size-2 rounded-full bg-landing-blue" />
            </span>
            <span className="text-xs font-semibold uppercase leading-4 tracking-[1.2px] text-landing-blue">
              {t('landing.hero.label')}
            </span>
          </span>

          <h1 className={cn(
            'font-display font-extrabold tracking-[-1.8px] text-landing-text',
            'text-[44px] leading-[1.05] sm:text-[56px] lg:text-[72px] lg:leading-[72px]'
          )}>
            {t('landing.hero.h1Line1')}<br />
            {t('landing.hero.h1Line2')}<br />
            <span className="bg-gradient-to-r from-[#BD9DFF] to-[#34B5FA] bg-clip-text text-transparent">
              {t('landing.hero.h1Highlight1')}<br />
              {t('landing.hero.h1Highlight2')}
            </span>
          </h1>

          <p className="max-w-[576px] text-lg leading-7 text-landing-muted lg:text-xl">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/cadastro"
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-8 py-4',
                'text-lg font-semibold text-landing-ink',
                'bg-gradient-to-br from-[#BD9DFF] to-[#8A4CFC]',
                'shadow-[0_20px_25px_-5px_rgba(189,157,255,0.3),0_8px_10px_-6px_rgba(189,157,255,0.3)]',
                'transition-transform hover:-translate-y-0.5'
              )}
            >
              {t('landing.hero.ctaPrimary')}
              <img src={setaCta} alt="" aria-hidden className="size-4" />
            </Link>
            <a
              href="#features"
              className={cn(
                'inline-flex items-center justify-center rounded-full px-8 py-4',
                'text-lg font-semibold text-landing-text backdrop-blur-md',
                'border border-landing-line/20 bg-landing-glass/40',
                'transition-colors hover:border-landing-line/40'
              )}
            >
              {t('landing.hero.ctaSecondary')}
            </a>
          </div>
        </div>

        <div className="relative">
          {/* Brilho difuso por trás do quadro */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 opacity-30 blur-[32px]"
            style={{
              background:
                'linear-gradient(45deg, rgba(189,157,255,0.2) 0%, rgba(52,181,250,0.2) 100%)',
            }}
          />
          <div className={cn(
            'relative rounded-2xl p-4 backdrop-blur-md',
            'border border-landing-line/30 bg-landing-glass/40',
            'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
          )}>
            <img
              src={painel}
              alt={t('landing.hero.dashboardAlt')}
              className="aspect-square w-full rounded-xl border border-landing-line/10 object-cover"
            />
            <CartaoInsight t={t} />
          </div>
        </div>
      </div>
    </section>
  )
}
