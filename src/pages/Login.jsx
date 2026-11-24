import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Input from '../components/ui/Input.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import Divisor from '../components/auth/Divisor.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { destinoAposLogin, useAuth } from '../context/AuthContext.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { useOpcoesDeLogin } from '../hooks/useOpcoesDeLogin.js'
import { useSeguirEntrada } from '../hooks/useSeguirEntrada.js'
import { googleLoginUrl, loginComSenha, reenviarVerificacao } from '../services/auth.js'
import { cn } from '../lib/cn.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import { LIMITES, validarEmail } from '../lib/limites.js'

const VALIDADORES = {
  email: (t, c) => validarEmail(t, c.email),
  // No login não se aplica a política: a pessoa digita a senha que já tem.
  senha: (t, c) => (c.senha ? null : t('common.validation.required')),
}

/**
 * Entrada por e-mail e senha, Google, e — só em desenvolvimento — a conta de
 * demonstração.
 *
 * Senha errada e e-mail inexistente recebem a mesma frase (OWASP): a tela não
 * pode ser usada para descobrir quem tem conta.
 */
export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { state } = useLocation()
  const { devLogin } = useAuth()
  const seguirEntrada = useSeguirEntrada()
  const opcoes = useOpcoesDeLogin()
  const { campos, erros, set, sair, validarTudo } = useCampos({ email: '', senha: '' }, VALIDADORES)

  const [aviso, setAviso] = useState(() => (
    state?.senhaAlterada ? { tipo: 'ok', texto: t('auth.login.passwordChanged') } : null
  ))
  const [naoVerificado, setNaoVerificado] = useState(false)
  const [carregando, setCarregando] = useState(null) // 'senha' | 'demo' | null

  const seguir = (sessao) => navigate(destinoAposLogin(sessao.user, sessao.agency), { replace: true })

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    setNaoVerificado(false)
    if (!validarTudo()) return
    setCarregando('senha')
    try {
      // Com 2FA (ou admin que precisa ativar), vai para a tela do código.
      seguirEntrada(await loginComSenha(campos.email.trim(), campos.senha))
    } catch (err) {
      if (err.code === 'email_not_verified') setNaoVerificado(true)
      else if (err.code === 'invalid_credentials') setAviso({ tipo: 'erro', texto: t('auth.login.invalid') })
      else setAviso({ tipo: 'erro', texto: mensagemDeAuth(t, err) })
      setCarregando(null)
    }
  }

  const reenviar = async () => {
    try {
      await reenviarVerificacao(campos.email.trim())
      setNaoVerificado(false)
      setAviso({ tipo: 'ok', texto: t('auth.login.resent') })
    } catch (err) {
      setAviso({ tipo: 'erro', texto: mensagemDeAuth(t, err) })
    }
  }

  const entrarNaDemonstracao = async () => {
    setAviso(null)
    setCarregando('demo')
    try {
      seguir(await devLogin())
    } catch (err) {
      setAviso({ tipo: 'erro', texto: mensagemDeAuth(t, err) })
      setCarregando(null)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className={cn(
          'font-display text-3xl font-semibold tracking-[-0.02em]',
          'bg-gradient-to-b from-white from-[22.5%] to-white/70 bg-clip-text text-transparent'
        )}>
          {t('auth.login.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          variant="vidro"
          id={idDoCampo('email')}
          label={t('auth.login.email')}
          type="email"
          inputMode="email"
          placeholder={t('auth.login.emailPlaceholder')}
          leftIcon={Mail}
          value={campos.email}
          onChange={(e) => set('email', e.target.value)}
          onBlur={() => sair('email')}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={LIMITES.email}
          error={erros.email}
        />
        <div>
          <PasswordInput
            variant="vidro"
            id={idDoCampo('senha')}
            label={t('auth.login.password')}
            value={campos.senha}
            onChange={(e) => set('senha', e.target.value)}
            onBlur={() => sair('senha')}
            autoComplete="current-password"
            error={erros.senha}
          />
          <div className="mt-2 flex justify-end">
            <Link to="/recuperar-senha" className="text-xs font-semibold text-landing-violet transition-opacity hover:opacity-80">
              {t('auth.login.forgot')}
            </Link>
          </div>
        </div>

        {aviso && <AvisoDeEntrada tipo={aviso.tipo}>{aviso.texto}</AvisoDeEntrada>}
        {naoVerificado && (
          <AvisoDeEntrada tipo="erro" className="flex items-center justify-between gap-3">
            <span>{t('auth.login.notVerified')}</span>
            <button type="button" onClick={reenviar} className="shrink-0 font-semibold underline">
              {t('auth.login.resend')}
            </button>
          </AvisoDeEntrada>
        )}

        <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={carregando === 'senha'}>
          {t('auth.login.submit')}
        </Button>
      </form>

      {opcoes.google && (
        <>
          <Divisor>{t('auth.login.or')}</Divisor>
          <Button type="button" variant="vidro" fullWidth size="lg"
                  onClick={() => { window.location.href = googleLoginUrl() }}>
            {t('auth.login.google')}
          </Button>
        </>
      )}

      {opcoes.dev_login && (
        <button
          type="button"
          onClick={entrarNaDemonstracao}
          disabled={carregando !== null}
          className="mt-4 w-full text-center text-xs text-landing-muted underline-offset-4 hover:underline disabled:opacity-50"
        >
          {t('auth.login.demo')}
        </button>
      )}

      <p className="mt-6 text-center text-sm text-landing-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/cadastro" className="font-semibold text-landing-violet transition-opacity hover:opacity-80">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  )
}
