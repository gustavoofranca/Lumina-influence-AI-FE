import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Unplug } from 'lucide-react'

import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { cn } from '../../lib/cn.js'

/**
 * Confirmação de desconexão, com a escolha de apagar ou não o histórico.
 *
 * As duas operações moram no mesmo lugar porque a diferença entre elas é a
 * pergunta que o usuário precisa responder, não uma configuração escondida:
 * desligar a coleta preserva as publicações já coletadas (o padrão), e apagar
 * o histórico é o direito de eliminação exercido no escopo daquela rede.
 *
 * A caixa começa desmarcada de propósito. Ação destrutiva não pode ser o
 * caminho de menor resistência — quem quer apagar precisa dizer que quer.
 */
export default function DesconectarModal({ open, onClose, conta, onConfirmar, ocupada = false }) {
  const { t } = useTranslation()
  const [purgar, setPurgar] = useState(false)

  useEffect(() => {
    if (open) setPurgar(false)
  }, [open])

  const rede = conta?.platform ?? ''

  return (
    <Modal
      open={open}
      onClose={ocupada ? undefined : onClose}
      title={t('influenciador.desconectar.title')}
      size="md"
      closeOnOverlayClick={!ocupada}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={ocupada}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            leftIcon={Unplug}
            loading={ocupada}
            onClick={() => onConfirmar(purgar)}
            className={cn(purgar && '!bg-tertiary-600 !shadow-none hover:!bg-tertiary-500')}
          >
            {t(purgar
              ? 'influenciador.desconectar.confirmPurge'
              : 'influenciador.desconectar.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('influenciador.desconectar.explain', { rede })}
        </p>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-bg-surface p-4 ring-1 ring-inset ring-hairline">
          <input
            type="checkbox"
            checked={purgar}
            onChange={(e) => setPurgar(e.target.checked)}
            disabled={ocupada}
            className="mt-0.5 h-4 w-4 shrink-0 accent-tertiary-500"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text-primary">
              {t('influenciador.desconectar.purgeLabel')}
            </span>
            <span className="text-xs leading-relaxed text-text-secondary">
              {t('influenciador.desconectar.purgeHint')}
            </span>
          </span>
        </label>

        {purgar && (
          <p className="text-sm font-semibold text-tint-rose">
            {t('influenciador.desconectar.irreversible')}
          </p>
        )}
      </div>
    </Modal>
  )
}
