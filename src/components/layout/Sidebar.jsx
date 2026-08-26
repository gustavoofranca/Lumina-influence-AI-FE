import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Target,
  Bot,
  FileText,
  Settings,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Button from '../ui/Button.jsx'

const NAV_ITEMS = [
  { key: 'dashboard',       icon: LayoutDashboard, path: '/app/dashboard' },
  { key: 'influenciadores', icon: Users,            path: '/app/influenciadores' },
  { key: 'campanhas',       icon: Target,           path: '/app/campanhas' },
  { key: 'diagnostico',     icon: Bot,              path: '/app/diagnostico' },
  { key: 'relatorios',      icon: FileText,         path: '/app/relatorios' },
]

const SECONDARY_ITEMS = [
  { key: 'configuracoes', icon: Settings,   path: '/app/configuracoes' },
]

function NavItem({ item, t, onClick }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary-600/20 text-neutral-100'
            : 'text-text-secondary hover:bg-neutral-800 hover:text-neutral-100'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Barra ativa à esquerda */}
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
          )}
          <Icon size={18} className={isActive ? 'text-primary-400' : 'text-neutral-500 group-hover:text-neutral-300'} />
          <span>{t(`app.nav.${item.key}`)}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-neutral-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col',
          'border-r border-primary/10 bg-neutral-900',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0' // sempre visível em desktop
        )}
      >
        {/* Header da sidebar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-primary/10 px-5">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-primary-400" />
            <span className="font-display text-base font-bold text-gradient-brand">Lumina</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-label text-text-muted">
              {t('app.sidebar.version')}
            </span>
            {/* Botão fechar (mobile) */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-text-muted hover:bg-neutral-800 hover:text-neutral-100 lg:hidden"
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Navegação principal */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.key}>
                <NavItem item={item} t={t} onClick={onClose} />
              </li>
            ))}
          </ul>

          {/* Separador */}
          <div className="my-4 border-t border-neutral-800" />

          {/* Itens secundários */}
          <ul className="space-y-1">
            {SECONDARY_ITEMS.map((item) => (
              <li key={item.key}>
                <NavItem item={item} t={t} onClick={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé — botão Nova Campanha */}
        <div className="shrink-0 border-t border-primary/10 p-4">
          <NavLink to="/app/campanhas/nova">
            <Button variant="primary" fullWidth leftIcon={Plus}>
              {t('app.sidebar.newCampaign')}
            </Button>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
