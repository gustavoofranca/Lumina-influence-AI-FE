import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash } from 'iconsax-reactjs'

import Modal from './Modal.jsx'
import Button from './Button.jsx'
import Input from './Input.jsx'
import ApiErrorBanner from './ApiErrorBanner.jsx'

/**
 * Confirmação de ação destrutiva por texto digitado.
 *
 * Um clique é pouco para o que não tem lixeira: digitar a palavra é o que
 * separa errar o botão de decidir apagar. A comparação ignora caixa e espaços
 * nas pontas — exigir o texto caractere a caractere transformaria a guarda em
 * obstáculo de digitação, que é outra coisa.
 *
 * A falha fica **dentro** do modal: fechar deixaria quem clicou sem saber se a
 * ação aconteceu.
 *
 * `itens` descreve o que será apagado, e `preservados` o que sobrevive — dizer
 * só o que se perde faz o usuário imaginar o pior, e o pior costuma ser falso.
 */
export default function ConfirmacaoDigitada({
  open,
  onClose,
  onConfirmar,
  titulo,
  aviso,
  itens = [],
  preservados = [],
  palavra,
  rotuloConfirmar,
}) {
  const { t } = useTranslation()
  const [texto, setTexto] = useState('')
  const [executando, setExecutando] = useState(false)
  const [erro, setErro] = useState(null)

  // Reabrir depois de um erro precisa começar limpo, senão o banner antigo
  // acusa uma falha que não é a desta tentativa.
  useEffect(() => {
    if (!open) return
    setTexto('')
    setErro(null)
  }, [open])

  const confere = Boolean(palavra) &&
    texto.trim().toLowerCase() === String(palavra).trim().toLowerCase()

  const confirmar = async () => {
    if (!confere) return
    setExecutando(true)
    setErro(null)
    try {
      await onConfirmar()
    } catch (err) {
      setErro(err)
      setExecutando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={executando ? undefined : onClose}
      title={titulo}
      size="md"
      closeOnOverlayClick={!executando}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={executando}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            leftIcon={Trash}
            loading={executando}
            disabled={!confere}
            onClick={confirmar}
            className="!bg-tertiary-600 !shadow-none hover:!bg-tertiary-500"
          >
            {rotuloConfirmar}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-text-secondary">{aviso}</p>

        {itens.length > 0 && (
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-text-secondary">
            {itens.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}

        {preservados.length > 0 && (
          <div className="rounded-xl bg-bg-surface p-3 text-sm text-text-secondary">
            <p className="font-semibold text-text-primary">
              {t('common.destructive.kept')}
            </p>
            <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
              {preservados.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}

        <p className="text-sm font-semibold text-tint-rose">
          {t('common.destructive.irreversible')}
        </p>

        {erro ? <ApiErrorBanner error={erro} /> : null}

        <Input
          label={t('common.destructive.prompt', { palavra })}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={executando}
          autoComplete="off"
        />
      </div>
    </Modal>
  )
}
