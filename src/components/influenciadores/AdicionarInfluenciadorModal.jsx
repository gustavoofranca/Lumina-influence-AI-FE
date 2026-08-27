import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link2, User, AtSign, Check } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import { PLATFORM_META } from '../icons/PlatformIcons.jsx'

const PLATFORM_KEYS = ['instagram', 'tiktok', 'youtube']

function PlatformCheckbox({ value, checked, onChange }) {
  const meta = PLATFORM_META[value]
  const Icon = meta.Icon
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={checked}
      className={cn(
        'group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150',
        checked
          ? 'border-primary-500/60 bg-primary-600/10 shadow-glow-soft'
          : 'border-hairline/60 bg-bg-base/40 hover:border-hairline hover:bg-bg-surface'
      )}
    >
      <span className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg',
        checked ? 'bg-primary-600/30 text-accent-strong' : 'bg-bg-surface text-text-secondary'
      )}>
        <Icon size={16} />
      </span>
      <span className="flex-1">
        <span className={cn('block text-sm font-semibold', checked ? 'text-text-primary' : 'text-text-primary')}>
          {meta.name}
        </span>
        <span className="block text-xs text-text-muted">OAuth 2.0</span>
      </span>
      <span className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-md transition-all',
        checked
          ? 'bg-primary-600 text-white'
          : 'border border-hairline bg-transparent text-transparent group-hover:border-neutral-500'
      )}>
        <Check size={13} />
      </span>
    </button>
  )
}

export default function AdicionarInfluenciadorModal({
  open, onClose, onSubmit, submitting = false, error: erroApi = null,
}) {
  const { t } = useTranslation()
  const [name, setName]         = useState('')
  const [handle, setHandle]     = useState('')
  const [platforms, setPlatforms] = useState(new Set())
  const [error, setError]       = useState('')

  const togglePlatform = (p) => {
    const next = new Set(platforms)
    if (next.has(p)) next.delete(p); else next.add(p)
    setPlatforms(next)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('influenciadores.addModal.nameRequired'))
      return
    }
    if (platforms.size === 0) {
      setError(t('influenciadores.addModal.selectAtLeastOne'))
      return
    }
    setError('')
    // Espera a criação terminar: fechar antes esconderia a falha, que foi
    // exatamente o que fazia o botão parecer não ter efeito nenhum.
    await onSubmit?.({ name: name.trim(), handle, platforms: [...platforms] })
    setName(''); setHandle(''); setPlatforms(new Set())
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('influenciadores.addModal.title')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('influenciadores.addModal.subtitle')}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('influenciadores.addModal.name')}
            placeholder={t('influenciadores.addModal.namePlaceholder')}
            leftIcon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label={t('influenciadores.addModal.handle')}
            placeholder={t('influenciadores.addModal.handlePlaceholder')}
            leftIcon={AtSign}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
        </div>

        <div>
          <span className="text-label">{t('influenciadores.addModal.platforms')}</span>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {PLATFORM_KEYS.map((p) => (
              <PlatformCheckbox
                key={p}
                value={p}
                checked={platforms.has(p)}
                onChange={togglePlatform}
              />
            ))}
          </div>
          {error && <p className="mt-2 text-xs font-medium text-tint-rose">{error}</p>}
        </div>

        <ApiErrorBanner error={erroApi} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            {t('influenciadores.addModal.cancel')}
          </Button>
          <Button type="submit" variant="primary" leftIcon={Link2} disabled={submitting}>
            {submitting
              ? t('influenciadores.addModal.submitting')
              : t('influenciadores.addModal.oauth')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
