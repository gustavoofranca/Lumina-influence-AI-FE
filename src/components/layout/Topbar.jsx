import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, User, Settings, LogOut, Menu } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Search from '../ui/Search.jsx'
import IconButton from '../ui/IconButton.jsx'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function AvatarDropdown({ user, onLogout }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Fecha ao pressionar ESC
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const MENU_ITEMS = [
    { label: t('app.topbar.profile'),  icon: User,     to: '/app/configuracoes/perfil' },
    { label: t('app.topbar.settings'), icon: Settings, to: '/app/configuracoes' },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex items-center gap-2 rounded-2xl px-2 py-1.5',
          'text-neutral-300 transition-all duration-150',
          'hover:bg-neutral-800',
          open && 'bg-neutral-800'
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user?.name || 'Usuário'} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm font-medium lg:block">
          {user?.name || 'Usuário'}
        </span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-text-muted transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-52 animate-fade-in',
          'rounded-2xl border border-primary/15 bg-neutral-800 shadow-glow-soft'
        )}>
          {/* Info do usuário */}
          <div className="border-b border-neutral-700/60 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-100 truncate">{user?.name}</p>
            <p className="mt-0.5 text-xs text-text-muted truncate">{user?.email}</p>
          </div>

          {/* Links */}
          <ul className="p-1.5">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-neutral-700 hover:text-neutral-100"
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                </li>
              )
            })}

            <li>
              <button
                type="button"
                onClick={() => { setOpen(false); onLogout() }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-tertiary-300 transition-colors hover:bg-tertiary-500/10 hover:text-tertiary-200"
              >
                <LogOut size={15} />
                {t('app.topbar.logout')}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default function Topbar({ onMenuClick }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-primary/10 bg-neutral-900/90 px-4 backdrop-blur-md lg:px-6">
      {/* Botão menu (mobile) */}
      <IconButton
        icon={Menu}
        label="Abrir menu"
        variant="ghost"
        size="md"
        onClick={onMenuClick}
        className="lg:hidden"
      />

      {/* Search central — escondido em telas muito pequenas */}
      <div className="hidden flex-1 max-w-md sm:block">
        {/* Enter leva à listagem já filtrada — o campo tinha aparência de
            atalho e não fazia nada além de guardar texto. */}
        <Search
          placeholder={t('app.topbar.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={(termo) => {
            const q = termo.trim()
            if (!q) return
            navigate(`/app/influenciadores?q=${encodeURIComponent(q)}`)
          }}
        />
      </div>
      <div className="flex-1 sm:hidden" />{/* spacer mobile */}

      {/* Direita */}
      <div className="ml-auto flex items-center gap-1.5">
        <Link to="/app/configuracoes/plano" className="hidden sm:block">
          <Button variant="outlined" size="sm">
            {t('app.topbar.upgrade')}
          </Button>
        </Link>

        <LanguageSwitcher variant="icon" />

        <div className="ml-1 h-5 w-px bg-neutral-700" aria-hidden />

        <AvatarDropdown user={user} onLogout={handleLogout} />
      </div>
    </header>
  )
}
