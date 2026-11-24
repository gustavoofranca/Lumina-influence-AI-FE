import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { useSeguirEntrada } from '../hooks/useSeguirEntrada.js'
import { verificarDoisFatores } from '../services/auth.js'
import { cn } from '../lib/cn.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import { codigoDoApp, errosDaApi, validarCodigoDeRecuperacao, validarCodigoDoApp } from '../lib/limites.js'

/**
 * Segundo passo do login de quem tem 2FA: o código de 6 dígitos do app, ou um
 * código de recuperação para quem perdeu o celular.
 *
 * O ticket chega pelo `history.state`. Sem ele — a página aberta direto ou
 * recarregada noutra aba —, não há o que verificar, e a pessoa volta ao login.
 * Errar o código não gasta o ticket; o limite é de 5 tentativas a cada 15
 * minutos.
 */
export default function DesafioDoisFatores() {
  const { t } = useTranslation()
  const { state } = useLocation()
  const ticket = state?.ticket
  const seguirEntrada = useSeguirEntrada()
  const [recuperacao, setRecuperacao] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [ticketVencido, setTicketVencido] = useState(false)
  const { campos, erros, set, sair, validarTudo, mostrarErros, limpar } = useCampos(
    { codigo: '' },
    {
      codigo: (tt, c) => (recuperacao ? validarCodigoDeRecuperacao(tt, c.codigo) : validarCodigoDoApp(tt, c.codigo)),
    }
  )

  if (!ticket) return <Navigate to="/login" replace />

  const alternar = () => {
    setRecuperacao((atual) => !atual)
    setAviso(null)
    limpar()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      const codigo = recuperacao ? campos.codigo.trim() : codigoDoApp(campos.codigo)
      seguirEntrada(await verificarDoisFatores(ticket, codigo))
    } catch (err) {
      if (err.code?.startsWith('mfa_ticket_')) {
        setTicketVencido(true)
      } else {
        const porCampo = errosDaApi(err, { code: 'codigo' })
        if (Object.keys(porCampo).length) mostrarErros(porCampo)
        else setAviso(mensagemDeAuth(t, err))
      }
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className={cn(
          'font-display text-3xl font-semibold tracking-[-0.02em]',
          'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent'
        )}>
          {t('auth.mfa.challenge.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">
          {recuperacao ? t('auth.mfa.challenge.subtitleRecovery') : t('auth.mfa.challenge.subtitle')}
        </p>
      </div>

      {ticketVencido ? (
        <div className="flex flex-col gap-4">
          <AvisoDeEntrada tipo="erro">{t('auth.mfa.ticketExpired')}</AvisoDeEntrada>
          <Link to="/login" replace className="text-center text-sm font-semibold text-landing-violet">
            {t('auth.mfa.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input
            variant="vidro"
            id={idDoCampo('codigo')}
            label={recuperacao ? t('auth.mfa.recoveryLabel') : t('auth.mfa.codeLabel')}
            inputMode={recuperacao ? 'text' : 'numeric'}
            autoComplete={recuperacao ? 'off' : 'one-time-code'}
            autoCapitalize="none"
            spellCheck={false}
            maxLength={recuperacao ? 9 : 7}
            leftIcon={KeyRound}
            value={campos.codigo}
            onChange={(e) => set('codigo', e.target.value)}
            onBlur={() => sair('codigo')}
            error={erros.codigo}
            autoFocus
          />

          {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}

          <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={enviando}>
            {t('auth.mfa.challenge.submit')}
          </Button>

          <button
            type="button"
            // Sem isto, o mousedown tira o foco do campo, a revalidação apaga
            // o erro da API embaixo dele, o botão sobe, e o mouseup cai fora
            // dele: o clique não acontece. Medido no e2e.
            onMouseDown={(e) => e.preventDefault()}
            onClick={alternar}
            className="w-full text-center text-xs text-landing-muted underline-offset-4 hover:underline"
          >
            {recuperacao ? t('auth.mfa.challenge.useApp') : t('auth.mfa.challenge.useRecovery')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
