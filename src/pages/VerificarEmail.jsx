import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import PedirLink from '../components/auth/PedirLink.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { useSeguirEntrada } from '../hooks/useSeguirEntrada.js'
import { reenviarVerificacao, verificarEmail } from '../services/auth.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'

const VALIDADORES = {
  senha: (t, c) => (c.senha ? null : t('common.validation.required')),
}

function falhaDoLink(t, err) {
  if (err.code === 'verification_token_expired') return { tipo: 'expired' }
  if (err.code === 'verification_token_invalid') return { tipo: 'invalid' }
  return { tipo: 'erro', texto: mensagemDeAuth(t, err) }
}

/**
 * Destino do link de confirmação. Lê o token, tira-o da barra de endereço e
 * confirma — quem confirma já entra.
 *
 * Conta criada com senha só é ativada junto com ela: a API responde
 * verification_password_required sem gastar o link, e a tela pede a senha.
 * Isso impede que um cadastro feito por outra pessoa com este e-mail seja
 * ativado por quem só recebeu o link. Convite sem senha confirma direto.
 *
 * Uma chamada automática só por montagem: o token é de uso único, e o React em
 * modo estrito roda este efeito duas vezes em desenvolvimento. Sem a trava, a
 * segunda chamada trocaria o sucesso por "link já usado".
 */
export default function VerificarEmail() {
  const { t } = useTranslation()
  // Quem se cadastra é admin da agência nova: o passo seguinte é ativar o 2FA.
  const seguirEntrada = useSeguirEntrada()
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token'))
  const [falha, setFalha] = useState(() => (token ? null : { tipo: 'invalid' }))
  const [pedeSenha, setPedeSenha] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const { campos, erros, set, sair, validarTudo } = useCampos({ senha: '' }, VALIDADORES)
  const jaChamou = useRef(false)


  useEffect(() => {
    window.history.replaceState(null, '', '/verificar-email')
    if (!token || jaChamou.current) return
    jaChamou.current = true
    verificarEmail(token)
      .then(seguirEntrada)
      .catch((err) => {
        if (err.code === 'verification_password_required') setPedeSenha(true)
        else setFalha(falhaDoLink(t, err))
      })
  }, [token, seguirEntrada, t])

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      seguirEntrada(await verificarEmail(token, campos.senha))
    } catch (err) {
      if (err.code === 'verification_password_invalid') setAviso({ texto: t('auth.verificar.wrongPassword'), recadastro: true })
      else if (err.code?.startsWith('verification_token_')) setFalha(falhaDoLink(t, err))
      else setAviso({ texto: mensagemDeAuth(t, err) })
      setEnviando(false)
    }
  }

  if (falha) {
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

  if (pedeSenha) {
    return (
      <AuthLayout>
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-white">{t('auth.verificar.passwordTitle')}</h1>
          <p className="mt-2 text-sm text-landing-muted">{t('auth.verificar.passwordSubtitle')}</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <PasswordInput
            variant="vidro"
            id={idDoCampo('senha')}
            label={t('auth.verificar.password')}
            autoComplete="current-password"
            value={campos.senha}
            onChange={(e) => set('senha', e.target.value)}
            onBlur={() => sair('senha')}
            error={erros.senha}
          />
          {aviso && (
            <AvisoDeEntrada tipo="erro">
              {aviso.texto}
              {aviso.recadastro && (
                <>
                  {' '}
                  <Link to="/cadastro" className="font-semibold underline hover:opacity-80">
                    {t('auth.verificar.signupAgain')}
                  </Link>
                </>
              )}
            </AvisoDeEntrada>
          )}
          <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={enviando}>
            {t('auth.verificar.passwordSubmit')}
          </Button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <p className="mt-4 text-sm text-landing-muted">{t('auth.verificar.checking')}</p>
      </div>
    </AuthLayout>
  )
}
