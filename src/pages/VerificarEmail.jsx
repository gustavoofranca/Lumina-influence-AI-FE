import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../layouts/AuthLayout.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import PedirLink from '../components/auth/PedirLink.jsx'
import { destinoAposLogin, useAuth } from '../context/AuthContext.jsx'
import { reenviarVerificacao, verificarEmail } from '../services/auth.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'

/**
 * Destino do link de confirmação. Lê o token, tira-o da barra de endereço e
 * confirma — quem confirma já entra.
 *
 * Uma chamada só por montagem: o token é de uso único, e o React em modo
 * estrito roda este efeito duas vezes em desenvolvimento. Sem a trava, a
 * segunda chamada trocaria o sucesso por "link já usado".
 */
export default function VerificarEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { aplicarSessao } = useAuth()
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token'))
  const [falha, setFalha] = useState(() => (token ? null : { tipo: 'invalid' }))
  const jaChamou = useRef(false)

  useEffect(() => {
    window.history.replaceState(null, '', '/verificar-email')
    if (!token || jaChamou.current) return
    jaChamou.current = true
    verificarEmail(token)
      .then((sessao) => {
        aplicarSessao(sessao)
        navigate(destinoAposLogin(sessao.user, sessao.agency), { replace: true })
      })
      .catch((err) => {
        if (err.code === 'verification_token_expired') setFalha({ tipo: 'expired' })
        else if (err.code === 'verification_token_invalid') setFalha({ tipo: 'invalid' })
        else setFalha({ tipo: 'erro', texto: mensagemDeAuth(t, err) })
      })
  }, [token, aplicarSessao, navigate, t])

  if (!falha) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm text-landing-muted">{t('auth.verificar.checking')}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="mb-4 text-center font-display text-2xl font-semibold text-white">
        {t('auth.verificar.resendTitle')}
      </h1>
      <AvisoDeEntrada tipo="erro" className="mb-6">
        {falha.tipo === 'erro' ? falha.texto : t(`auth.verificar.${falha.tipo}`)}
      </AvisoDeEntrada>
      <PedirLink
        enviar={reenviarVerificacao}
        rotulo={t('auth.verificar.resendSubmit')}
        enviado={t('auth.verificar.sent')}
      />
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-landing-violet hover:opacity-80">
          {t('auth.verificar.toLogin')}
        </Link>
      </p>
    </AuthLayout>
  )
}
