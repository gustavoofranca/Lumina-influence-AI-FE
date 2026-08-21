import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Trash2, Mail } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import { EQUIPE } from '../../mocks/equipe.js'
import { ROLE_KEYS } from '../../lib/constants.js'

const ROLE_VARIANT = {
  admin:   'organic',  // violeta
  manager: 'paid',     // cyan
  analyst: 'success',
  viewer:  'neutral',
}

const STATUS_VARIANT = {
  active:  'success',
  pending: 'warning',
}

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

function ConvidarMembroModal({ open, onClose, t }) {
  const [email, setEmail] = useState('')
  const [role,  setRole]  = useState('analyst')

  const onSubmit = (e) => {
    e.preventDefault()
    setEmail(''); setRole('analyst')
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('configuracoes.equipe.inviteModal.title')}
      size="md"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('configuracoes.equipe.inviteModal.subtitle')}
        </p>

        <Input
          label={t('configuracoes.equipe.inviteModal.email')}
          placeholder={t('configuracoes.equipe.inviteModal.emailPh')}
          leftIcon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <span className="text-label">
            {t('configuracoes.equipe.inviteModal.roleLabel')}
          </span>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {ROLE_KEYS.map((key) => {
              const checked = role === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  aria-pressed={checked}
                  className={cn(
                    'rounded-xl border px-3 py-2 text-left text-sm transition-all duration-150',
                    checked
                      ? 'border-primary-500/60 bg-primary-600/10 ring-1 ring-inset ring-primary-500/30 shadow-glow-soft'
                      : 'border-neutral-700/60 bg-neutral-900/40 hover:bg-neutral-800/60'
                  )}
                >
                  <span className={cn('block font-semibold', checked ? 'text-neutral-100' : 'text-neutral-200')}>
                    {t(`configuracoes.equipe.roles.${key}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('configuracoes.cancel')}
          </Button>
          <Button type="submit" variant="primary" leftIcon={UserPlus}>
            {t('configuracoes.equipe.inviteModal.send')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function EquipeSection() {
  const { t, i18n } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)

  const active  = EQUIPE.filter((m) => m.status === 'active').length
  const pending = EQUIPE.filter((m) => m.status === 'pending').length

  return (
    <>
      <Card glass className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardLabel>{t('configuracoes.equipe.title')}</CardLabel>
            <CardTitle className="mt-1.5">{t('configuracoes.equipe.title')}</CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              {t('configuracoes.equipe.subtitle')}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <Badge variant="success" uppercase={false}>
                {t('configuracoes.equipe.active', { count: active })}
              </Badge>
              {pending > 0 && (
                <Badge variant="warning" uppercase={false}>
                  {t('configuracoes.equipe.pending', { count: pending })}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="primary" leftIcon={UserPlus} onClick={() => setModalOpen(true)}>
            {t('configuracoes.equipe.invite')}
          </Button>
        </div>

        {/* Lista de membros */}
        <div className="overflow-hidden rounded-2xl border border-neutral-700/60">
          <table className="w-full">
            <thead className="bg-neutral-800/60">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-label text-text-label">
                  {t('configuracoes.equipe.columns.member')}
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-label text-text-label">
                  {t('configuracoes.equipe.columns.role')}
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-label text-text-label">
                  {t('configuracoes.equipe.columns.status')}
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-label text-text-label">
                  {t('configuracoes.equipe.columns.joinedAt')}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-label text-text-label">
                </th>
              </tr>
            </thead>
            <tbody>
              {EQUIPE.map((m) => (
                <tr key={m.id} className="border-t border-neutral-800/80 transition-colors hover:bg-neutral-700/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size="sm" />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-neutral-100">{m.name}</div>
                        <div className="truncate text-xs text-text-muted">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANT[m.role]} uppercase={false}>
                      {t(`configuracoes.equipe.roles.${m.role}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[m.status]}>
                      {t(`configuracoes.equipe.status${m.status === 'active' ? 'Active' : 'Pending'}`)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary tabular-nums">
                    {formatDate(m.joinedAt, i18n.language)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label={t('configuracoes.equipe.remove')}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-tertiary-500/15 hover:text-tertiary-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConvidarMembroModal open={modalOpen} onClose={() => setModalOpen(false)} t={t} />
    </>
  )
}
