import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus } from 'lucide-react'

import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import { useApi } from '../../hooks/useApi.js'
import { listInfluencers } from '../../services/influencers.js'
import { adicionarParticipante } from '../../services/campaigns.js'

/**
 * Escolhe um criador da agência para entrar na campanha.
 *
 * A lista já exclui quem está vinculado: oferecer alguém que o back-end vai
 * recusar com 409 seria propor uma ação que não pode dar certo.
 *
 * `enriched: false` de propósito — aqui só se precisa de nome e handle, e a
 * versão com métricas custa uma consulta bem mais cara por criador.
 */
export default function AdicionarParticipanteModal({
  open, onClose, campanhaId, jaVinculados = [], onAdicionado,
}) {
  const { t } = useTranslation()
  const [escolhido, setEscolhido] = useState('')
  const [cache, setCache] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  const { data: criadores, loading, error: erroLista, refetch } =
    useApi(() => listInfluencers({ enriched: false }), [])

  const disponiveis = useMemo(() => {
    const dentro = new Set(jaVinculados)
    return (criadores || []).filter((c) => !dentro.has(c.id))
  }, [criadores, jaVinculados])

  useEffect(() => {
    if (!open) return
    setEscolhido('')
    setCache('')
    setErro(null)
  }, [open])

  const adicionar = async () => {
    if (!escolhido) return
    setSalvando(true)
    setErro(null)
    try {
      const criador = disponiveis.find((c) => c.id === escolhido)
      await adicionarParticipante(campanhaId, { influencerId: escolhido, feeReais: cache })
      await onAdicionado?.(criador?.name)
    } catch (err) {
      setErro(err)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={salvando ? undefined : onClose}
      title={t('campanha.participantes.addTitle')}
      size="md"
      closeOnOverlayClick={!salvando}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            leftIcon={UserPlus}
            loading={salvando}
            disabled={!escolhido || salvando}
            onClick={adicionar}
          >
            {t('campanha.participantes.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">
          {t('campanha.participantes.addSubtitle')}
        </p>

        {erroLista ? (
          // Falha ao listar não pode virar "todos já estão na campanha": seria
          // ausência de resposta apresentada como ausência de dado.
          <ApiErrorBanner error={erroLista} onRetry={refetch} />
        ) : loading ? (
          <p className="text-sm text-text-muted">{t('common.loading')}</p>
        ) : !disponiveis.length ? (
          <EmptyState compact icon={UserPlus} title={t('campanha.participantes.noneLeft')} />
        ) : (
          <>
            <div>
              <label htmlFor="participante" className="mb-1.5 block text-label">
                {t('campanha.participantes.creator')}
              </label>
              <select
                id="participante"
                value={escolhido}
                onChange={(e) => setEscolhido(e.target.value)}
                disabled={salvando}
                className="w-full rounded-xl bg-bg-input px-3.5 py-2.5 text-sm text-text-primary ring-1 ring-inset ring-hairline focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">—</option>
                {disponiveis.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.handle ? ` · ${c.handle}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('campanha.participantes.fee')}
              type="number"
              min="0"
              step="0.01"
              value={cache}
              onChange={(e) => setCache(e.target.value)}
              disabled={salvando}
            />
          </>
        )}

        {erro ? <ApiErrorBanner error={erro} /> : null}
      </div>
    </Modal>
  )
}
