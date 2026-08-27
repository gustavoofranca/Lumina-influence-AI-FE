import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '../../lib/cn.js'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'

const STATUSES = ['planning', 'active', 'completed', 'paused']

/**
 * Edição da campanha.
 *
 * Envia só os campos que mudaram: o schema do back-end trata ausência como
 * "não mexer", então mandar tudo transformaria uma edição de título numa
 * reescrita silenciosa do resto.
 */
export default function EditarCampanhaModal({
  open, onClose, campanha, onSave, salvando = false, erroApi = null,
}) {
  const { t } = useTranslation()
  const [campos, setCampos] = useState({})
  const [erro, setErro] = useState('')

  // Reabrir o modal precisa mostrar o estado atual, não o rascunho anterior.
  useEffect(() => {
    if (!open || !campanha) return
    setCampos({
      brand: campanha.brand || '',
      name: campanha.name || '',
      startDate: campanha.startDate || '',
      endDate: campanha.endDate || '',
      budget: campanha.budget ?? 0,
      status: campanha.status || 'planning',
    })
    setErro('')
  }, [open, campanha])

  const set = (chave) => (e) => {
    setCampos((p) => ({ ...p, [chave]: e.target.value }))
    setErro('')
  }

  const submeter = async (e) => {
    e.preventDefault()
    if (!campos.brand?.trim()) return setErro(t('campanhas.editModal.brandRequired'))
    if (!campos.startDate || !campos.endDate) return setErro(t('campanhas.editModal.periodRequired'))
    if (campos.endDate < campos.startDate) return setErro(t('campanhas.editModal.periodInverted'))
    const orcamento = Number(campos.budget)
    if (Number.isNaN(orcamento) || orcamento < 0) return setErro(t('campanhas.editModal.budgetInvalid'))

    // Só o que mudou — comparar aqui é o que mantém o PATCH sendo um PATCH.
    const alterados = {}
    for (const chave of ['brand', 'name', 'startDate', 'endDate', 'status']) {
      if (campos[chave] !== (campanha[chave] ?? '')) alterados[chave] = campos[chave]
    }
    if (orcamento !== campanha.budget) alterados.budget = orcamento

    if (Object.keys(alterados).length === 0) {
      onClose?.()
      return
    }
    await onSave?.(alterados)
  }

  return (
    <Modal open={open} onClose={onClose} title={t('campanhas.editModal.title')} size="md">
      <form onSubmit={submeter} className="space-y-5">
        <Input
          label={t('campanhas.editModal.brand')}
          value={campos.brand ?? ''}
          onChange={set('brand')}
        />
        <Input
          label={t('campanhas.editModal.name')}
          value={campos.name ?? ''}
          onChange={set('name')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('campanhas.editModal.start')}
            type="date"
            value={campos.startDate ?? ''}
            onChange={set('startDate')}
          />
          <Input
            label={t('campanhas.editModal.end')}
            type="date"
            value={campos.endDate ?? ''}
            onChange={set('endDate')}
          />
        </div>

        <Input
          label={t('campanhas.editModal.budget')}
          type="number"
          min="0"
          step="1"
          value={campos.budget ?? 0}
          onChange={set('budget')}
          helperText={t('campanhas.editModal.budgetHint')}
        />

        <div className="flex flex-col gap-2">
          <span className="text-label">{t('campanhas.editModal.status')}</span>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setCampos((p) => ({ ...p, status: s }))}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors',
                  campos.status === s
                    ? 'bg-primary-600/20 text-accent-strong ring-primary-500/40'
                    : 'bg-bg-surface/60 text-text-secondary ring-hairline hover:text-text-primary'
                )}
              >
                {t(`campanhas.status.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {(erro || erroApi) && (
          <p className="rounded-lg bg-tertiary-500/10 px-3 py-2 text-xs text-tint-rose">
            {erro || erroApi}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outlined" onClick={onClose} disabled={salvando}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" loading={salvando}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
