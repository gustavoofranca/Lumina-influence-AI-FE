import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Building2, Plug, Users, CreditCard, Settings2 } from 'lucide-react'

import { cn } from '../lib/cn.js'
import Toast from '../components/ui/Toast.jsx'
import PerfilSection        from '../components/configuracoes/PerfilSection.jsx'
import AgenciaSection       from '../components/configuracoes/AgenciaSection.jsx'
import IntegracoesSection   from '../components/configuracoes/IntegracoesSection.jsx'
import EquipeSection        from '../components/configuracoes/EquipeSection.jsx'
import PlanoSection         from '../components/configuracoes/PlanoSection.jsx'
import PreferenciasSection  from '../components/configuracoes/PreferenciasSection.jsx'

const TABS = [
  { key: 'perfil',       icon: User,       Component: PerfilSection },
  { key: 'agencia',      icon: Building2,  Component: AgenciaSection },
  { key: 'integracoes',  icon: Plug,       Component: IntegracoesSection },
  { key: 'equipe',       icon: Users,      Component: EquipeSection },
  { key: 'plano',        icon: CreditCard, Component: PlanoSection },
  { key: 'preferencias', icon: Settings2,  Component: PreferenciasSection },
]

const VALID_TABS = TABS.map((t) => t.key)

export default function Configuracoes() {
  const { t } = useTranslation()
  const { tab } = useParams()
  const [toastOpen, setToastOpen] = useState(false)

  // Sem tab → redireciona para perfil
  if (!tab) return <Navigate to="/app/configuracoes/perfil" replace />
  // Tab inválida → também redireciona
  if (!VALID_TABS.includes(tab)) return <Navigate to="/app/configuracoes/perfil" replace />

  const ActiveSection = TABS.find((s) => s.key === tab).Component

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="font-display text-3xl font-bold text-text-primary lg:text-4xl">
          {t('configuracoes.title')}
        </h1>
        <p className="mt-1.5 text-sm text-text-secondary">{t('configuracoes.subtitle')}</p>
      </header>

      {/* Sub-nav mobile (pills horizontais scrollaveis) */}
      <nav className="-mx-2 overflow-x-auto px-2 lg:hidden">
        <ul className="flex w-max items-center gap-2 pb-1">
          {TABS.map((s) => {
            const Icon = s.icon
            const active = s.key === tab
            return (
              <li key={s.key}>
                <Link
                  to={`/app/configuracoes/${s.key}`}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-150',
                    'ring-1 ring-inset whitespace-nowrap',
                    active
                      ? 'bg-primary-600 text-white shadow-glow-soft ring-primary-400'
                      : 'bg-bg-surface/60 text-text-secondary ring-hairline hover:bg-bg-elevated hover:text-text-primary'
                  )}
                >
                  <Icon size={14} />
                  {t(`configuracoes.nav.${s.key}`)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Layout desktop: nav lateral + conteudo */}
      <div className="lg:grid lg:gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sub-nav vertical (somente desktop) */}
        <nav className="hidden lg:block">
          <ul className="space-y-1">
            {TABS.map((s) => {
              const Icon = s.icon
              const active = s.key === tab
              return (
                <li key={s.key}>
                  <Link
                    to={`/app/configuracoes/${s.key}`}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary-600/20 text-text-primary'
                        : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
                    )}
                    <Icon size={16} className={active ? 'text-accent-soft' : 'text-text-muted group-hover:text-text-secondary'} />
                    {t(`configuracoes.nav.${s.key}`)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Conteudo */}
        {/* `section`, e não `main`: o AppLayout já é o marco principal, e dois
            `main` na mesma página deixam o leitor de tela sem saber qual é o
            conteúdo. O painel de abas é uma seção dentro dele. */}
        <section className="min-w-0" aria-label={t('configuracoes.title')}>
          <ActiveSection onSave={() => setToastOpen(true)} />
        </section>
      </div>

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={t('configuracoes.savedToast')}
        type="success"
      />
    </div>
  )
}
