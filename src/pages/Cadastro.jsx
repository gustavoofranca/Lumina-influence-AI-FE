import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Building2, Mail, User } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Input from '../components/ui/Input.jsx'
import PasswordInput from '../components/ui/PasswordInput.jsx'
import CnpjInput from '../components/ui/CnpjInput.jsx'
import Button from '../components/ui/Button.jsx'
import Divisor from '../components/auth/Divisor.jsx'
import ForcaDaSenha from '../components/auth/ForcaDaSenha.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { useOpcoesDeLogin } from '../hooks/useOpcoesDeLogin.js'
import { cadastrar, googleLoginUrl } from '../services/auth.js'
import { cn } from '../lib/cn.js'
import { sugerirEmail } from '../lib/email.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import {
  LIMITES, errosDaApi, juntarEspacos, validarCnpj, validarEmail, validarNomeEmpresa,
  validarNomePessoa, validarSenha,
} from '../lib/limites.js'

const INICIAL = { nome: '', email: '', senha: '', cnpj: '', agencia: '', termos: false }

const VALIDADORES = {
  nome: (t, c) => validarNomePessoa(t, c.nome),
  email: (t, c) => validarEmail(t, c.email),
  senha: (t, c) => validarSenha(t, c.senha, { email: c.email, nome: c.nome }),
  cnpj: (t, c) => validarCnpj(t, c.cnpj, null, { obrigatorio: true }),
  agencia: (t, c) => validarNomeEmpresa(t, c.agencia),
  termos: (t, c) => (c.termos ? null : t('common.validation.termsRequired')),
}

// Nome do campo na API → nome do campo nesta tela.
const CAMPOS_DA_API = {
  name: 'nome', email: 'email', password: 'senha', cnpj: 'cnpj', agency_name: 'agencia', accept_terms: 'termos',
}

const LINK = 'font-semibold text-landing-violet underline-offset-2 hover:underline'

/**
 * Cadastro por e-mail e senha (ou Google). Uma página, dois blocos: a pessoa e
 * a agência. O CNPJ vem antes do nome da agência para que a consulta à Receita
 * possa sugerir a razão social.
 *
 * A API responde igual para e-mail novo ou já cadastrado — o que aconteceu, a
 * pessoa descobre pelo e-mail. Por isso o sucesso aqui é sempre "confirme seu
 * e-mail".
 */
export default function Cadastro() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const opcoes = useOpcoesDeLogin()
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos(INICIAL, VALIDADORES)
  const [daReceita, setDaReceita] = useState(null)
  const [cnpjBloqueado, setCnpjBloqueado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const sugestao = sugerirEmail(campos.email)

  const aoConsultarCnpj = (resultado) => {
    setCnpjBloqueado(Boolean(resultado.impeditiva))
    // Só preenche o nome se ele está vazio ou ainda é o que a Receita pôs antes:
    // nunca por cima do que a pessoa digitou.
    if (resultado.razao_social && (!campos.agencia || campos.agencia === daReceita)) {
      set('agencia', resultado.razao_social)
      setDaReceita(resultado.razao_social)
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    if (cnpjBloqueado) {
      document.getElementById(idDoCampo('cnpj'))?.focus()
      return
    }
    setEnviando(true)
    const email = campos.email.trim()
    try {
      await cadastrar({
        name: juntarEspacos(campos.nome),
        email,
        password: campos.senha,
        agency_name: juntarEspacos(campos.agencia),
        cnpj: campos.cnpj,
        accept_terms: campos.termos,
      })
      navigate('/verifique-seu-email', { state: { email } })
    } catch (err) {
      const porCampo = errosDaApi(err, CAMPOS_DA_API)
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
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
          {t('auth.cadastro.title')}
        </h1>
        <p className="mt-2 text-sm text-landing-muted">{t('auth.cadastro.subtitle')}</p>
      </div>

      {opcoes.google && (
        <>
          <Button type="button" variant="vidro" fullWidth size="lg"
                  onClick={() => { window.location.href = googleLoginUrl() }}>
            {t('auth.cadastro.google')}
          </Button>
          <Divisor>{t('auth.cadastro.orEmail')}</Divisor>
        </>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="mb-3 text-label !text-landing-muted">{t('auth.cadastro.you')}</legend>
          <Input
            variant="vidro"
            id={idDoCampo('nome')}
            label={t('auth.cadastro.name')}
            placeholder={t('auth.cadastro.namePh')}
            leftIcon={User}
            autoComplete="name"
            maxLength={LIMITES.nomePessoa}
            value={campos.nome}
            onChange={(e) => set('nome', e.target.value)}
            onBlur={() => sair('nome')}
            error={erros.nome}
          />
          <Input
            variant="vidro"
            id={idDoCampo('email')}
            label={t('auth.cadastro.email')}
            placeholder={t('auth.login.emailPlaceholder')}
            type="email"
            inputMode="email"
            leftIcon={Mail}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={LIMITES.email}
            value={campos.email}
            onChange={(e) => set('email', e.target.value)}
            onBlur={() => sair('email')}
            error={erros.email}
            helperText={sugestao ? (
              <span>
                {t('common.validation.emailSuggestion', { sugestao })}{' '}
                <button type="button" className="font-semibold underline" onClick={() => set('email', sugestao)}>
                  {t('common.validation.emailUseSuggestion')}
                </button>
              </span>
            ) : undefined}
          />
          <div>
            <PasswordInput
              variant="vidro"
              id={idDoCampo('senha')}
              label={t('auth.cadastro.password')}
              autoComplete="new-password"
              value={campos.senha}
              onChange={(e) => set('senha', e.target.value)}
              onBlur={() => sair('senha')}
              error={erros.senha}
            />
            <ForcaDaSenha senha={campos.senha} entradas={[campos.email, campos.nome]} variant="vidro" />
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-3 text-label !text-landing-muted">{t('auth.cadastro.agency')}</legend>
          <CnpjInput
            variant="vidro"
            id={idDoCampo('cnpj')}
            label={t('auth.cadastro.cnpj')}
            value={campos.cnpj}
            onChange={(valor) => { set('cnpj', valor); setCnpjBloqueado(false) }}
            onBlur={() => sair('cnpj')}
            onConsulta={aoConsultarCnpj}
            error={erros.cnpj}
          />
          <Input
            variant="vidro"
            id={idDoCampo('agencia')}
            label={t('auth.cadastro.agencyName')}
            placeholder={t('auth.cadastro.agencyNamePh')}
            leftIcon={Building2}
            autoComplete="organization"
            maxLength={LIMITES.nomeAgencia}
            value={campos.agencia}
            onChange={(e) => set('agencia', e.target.value)}
            onBlur={() => sair('agencia')}
            error={erros.agencia}
            helperText={daReceita && campos.agencia === daReceita ? t('auth.cadastro.prefilled') : undefined}
          />
        </fieldset>

        <div>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-landing-muted">
            <input
              id={idDoCampo('termos')}
              type="checkbox"
              checked={campos.termos}
              onChange={(e) => set('termos', e.target.checked)}
              onBlur={() => sair('termos')}
              aria-invalid={!!erros.termos}
              aria-describedby={erros.termos ? 'erro-termos' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 accent-violet-500"
            />
            <span>
              <Trans
                i18nKey="auth.cadastro.terms"
                components={{
                  termos: <Link to="/termos" target="_blank" rel="noopener noreferrer" className={LINK} />,
                  privacidade: <Link to="/privacidade" target="_blank" rel="noopener noreferrer" className={LINK} />,
                }}
              />
            </span>
          </label>
          {erros.termos && (
            <p id="erro-termos" className="mt-1.5 text-xs font-medium text-tint-rose">{erros.termos}</p>
          )}
        </div>

        {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}

        <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={enviando}>
          {t('auth.cadastro.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-landing-muted">
        {t('auth.cadastro.hasAccount')}{' '}
        <Link to="/login" className="font-semibold text-landing-violet transition-opacity hover:opacity-80">
          {t('auth.cadastro.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
