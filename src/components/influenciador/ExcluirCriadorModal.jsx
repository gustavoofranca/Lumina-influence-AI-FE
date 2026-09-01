import { useTranslation } from 'react-i18next'

import ConfirmacaoDigitada from '../ui/ConfirmacaoDigitada.jsx'
import { deleteInfluencer } from '../../services/influencers.js'

/**
 * Exclusão definitiva de um criador.
 *
 * A confirmação digitada e o tratamento de erro vivem em `ConfirmacaoDigitada`,
 * compartilhado com a exclusão de campanha: duas cópias de uma guarda
 * destrutiva divergem, e a que diverge é a que fica frouxa.
 *
 * Aqui não há lista de "o que permanece": a exclusão do criador é em cascata e
 * leva tudo — contas, tokens, publicações, comentários e análises.
 */
export default function ExcluirCriadorModal({ open, onClose, influenciador, onExcluido }) {
  const { t } = useTranslation()
  const nome = influenciador?.name ?? ''

  return (
    <ConfirmacaoDigitada
      open={open}
      onClose={onClose}
      titulo={t('influenciador.excluir.title')}
      aviso={t('influenciador.excluir.warning', { nome })}
      itens={[
        t('influenciador.excluir.items.accounts'),
        t('influenciador.excluir.items.posts'),
        t('influenciador.excluir.items.analyses'),
      ]}
      palavra={nome}
      rotuloConfirmar={t('influenciador.excluir.confirm')}
      onConfirmar={async () => {
        await deleteInfluencer(influenciador.id)
        onExcluido?.()
      }}
    />
  )
}
