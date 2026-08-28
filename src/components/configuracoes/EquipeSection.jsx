import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Trash2, Mail, User as UserIcon, Users } from 'lucide-react'

import { cn } from '../../lib/cn.js'
import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { ROLE_KEYS } from '../../lib/constants.js'
import { useApi } from '../../hooks/useApi.js'
import { listMembers, inviteMember, removeMember } from '../../services/team.js'

const ROLE_VARIANT = {
  admin:  'organic',
  member: 'paid',
  viewer: 'neutral',
}

const DEFAULT_ROLE = 'member'

function formatDate(iso, locale) {
  try {
    return new Date(iso).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

function ConvidarMembroModal({ open, onClose, onInvited, t }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole]   = useState(DEFAULT_ROLE)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const reset = () => {
    setName(''); setEmail(''); setRole(DEFAULT_ROLE); setError(null)
  }

  const close = () => { reset(); onClose?.() }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await inviteMember({ name, email, role })
      await onInvited?.()
      close()
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={close} title={t('configuracoes.equipe.inviteModal.title')} size="md">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('configuracoes.equipe.inviteModal.subtitle')}
        </p>

        {/* Sem `onRetry`: aqui o erro é do envio do convite, e refazer a ação é
            submeter o formulário de novo — recarregar a lista não ajudaria.
            `refetch` nem existe neste escopo; vive no componente da seção. */}
        <ApiErrorBanner error={error} />

        <Input
          label={t('configuracoes.equipe.inviteModal.name')}
          leftIcon={UserIcon}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          <span className="text-label">{t('configuracoes.equipe.inviteModal.roleLabel')}</span>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
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
                      : 'border-hairline/60 bg-bg-base/40 hover:bg-bg-surface/60'
                  )}
                >
                  <span className={cn('block font-semibold', checked ? 'text-text-primary' : 'text-text-primary')}>
                    {t(`configuracoes.equipe.roles.${key}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={close}>
            {t('configuracoes.cancel')}
          </Button>
          <Button type="submit" variant="primary" leftIcon={UserPlus} disabled={saving}>
            {saving ? t('configuracoes.equipe.inviteModal.sending') : t('configuracoes.equipe.inviteModal.send')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

const TH = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-label text-text-label'

export default function EquipeSection() {
  const { t, i18n } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [actionError, setActionError] = useState(null)

  const { data: membros, loading, error, refetch } = useApi(listMembers, [])

  const onRemove = async (id) => {
    setRemovingId(id)
    setActionError(null)
    try {
      await removeMember(id)
      await refetch()
    } catch (err) {
      setActionError(err)
    } finally {
      setRemovingId(null)
    }
  }

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
            {!loading && membros && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <Badge variant="success" uppercase={false}>
                  {t('configuracoes.equipe.active', { count: membros.length })}
                </Badge>
              </div>
            )}
          </div>
          <Button variant="primary" leftIcon={UserPlus} onClick={() => setModalOpen(true)}>
            {t('configuracoes.equipe.invite')}
          </Button>
        </div>

        <ApiErrorBanner error={error || actionError} />

        {loading ? (
          <Skeleton className="h-64" rounded="rounded-2xl" />
        ) : !membros?.length ? (
          <EmptyState compact icon={Users} title={t('configuracoes.equipe.empty')} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-hairline/60">
            <table className="w-full">
              <thead className="bg-bg-surface/60">
                <tr>
                  <th className={TH}>{t('configuracoes.equipe.columns.member')}</th>
                  <th className={TH}>{t('configuracoes.equipe.columns.role')}</th>
                  <th className={TH}>{t('configuracoes.equipe.columns.joinedAt')}</th>
                  <th className={cn(TH, 'text-right')} />
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr key={m.id} className="border-t border-hairline/80 transition-colors hover:bg-bg-elevated/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="sm" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-text-primary">{m.name}</div>
                          <div className="truncate text-xs text-text-muted">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANT[m.role]} uppercase={false}>
                        {t(`configuracoes.equipe.roles.${m.role}`, m.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm tabular-nums text-text-secondary">
                      {formatDate(m.joinedAt, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label={t('configuracoes.equipe.remove')}
                        onClick={() => onRemove(m.id)}
                        disabled={removingId === m.id}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-tertiary-500/15 hover:text-tint-rose disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConvidarMembroModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInvited={refetch}
        t={t}
      />
    </>
  )
}
