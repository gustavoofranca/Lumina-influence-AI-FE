import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'

import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import { deleteInfluencer } from '../../services/influencers.js'

/**
 * Confirmação de exclusão definitiva de um criador.
 *
 * A exclusão é física e em cascata — contas conectadas, posts, comentários e
 * análises vão junto, sem lixeira. Um clique só é pouco para isso, então o
 * nome do criador precisa ser digitado: é a diferença entre errar o botão e
 * decidir apagar.
 *
 * A comparação ignora espaços nas pontas e diferença de caixa. Exigir o nome
 * caractere a caractere transformaria a guarda em obstáculo de digitação, que
 * é outra coisa.
 */
export default function ExcluirCriadorModal({ open, onClose, influenciador, onExcluido }) {
  const { t } = useTranslation()
  const [texto, setTexto] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState(null)

  // Reabrir depois de um erro precisa começar limpo, senão o banner antigo
  // acusa uma falha que não é a desta tentativa.
  useEffect(() => {
    if (!open) return
    setTexto('')
    setErro(null)
  }, [open])

  const nome = influenciador?.name ?? ''
  const confere = texto.trim().toLowerCase() === nome.trim().toLowerCase() && nome !== ''

  const excluir = async () => {
    if (!confere) return
    setExcluindo(true)
    setErro(null)
    try {
      await deleteInfluencer(influenciador.id)
      onExcluido?.()
    } catch (err) {
      // A falha fica no modal: fechar aqui deixaria o usuário na tela do
      // criador sem saber se ele foi apagado ou não.
      setErro(err)
      setExcluindo(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={excluindo ? undefined : onClose}
      title={t('influenciador.excluir.title')}
      size="md"
      closeOnOverlayClick={!excluindo}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={excluindo}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            leftIcon={Trash2}
            loading={excluindo}
            disabled={!confere}
            onClick={excluir}
            className="!bg-tertiary-600 !shadow-none hover:!bg-tertiary-500"
          >
            {t('influenciador.excluir.confirm')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          {t('influenciador.excluir.warning', { nome })}
        </p>

        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-text-secondary">
          <li>{t('influenciador.excluir.items.accounts')}</li>
          <li>{t('influenciador.excluir.items.posts')}</li>
          <li>{t('influenciador.excluir.items.analyses')}</li>
        </ul>

        <p className="text-sm font-semibold text-tint-rose">
          {t('influenciador.excluir.irreversible')}
        </p>

        {erro ? <ApiErrorBanner error={erro} /> : null}

        <Input
          label={t('influenciador.excluir.prompt', { nome })}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={excluindo}
          autoComplete="off"
        />
      </div>
    </Modal>
  )
}
