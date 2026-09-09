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
  // Lido no render, junto com o nome, e não dentro do `onConfirmar`: os dois
  // descrevem o criador que a pessoa está vendo, e é esse que ela mandou
  // apagar. Reler dentro do callback é ler outro instante.
  const id = influenciador?.id

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
        await deleteInfluencer(id)
        // O nome vai junto, e não é relido pelo chamador depois.
        //
        // Quem recebe este aviso o exibe num toast na lista. Enquanto ele
        // relia `influenciador?.name` por conta própria, lia **depois** do
        // `DELETE` — e nesse ponto o criador já não existe: uma busca em voo
        // volta 404, o estado da tela vira `null`, e o nome chega `undefined`.
        // A lista então abria um toast vazio, que é como a exclusão terminava
        // em silêncio de vez em quando.
        //
        // `nome` aqui é o do render que desenhou o modal — o mesmo que a
        // pessoa teve de digitar para chegar até este clique.
        onExcluido?.(nome)
      }}
    />
  )
}
