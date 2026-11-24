import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, ShieldOff } from 'lucide-react'

import Card, { CardLabel, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Input from '../ui/Input.jsx'
import Modal from '../ui/Modal.jsx'
import PasswordInput from '../ui/PasswordInput.jsx'
import AvisoDeEntrada from '../auth/AvisoDeEntrada.jsx'
import AtivacaoDoisFatores from '../auth/AtivacaoDoisFatores.jsx'
import CodigosDeRecuperacao from '../auth/CodigosDeRecuperacao.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { idDoCampo, useCampos } from '../../hooks/useCampos.js'
import { desligarDoisFatores, novosCodigosDeRecuperacao } from '../../services/auth.js'
import { mensagemDeAuth } from '../../lib/errosDeAuth.js'
import { codigoDoApp, errosDaApi, validarCodigoDoApp } from '../../lib/limites.js'

/**
 * Verificação em duas etapas da própria conta.
 *
 * Obrigatória para administrador: ele não chega aqui sem ela (a API só entrega
 * a sessão depois da ativação) e não pode desligá-la. Membro e visualizador
 * ativam e desligam à vontade. Trocar os códigos de recuperação e desligar
 * pedem um código válido — quem roubou só a sessão não mexe no 2FA.
 */
export default function DoisFatoresCard() {
  const { t } = useTranslation()
  const { user, aplicarSessao, refreshUser } = useAuth()
  const [modal, setModal] = useState(null) // 'ativar' | 'codigos' | 'desligar' | null
  const [aviso, setAviso] = useState(null)
  const obrigatorio = user?.role === 'admin'

  const fechar = () => setModal(null)

  const aoAtivar = (dados) => {
    // A ativação encerrou as outras sessões e devolveu um par novo.
    aplicarSessao(dados)
    fechar()
    setAviso({ tipo: 'ok', texto: t('configuracoes.perfil.doisFatores.enabled') })
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardLabel>{t('configuracoes.perfil.doisFatores.label')}</CardLabel>
          <CardTitle className="mt-1.5">{t('configuracoes.perfil.doisFatores.title')}</CardTitle>
          <p className="mt-1 text-sm text-text-secondary">{t('configuracoes.perfil.doisFatores.subtitle')}</p>
        </div>
        <span className={user?.mfa_enabled ? 'text-emerald-400' : 'text-text-muted'}>
          {user?.mfa_enabled ? <ShieldCheck size={22} aria-hidden /> : <ShieldOff size={22} aria-hidden />}
        </span>
      </div>

      {aviso && <AvisoDeEntrada tipo={aviso.tipo}>{aviso.texto}</AvisoDeEntrada>}

      {user?.mfa_enabled ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-primary">
            {t('configuracoes.perfil.doisFatores.on')}{' '}
            <span className="text-text-secondary">
              {t('configuracoes.perfil.doisFatores.codesLeft', { count: user.recovery_codes_left })}
            </span>
          </p>
          {obrigatorio && (
            <p className="text-sm text-text-secondary">{t('configuracoes.perfil.doisFatores.required')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => { setAviso(null); setModal('codigos') }}>
              {t('configuracoes.perfil.doisFatores.newCodes')}
            </Button>
            {!obrigatorio && (
              <Button type="button" variant="outlined" onClick={() => { setAviso(null); setModal('desligar') }}>
                {t('configuracoes.perfil.doisFatores.disable')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-text-secondary">{t('configuracoes.perfil.doisFatores.off')}</p>
          <Button type="button" variant="primary" onClick={() => { setAviso(null); setModal('ativar') }}>
            {t('configuracoes.perfil.doisFatores.enable')}
          </Button>
        </div>
      )}

      <Modal open={modal === 'ativar'} onClose={fechar} title={t('auth.mfa.setup.title')}
             closeOnOverlayClick={false}>
        {modal === 'ativar' && <AtivacaoDoisFatores onAtivado={aoAtivar} />}
      </Modal>

      <Modal open={modal === 'codigos'} onClose={fechar} title={t('configuracoes.perfil.doisFatores.newCodes')}
             closeOnOverlayClick={false}>
        {modal === 'codigos' && (
          <NovosCodigos
            onConcluido={async () => {
              await refreshUser()
              fechar()
            }}
          />
        )}
      </Modal>

      <Modal open={modal === 'desligar'} onClose={fechar} title={t('configuracoes.perfil.doisFatores.disable')}>
        {modal === 'desligar' && (
          <Desligar
            temSenha={user?.has_password}
            onDesligado={async () => {
              await refreshUser()
              fechar()
              setAviso({ tipo: 'ok', texto: t('configuracoes.perfil.doisFatores.disabled') })
            }}
          />
        )}
      </Modal>
    </Card>
  )
}

/** Pede um código do app e mostra os 10 novos códigos de recuperação. */
function NovosCodigos({ onConcluido }) {
  const { t } = useTranslation()
  const [codigos, setCodigos] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos(
    { codigo: '' },
    { codigo: (tt, c) => validarCodigoDoApp(tt, c.codigo) }
  )

  if (codigos) {
    return <CodigosDeRecuperacao codigos={codigos} onContinuar={onConcluido}
                                 rotuloContinuar={t('configuracoes.perfil.doisFatores.done')} />
  }

  const gerar = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      setCodigos((await novosCodigosDeRecuperacao(codigoDoApp(campos.codigo))).recovery_codes)
    } catch (err) {
      const porCampo = errosDaApi(err, { code: 'codigo' })
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={gerar} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">{t('configuracoes.perfil.doisFatores.newCodesExplain')}</p>
      <Input
        id={idDoCampo('codigo')}
        label={t('auth.mfa.codeLabel')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        value={campos.codigo}
        onChange={(e) => set('codigo', e.target.value)}
        onBlur={() => sair('codigo')}
        error={erros.codigo}
      />
      {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={enviando}>
          {t('configuracoes.perfil.doisFatores.generate')}
        </Button>
      </div>
    </form>
  )
}

/** Desligar exige o código e, em conta com senha, a senha. */
function Desligar({ temSenha, onDesligado }) {
  const { t } = useTranslation()
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const validadores = { codigo: (tt, c) => validarCodigoDoApp(tt, c.codigo) }
  if (temSenha) validadores.senha = (tt, c) => (c.senha ? null : tt('common.validation.required'))
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos({ codigo: '', senha: '' }, validadores)

  const desligar = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      await desligarDoisFatores(codigoDoApp(campos.codigo), temSenha ? campos.senha : undefined)
      await onDesligado()
    } catch (err) {
      const porCampo = errosDaApi(err, { code: 'codigo', password: 'senha' })
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={desligar} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">{t('configuracoes.perfil.doisFatores.disableExplain')}</p>
      {temSenha && (
        <PasswordInput
          id={idDoCampo('senha')}
          label={t('configuracoes.perfil.seguranca.current')}
          autoComplete="current-password"
          value={campos.senha}
          onChange={(e) => set('senha', e.target.value)}
          onBlur={() => sair('senha')}
          error={erros.senha}
        />
      )}
      <Input
        id={idDoCampo('codigo')}
        label={t('auth.mfa.codeLabel')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        value={campos.codigo}
        onChange={(e) => set('codigo', e.target.value)}
        onBlur={() => sair('codigo')}
        error={erros.codigo}
      />
      {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={enviando}>
          {t('configuracoes.perfil.doisFatores.disable')}
        </Button>
      </div>
    </form>
  )
}
