import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Copy, KeyRound } from 'lucide-react'

import Input from '../ui/Input.jsx'
import Button from '../ui/Button.jsx'
import AvisoDeEntrada from './AvisoDeEntrada.jsx'
import CodigosDeRecuperacao from './CodigosDeRecuperacao.jsx'
import { idDoCampo, useCampos } from '../../hooks/useCampos.js'
import { confirmarDoisFatores, iniciarDoisFatores } from '../../services/auth.js'
import { cn } from '../../lib/cn.js'
import { mensagemDeAuth } from '../../lib/errosDeAuth.js'
import { codigoDoApp, errosDaApi, validarCodigoDoApp } from '../../lib/limites.js'

const VALIDADORES = { codigo: (t, c) => validarCodigoDoApp(t, c.codigo) }

/** A chave em grupos de 4, como os apps mostram: fica mais fácil de conferir. */
const emGrupos = (chave) => chave.match(/.{1,4}/g)?.join(' ') ?? chave

/**
 * Ativação do 2FA em três passos: escanear o QR (ou digitar a chave), digitar
 * o primeiro código e guardar os códigos de recuperação.
 *
 * Com `ticket`, é a ativação obrigatória do administrador no login; sem ele,
 * a feita de dentro da sessão, nas configurações. Nos dois casos a API devolve
 * uma sessão nova — a ativação encerra as anteriores —, entregue a
 * `onAtivado` só depois que a pessoa confirma que guardou os códigos.
 */
export default function AtivacaoDoisFatores({ ticket, onAtivado, vidro = false }) {
  const { t } = useTranslation()
  const [inicio, setInicio] = useState(null)
  const [falha, setFalha] = useState(null)
  const [ativado, setAtivado] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [chaveCopiada, setChaveCopiada] = useState(false)
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos({ codigo: '' }, VALIDADORES)
  // Cada chamada gera um segredo novo e descarta o anterior. No modo estrito
  // o efeito roda duas vezes, e o QR exibido poderia ser o do segredo que a
  // API já trocou — a confirmação falharia sem motivo aparente.
  const jaPediu = useRef(false)

  useEffect(() => {
    if (jaPediu.current) return
    jaPediu.current = true
    iniciarDoisFatores(ticket)
      .then(setInicio)
      .catch((err) => setFalha(err))
  }, [ticket])

  const confirmar = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      setAtivado(await confirmarDoisFatores(codigoDoApp(campos.codigo), ticket))
    } catch (err) {
      const porCampo = errosDaApi(err, { code: 'codigo' })
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
    } finally {
      setEnviando(false)
    }
  }

  const copiarChave = async () => {
    try {
      await navigator.clipboard.writeText(inicio.secret)
      setChaveCopiada(true)
    } catch {
      setChaveCopiada(false)
    }
  }

  const textoSecundario = vidro ? 'text-landing-muted' : 'text-text-secondary'

  if (falha) {
    const ticketVencido = falha.code?.startsWith('mfa_ticket_')
    return (
      <div className="flex flex-col gap-4">
        <AvisoDeEntrada tipo="erro">
          {ticketVencido ? t('auth.mfa.ticketExpired') : mensagemDeAuth(t, falha)}
        </AvisoDeEntrada>
        {ticket && (
          <Link to="/login" replace className="text-center text-sm font-semibold text-landing-violet">
            {t('auth.mfa.backToLogin')}
          </Link>
        )}
      </div>
    )
  }

  if (ativado) {
    return (
      <CodigosDeRecuperacao
        codigos={ativado.recovery_codes}
        vidro={vidro}
        onContinuar={() => onAtivado(ativado)}
      />
    )
  }

  if (!inicio) {
    return (
      <div role="status" className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span className="sr-only">{t('auth.mfa.setup.loading')}</span>
      </div>
    )
  }

  return (
    <form onSubmit={confirmar} noValidate className="flex flex-col gap-5">
      <ol className={cn('flex list-decimal flex-col gap-2 pl-5 text-sm', textoSecundario)}>
        <li>{t('auth.mfa.setup.step1')}</li>
        <li>{t('auth.mfa.setup.step2')}</li>
        <li>{t('auth.mfa.setup.step3')}</li>
      </ol>

      <div className="flex flex-col items-center gap-3">
        {/* Fundo branco fixo: QR com pouco contraste falha na leitura em tema escuro. */}
        <img
          src={inicio.qr_svg}
          alt={t('auth.mfa.setup.qrAlt')}
          className="h-48 w-48 rounded-xl bg-white p-2"
        />
        <details className={cn('w-full text-sm', textoSecundario)}>
          <summary className="cursor-pointer text-center">{t('auth.mfa.setup.cantScan')}</summary>
          <div className="mt-3 flex items-center justify-center gap-2">
            <code className={cn('rounded-lg px-3 py-2 font-mono text-sm tracking-wider',
                                vidro ? 'bg-white/5 text-white' : 'bg-bg-elevated text-text-primary')}>
              {emGrupos(inicio.secret)}
            </code>
            <Button type="button" size="sm" variant={vidro ? 'vidro' : 'secondary'} leftIcon={Copy}
                    onClick={copiarChave} aria-label={t('auth.mfa.setup.copyKey')}>
              {chaveCopiada ? t('auth.mfa.recovery.copied') : t('auth.mfa.setup.copyKey')}
            </Button>
          </div>
        </details>
      </div>

      <Input
        variant={vidro ? 'vidro' : 'padrao'}
        id={idDoCampo('codigo')}
        label={t('auth.mfa.codeLabel')}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={7}
        leftIcon={KeyRound}
        value={campos.codigo}
        onChange={(e) => set('codigo', e.target.value)}
        onBlur={() => sair('codigo')}
        error={erros.codigo}
      />

      {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}

      <Button type="submit" variant={vidro ? 'vidro-primaria' : 'primary'} fullWidth={vidro}
              size={vidro ? 'lg' : 'md'} loading={enviando}>
        {t('auth.mfa.setup.confirm')}
      </Button>
    </form>
  )
}
