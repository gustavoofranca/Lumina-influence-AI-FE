import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Building2, Hash, Sparkles } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getAgency, updateAgency } from '../../services/agency.js'

/**
 * Cadastro da agência.
 *
 * A tabela `agencies` guarda nome, CNPJ e plano. Nome fantasia, site, setor,
 * endereço, descrição e ano de fundação não têm coluna — o formulário
 * coletava e o envio descartava. Ficam de fora até existir migration.
 */
export default function AgenciaSection({ onSave }) {
  const { t } = useTranslation()
  const { data: agencia, loading, error, refetch } = useApi(getAgency, [])

  const [fields, setFields] = useState({ name: '', cnpj: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (agencia) setFields({ name: agencia.name, cnpj: agencia.cnpj })
  }, [agencia])

  const set = (key) => (e) => setFields((p) => ({ ...p, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!agencia) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateAgency(agencia.id, fields)
      await refetch()
      onSave?.()
    } catch (err) {
      setSaveError(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-72" rounded="rounded-3xl" />

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card glass className="flex flex-col gap-5">
        <div>
          <CardLabel>{t('configuracoes.agencia.title')}</CardLabel>
          <CardTitle className="mt-1.5">{t('configuracoes.agencia.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">
            {t('configuracoes.agencia.subtitle')}
          </p>
        </div>

        <ApiErrorBanner error={error || saveError} onRetry={refetch} />

        <div className="flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary-600/5 p-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-superficie bg-gradient-brand text-white">
            <Sparkles size={22} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold text-text-primary">{fields.name}</p>
            {agencia?.plan && (
              <p className="text-xs text-text-muted">{agencia.plan.name}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label={t('configuracoes.agencia.name')}
            leftIcon={Building2}
            value={fields.name}
            onChange={set('name')}
            required
          />
          <Input
            label={t('configuracoes.agencia.cnpj')}
            leftIcon={Hash}
            value={fields.cnpj}
            onChange={set('cnpj')}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={saving || !agencia}>
          {saving ? t('configuracoes.saving') : t('configuracoes.save')}
        </Button>
      </div>
    </form>
  )
}
