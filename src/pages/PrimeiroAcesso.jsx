import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Building2 } from 'lucide-react'

import AuthLayout from '../layouts/AuthLayout.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import CnpjInput from '../components/ui/CnpjInput.jsx'
import AvisoDeEntrada from '../components/auth/AvisoDeEntrada.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { idDoCampo, useCampos } from '../hooks/useCampos.js'
import { aceitarTermos } from '../services/auth.js'
import { updateAgency } from '../services/agency.js'
import { mensagemDeAuth } from '../lib/errosDeAuth.js'
import { LIMITES, errosDaApi, juntarEspacos, validarCnpj, validarNomeEmpresa } from '../lib/limites.js'

// Nome provisório que a API dá à agência criada no login pelo Google
// (`DEFAULT_AGENCY_NAME` em auth_service). Não é um nome de verdade: o campo
// começa vazio.
const NOME_PROVISORIO = 'Minha Agência'

const LINK = 'font-semibold text-landing-violet underline-offset-2 hover:underline'

function validadores(precisaAceitar) {
  return {
    cnpj: (t, c) => validarCnpj(t, c.cnpj, null, { obrigatorio: true }),
    agencia: (t, c) => validarNomeEmpresa(t, c.agencia),
    ...(precisaAceitar
      ? { termos: (t, c) => (c.termos ? null : t('common.validation.termsRequired')) }
      : {}),
  }
}

/**
 * Completa o cadastro da agência: CNPJ (obrigatório) e nome, e o aceite dos
 * Termos para quem entrou pelo Google. Não há "definir depois" — o
 * `ProtectedRoute` traz de volta aqui o admin de agência sem CNPJ.
 */
export default function PrimeiroAcesso() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, agency, refreshUser, logout } = useAuth()
  const precisaAceitar = !user?.terms_accepted
  const { campos, erros, set, sair, validarTudo, mostrarErros } = useCampos(
    {
      cnpj: agency?.cnpj ?? '',
      agencia: agency?.name && agency.name !== NOME_PROVISORIO ? agency.name : '',
      termos: false,
    },
    validadores(precisaAceitar)
  )
  const [daReceita, setDaReceita] = useState(null)
  const [cnpjBloqueado, setCnpjBloqueado] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const aoConsultarCnpj = (resultado) => {
    setCnpjBloqueado(Boolean(resultado.impeditiva))
    if (resultado.razao_social && (!campos.agencia || campos.agencia === daReceita)) {
      set('agencia', resultado.razao_social)
      setDaReceita(resultado.razao_social)
    }
  }

  // Não há como pular esta tela; sair é a única saída para quem não quer (ou
  // não pode) informar o CNPJ agora.
  const aoSair = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setAviso(null)
    if (!validarTudo()) return
    if (cnpjBloqueado) {
      document.getElementById(idDoCampo('cnpj'))?.focus()
      return
    }
    setSalvando(true)
    try {
      await updateAgency(agency.id, { name: juntarEspacos(campos.agencia), cnpj: campos.cnpj })
      if (precisaAceitar) await aceitarTermos()
      await refreshUser()
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      const porCampo = errosDaApi(err, { name: 'agencia', cnpj: 'cnpj' })
      if (Object.keys(porCampo).length) mostrarErros(porCampo)
      else setAviso(mensagemDeAuth(t, err))
      setSalvando(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <h1 className="font-display text-2xl font-bold text-white">{t('primeiroAcesso.title')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-landing-muted">{t('primeiroAcesso.subtitle')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <CnpjInput
            variant="vidro"
            id={idDoCampo('cnpj')}
            label={t('auth.cadastro.cnpj')}
            value={campos.cnpj}
            onChange={(valor) => { set('cnpj', valor); setCnpjBloqueado(false) }}
            onBlur={() => sair('cnpj')}
            onConsulta={aoConsultarCnpj}
            error={erros.cnpj}
            autoFocus
          />
          <Input
            variant="vidro"
            id={idDoCampo('agencia')}
            label={t('primeiroAcesso.agencyName')}
            placeholder={t('primeiroAcesso.agencyNamePlaceholder')}
            leftIcon={Building2}
            autoComplete="organization"
            maxLength={LIMITES.nomeAgencia}
            value={campos.agencia}
            onChange={(e) => set('agencia', e.target.value)}
            onBlur={() => sair('agencia')}
            error={erros.agencia}
            helperText={daReceita && campos.agencia === daReceita ? t('auth.cadastro.prefilled') : undefined}
          />

          {precisaAceitar && (
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
          )}

          {aviso && <AvisoDeEntrada tipo="erro">{aviso}</AvisoDeEntrada>}

          <Button type="submit" variant="vidro-primaria" fullWidth size="lg" loading={salvando}>
            {t('primeiroAcesso.confirm')}
          </Button>
        </form>

        <button
          type="button"
          onClick={aoSair}
          className="mt-6 text-sm font-medium text-landing-muted transition-colors hover:text-white"
        >
          {t('primeiroAcesso.logout')}
        </button>
      </div>
    </AuthLayout>
  )
}
