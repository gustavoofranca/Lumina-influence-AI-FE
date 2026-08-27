import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, LayoutDashboard, Sparkles } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Button from '../components/ui/Button.jsx'
import StatusIndicator from '../components/ui/StatusIndicator.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function NotFound() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base px-6 py-16">
      {/* Glow radial duplo de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(60% 50% at 30% 20%, rgba(124,58,237,0.20) 0%, transparent 60%)',
            'radial-gradient(45% 40% at 70% 80%, rgba(244,63,94,0.16) 0%, transparent 55%)',
            'radial-gradient(40% 35% at 90% 10%, rgba(14,165,233,0.10) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Grid decorativo (sci-fi) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative flex flex-col items-center gap-8 text-center animate-fade-in">
        <StatusIndicator label={t('notFound.label')} color="danger" />

        {/* "404" gigante com gradiente glitch */}
        <div className="relative">
          <h1
            className={cn(
              'font-display text-[140px] font-extrabold leading-none tracking-display-tight',
              'text-gradient-brand sm:text-[200px]'
            )}
          >
            404
          </h1>
          {/* Sombra/glitch sutil atras */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 font-display text-[140px] font-extrabold leading-none tracking-display-tight text-tertiary-500/20 blur-md sm:text-[200px]"
            style={{ transform: 'translate(6px, 4px)' }}
          >
            404
          </span>
        </div>

        <div className="max-w-md space-y-3">
          <h2 className="font-display text-2xl font-bold text-text-primary">
            {t('notFound.title')}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            {t('notFound.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={Home}>
              {t('notFound.backHome')}
            </Button>
          </Link>
          {isAuthenticated && (
            <Link to="/app/dashboard">
              <Button variant="outlined" leftIcon={LayoutDashboard}>
                {t('notFound.goDashboard')}
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <Sparkles size={12} className="text-accent-soft" />
          <span>Lumina Influence AI · {t('app.tagline')}</span>
        </div>
      </div>
    </main>
  )
}
