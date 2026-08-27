import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Zap } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Avatar from '../ui/Avatar.jsx'
import ProgressBar from '../ui/ProgressBar.jsx'
import StatusIndicator from '../ui/StatusIndicator.jsx'

export default function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20">
      {/* Glows de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(65% 55% at 0% 0%, rgba(124,58,237,0.15) 0%, transparent 65%)',
            'radial-gradient(50% 40% at 100% 5%, rgba(14,165,233,0.10) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        {/* Esquerda */}
        <div className="flex flex-col gap-8 animate-fade-in">
          <StatusIndicator label={t('landing.hero.label')} color="primary" />

          <h1 className={cn(
            'font-display text-4xl font-extrabold leading-[1.05] tracking-tight',
            'text-gradient-brand sm:text-5xl xl:text-6xl'
          )}>
            {t('landing.hero.h1')}
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/cadastro">
              <Button variant="primary" size="lg" rightIcon={ArrowRight}>
                {t('landing.hero.ctaPrimary')}
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outlined" size="lg">
                {t('landing.hero.ctaSecondary')}
              </Button>
            </a>
          </div>
        </div>

        {/* Direita — mockup */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <MockupCard t={t} />
        </div>
      </div>
    </section>
  )
}

function MockupCard({ t }) {
  const m = t('landing.hero.mockup', { returnObjects: true })

  return (
    <div className="relative">
      <div className="card-glass rounded-3xl p-6 shadow-glow-soft">
        {/* Perfil */}
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-text-primary">{m.name}</p>
            <p className="text-xs text-text-muted">{m.followers}</p>
          </div>
          <Badge variant="organic" className="ml-auto shrink-0">{m.badge}</Badge>
        </div>

        {/* Sentiment */}
        <div className="mt-5">
          <p className="mb-3 text-label">{m.sentimentLabel}</p>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-muted">
                <span>{m.positiveLabel}</span><span>65%</span>
              </div>
              <ProgressBar value={65} variant="primary" size="md" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-text-muted">
                <span>{m.suspiciousLabel}</span><span>23%</span>
              </div>
              <ProgressBar value={23} variant="danger" size="md" />
            </div>
          </div>
        </div>

        {/* Alerta flutuante */}
        <div className={cn(
          'animate-float mt-5 rounded-2xl p-4',
          'border border-tertiary-500/40 bg-tertiary-500/10',
          'shadow-glow-tertiary'
        )}>
          <div className="flex items-center gap-2">
            <Zap size={14} className="shrink-0 text-tertiary-300" />
            <span className="text-sm font-semibold text-tertiary-200">{m.alertTitle}</span>
          </div>
          <p className="mt-1 text-xs text-text-muted">{m.alertId}</p>
        </div>
      </div>

      {/* Glow decorativo atrás do card */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)' }}
      />
    </div>
  )
}
