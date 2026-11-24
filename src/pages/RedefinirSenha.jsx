import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import ForcaDaSenha from '../components/auth/ForcaDaSenha.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { redefinirSenha } from '../services/auth.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import { errosDaApi, validarSenha } from '../lib/limites.js'

/**
 * Destino do link de redefinição. O token sai da barra de endereço logo ao
 * abrir e fica só na memória da página. Esta tela não conhece o e-mail nem o
 * nome do dono — a regra de não usá-los na senha é conferida pela API, que
 * responde no campo.
 */
export default function RedefinirSenha() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token'))
  const [falhaDoLink, setFalhaDoLink] = useState(() => (token ? null : 'missing'))
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos(
    { senha: '' },
    { senha: (tt, c) => validarSenha(tt, c.senha) }
  )

  useEffect(() => {
    window.history.replaceState(null, '', '/redefinir-senha')
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    setEnviando(true)
    try {
      await redefinirSenha(token, campos.senha)
      navigate('/login', { replace: true, state: { senhaAlterada: true } })
    } catch (err) {
      if (err.code === 'reset_token_expired') setFalhaDoLink('expired')
      else if (err.code === 'reset_token_invalid') setFalhaDoLink('invalid')
      else {
        const porCampo = errosDaApi(err, { password: 'senha' })
        if (Object.keys(porCampo).length) mostrarErros(porCampo)
        else setAviso(mensagemDeAuth(t, err))
      }
      setEnviando(false)
    }
  }

  if (falhaDoLink) {
    return (
      <AuthLayout>
        <h1 className="mb-4 text-center font-display text-2xl font-semibold text-white">{t('auth.redefinir.title')}</h1>
        <AvisoDeEntrada tipo="erro">{t(`auth.redefinir.${falhaDoLink}`)}</AvisoDeEntrada>
        <p className="mt-6 text-center text-sm">
          <Link to="/recuperar-senha" className="font-semibold text-landing-violet hover:opacity-80">
            {t('auth.redefinir.again')}
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">{t('auth.redefinir.title')}</h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.redefinir.subtitle')}</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <PasswordInput
            variant="vidro"
            id={idDoCampo('senha')}
            label={t('auth.redefinir.password')}
            autoComplete="new-password"
            value={campos.senha}
            onChange={(e) => set('senha', e.target.value)}
            onBlur={() => sair('senha')}
            error={erros.senha}
          />
          <ForcaDaSenha senha={campos.senha} variant="vidro" />
        </div>
        {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}
        <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={enviando}>
          {t('auth.redefinir.submit')}
        </Button>
      </form>
    </AuthLayout>
  )
}
