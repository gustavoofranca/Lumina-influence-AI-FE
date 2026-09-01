import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import { atualizarInfluenciador } from '../../services/influencers.js'

const CAMPOS = ['name', 'niche', 'bio']

/**
 * Edição dos dados do criador.
 *
 * Nome, nicho e bio apareciam na tela e vinham só do seed — a API aceitava
 * `PATCH` desde a B4 e não havia campo em lugar nenhum.
 *
 * Envia **apenas o que mudou**: mandar o objeto inteiro sobrescreveria com o
 * valor exibido um campo que outra pessoa alterou enquanto esta tela estava
 * aberta. É a mesma disciplina do modal de campanha.
 */
export default function EditarCriadorModal({ open, onClose, influenciador, onSalvo }) {
  const { t } = useTranslation()
  const [campos, setCampos] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!open || !influenciador) return
    setCampos({
      name: influenciador.name ?? '',
      niche: influenciador.niche ?? '',
      bio: influenciador.bio ?? '',
    })
    setErro(null)
  }, [open, influenciador])

  const mudar = (chave) => (e) => setCampos((p) => ({ ...p, [chave]: e.target.value }))

  const salvar = async (e) => {
    e.preventDefault()
    const alterados = {}
    for (const chave of CAMPOS) {
      if (campos[chave] !== (influenciador?.[chave] ?? '')) alterados[chave] = campos[chave]
    }
    if (!Object.keys(alterados).length) {
      onClose()
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      await atualizarInfluenciador(influenciador.id, alterados)
      await onSalvo?.()
    } catch (err) {
      setErro(err)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={salvando ? undefined : onClose}
      title={t('influenciador.editar.title')}
      size="md"
      closeOnOverlayClick={!salvando}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" loading={salvando} disabled={salvando}
                  onClick={salvar} type="button">
            {t('influenciador.editar.save')}
          </Button>
        </>
      }
    >
      <form onSubmit={salvar} className="flex flex-col gap-4">
        <Input label={t('influenciador.editar.name')} value={campos.name ?? ''}
               onChange={mudar('name')} disabled={salvando} required />
        <Input label={t('influenciador.editar.niche')} value={campos.niche ?? ''}
               onChange={mudar('niche')} disabled={salvando} />
        <Input label={t('influenciador.editar.bio')} value={campos.bio ?? ''}
               onChange={mudar('bio')} disabled={salvando} />
        {erro ? <ApiErrorBanner error={erro} /> : null}
      </form>
    </Modal>
  )
}
