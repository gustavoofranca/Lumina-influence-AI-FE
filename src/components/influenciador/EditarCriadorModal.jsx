import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import ApiErrorBanner from '../ui/ApiErrorBanner.jsx'
import { LIMITES, errosDaApi, validarTexto } from '../../lib/limites.js'
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
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (!open || !influenciador) return
    setCampos({
      name: influenciador.name ?? '',
      niche: influenciador.niche ?? '',
      bio: influenciador.bio ?? '',
    })
    setErro(null)
    setErros({})
  }, [open, influenciador])

  const mudar = (chave) => (e) => {
    setCampos((p) => ({ ...p, [chave]: e.target.value }))
    setErros((p) => ({ ...p, [chave]: undefined }))
  }

  // As mesmas regras da API (lib/limites.js). Nome e nicho não aceitam < >.
  const validar = () => {
    const e = {}
    const nome = validarTexto(t, campos.name, { max: LIMITES.nomeCriador, obrigatorio: true, semMarcacao: true })
    const nicho = validarTexto(t, campos.niche, { max: LIMITES.nicho, semMarcacao: true })
    const bio = validarTexto(t, campos.bio, { max: LIMITES.bio })
    if (nome) e.name = nome
    if (nicho) e.niche = nicho
    if (bio) e.bio = bio
    return e
  }

  const salvar = async (e) => {
    e.preventDefault()
    const encontrados = validar()
    setErros(encontrados)
    if (Object.keys(encontrados).length) return
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
      const porCampo = errosDaApi(err, { display_name: 'name', niche: 'niche', bio: 'bio' })
      if (Object.keys(porCampo).length) setErros(porCampo)
      else setErro(err)
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
               onChange={mudar('name')} disabled={salvando} required
               maxLength={LIMITES.nomeCriador} error={erros.name} />
        <Input label={t('influenciador.editar.niche')} value={campos.niche ?? ''}
               onChange={mudar('niche')} disabled={salvando}
               maxLength={LIMITES.nicho} error={erros.niche} />
        <Input label={t('influenciador.editar.bio')} value={campos.bio ?? ''}
               onChange={mudar('bio')} disabled={salvando}
               maxLength={LIMITES.bio} contador error={erros.bio} />
        {erro ? <ApiErrorBanner error={erro} /> : null}
      </form>
    </Modal>
  )
}
