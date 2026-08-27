import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Languages, Sparkles, Palette, Type, ArrowRight } from 'lucide-react'

import { cn } from '../lib/cn.js'

const PALETTE = [
  { key: 'primary',   hex: '#7C3AED', tailwind: 'bg-primary-600', glow: 'shadow-glow-primary',   ring: 'ring-primary-400/40' },
  { key: 'secondary', hex: '#0EA5E9', tailwind: 'bg-secondary-500', glow: 'shadow-glow-secondary', ring: 'ring-secondary-400/40' },
  { key: 'tertiary',  hex: '#F43F5E', tailwind: 'bg-tertiary-500', glow: 'shadow-glow-tertiary',  ring: 'ring-tertiary-400/40' },
  { key: 'neutral',   hex: '#0F172A', tailwind: 'bg-bg-base border border-primary/20', glow: '', ring: 'ring-primary-400/20' },
]

function ColorCard({ swatchClass, glowClass, ringClass, hex, label, description }) {
  return (
    <div className="card-glass rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className={cn('h-24 w-full rounded-xl ring-1', swatchClass, glowClass, ringClass)} />
      <div className="mt-4 flex items-center justify-between">
        <span className="text-label">{label}</span>
        <code className="rounded-md bg-bg-base px-2 py-1 text-xs font-medium text-text-secondary">
          {hex}
        </code>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
    </div>
  )
}

function StatusDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-success opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  )
}

export default function Welcome() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'pt' ? 'en' : 'pt'
    i18n.changeLanguage(next)
    document.documentElement.lang = next === 'pt' ? 'pt-BR' : 'en'
  }

  const currentLang = i18n.language === 'pt' ? t('common.português') : t('common.english')

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-base">
      {/* Glow decorativo de fundo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(60% 50% at 20% 0%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(50% 40% at 90% 10%, rgba(14,165,233,0.14) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        {/* === Topbar === */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-accent-soft" />
            <span className="text-label">{t('welcome.label')}</span>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className={cn(
              'group inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-bg-surface/60 px-4 py-2',
              'text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-200',
              'hover:border-primary/40 hover:bg-bg-elevated hover:shadow-glow-soft'
            )}
            aria-label={t('welcome.switchLanguage')}
          >
            <Languages size={16} className="text-accent" />
            <span>{t('welcome.switchLanguage')}</span>
            <span className="text-xs uppercase tracking-label text-text-muted">
              · {currentLang}
            </span>
          </button>
        </header>

        {/* === Hero === */}
        <section className="mt-16 flex flex-col items-start gap-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <StatusDot />
            <span className="text-label">{t('status.systemActive')}</span>
          </div>

          <div>
            <p className="text-sm text-text-secondary">{t('welcome.title')}</p>
            <h1 className="text-display text-gradient-brand mt-2 text-5xl sm:text-7xl">
              {t('app.name')}
            </h1>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-text-secondary">
            {t('welcome.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/20 bg-primary-600/10 px-3 py-1 text-xs font-semibold tracking-wide text-accent">
              {t('welcome.stack')}
            </span>
            <span className="rounded-full border border-secondary/30 bg-secondary-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-tint-sky">
              v0.1.0 · TCC
            </span>

            <Link
              to="/design-system"
              className={cn(
                'group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-600/10 px-3 py-1',
                'text-xs font-semibold text-accent-strong transition-all duration-200',
                'hover:border-primary/60 hover:bg-primary-600/20 hover:shadow-glow-soft'
              )}
            >
              {t('ds.title')}
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>

        {/* === Paleta === */}
        <section className="mt-16">
          <div className="mb-5 flex items-center gap-2">
            <Palette size={16} className="text-accent-soft" />
            <h2 className="text-label">{t('welcome.paletteTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PALETTE.map((color) => (
              <ColorCard
                key={color.key}
                swatchClass={color.tailwind}
                glowClass={color.glow}
                ringClass={color.ring}
                hex={color.hex}
                label={color.key}
                description={t(`welcome.colors.${color.key}`)}
              />
            ))}
          </div>
        </section>

        {/* === Tipografia === */}
        <section className="mt-16">
          <div className="mb-5 flex items-center gap-2">
            <Type size={16} className="text-accent-soft" />
            <h2 className="text-label">{t('welcome.fontShowcase')}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Display: Plus Jakarta Sans */}
            <div className="card-glass rounded-2xl p-8">
              <span className="text-label">Display · Plus Jakarta Sans</span>
              <div className="mt-4 flex items-baseline gap-4">
                <span className="font-display text-8xl font-extrabold leading-none tracking-display-tight text-gradient-brand">
                  Aa
                </span>
                <span className="font-display text-3xl font-bold text-text-primary">
                  800 · 700 · 600
                </span>
              </div>
              <p className="mt-6 text-sm text-text-secondary">
                {t('welcome.fontDisplayDesc')}
              </p>
            </div>

            {/* Body: Inter */}
            <div className="card-glass rounded-2xl p-8">
              <span className="text-label">Body · Inter</span>
              <div className="mt-4">
                <span className="font-sans text-7xl font-bold leading-none text-text-primary">
                  Aa
                </span>
              </div>
              <p className="mt-6 text-base leading-relaxed text-text-secondary">
                {t('welcome.fontBodyDesc')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
                <span className="rounded-md bg-bg-base px-2 py-1">400</span>
                <span className="rounded-md bg-bg-base px-2 py-1">500</span>
                <span className="rounded-md bg-bg-base px-2 py-1">600</span>
                <span className="rounded-md bg-bg-base px-2 py-1">700</span>
              </div>
            </div>
          </div>
        </section>

        {/* === Footer status === */}
        <footer className="mt-auto pt-16">
          <div className="flex items-center justify-between border-t border-primary/10 pt-6">
            <div className="flex items-center gap-3">
              <StatusDot />
              <span className="text-label">{t('status.operational')}</span>
            </div>
            <span className="text-xs text-text-muted">{t('app.description')}</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
