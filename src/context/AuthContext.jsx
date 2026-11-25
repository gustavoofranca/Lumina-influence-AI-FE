import { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { api, renovarSessao, setTokens, limparTokens, setOnUnauthorized } from '../lib/api.js'
import { devLogin as devLoginApi, getMe } from '../services/auth.js'

const AuthContext = createContext(null)

// Logout numa aba avisa as outras: o access token de cada uma vive na memória
// dela e seguiria valendo por até 1 hora depois do cookie apagado.
const CANAL_DA_SESSAO = 'lumina.sessao'

/** Retorno do Google/Microsoft, com a sessão (ou o ticket de 2FA) no fragmento. */
function temSessaoNoFragmento() {
  return /[#&](access_token|mfa_ticket)=/.test(window.location.hash)
}

function abrirCanal() {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CANAL_DA_SESSAO)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [agency, setAgency]   = useState(null)
  // Lido na renderização, e não no efeito: o React roda os efeitos dos filhos
  // antes dos deste provider, e o AuthCallback apaga o fragmento no dele.
  const [vemDoRetornoOAuth] = useState(temSessaoNoFragmento)
  // true até resolver a sessão inicial. Na volta do Google não há o que
  // resolver aqui: quem aplica a sessão do fragmento é o AuthCallback.
  const [loading, setLoading] = useState(!vemDoRetornoOAuth)

  const clearSession = useCallback(() => {
    limparTokens()
    setUser(null)
    setAgency(null)
  }, [])

  // 401 em qualquer request → derruba a sessão
  useEffect(() => {
    setOnUnauthorized(() => clearSession())
  }, [clearSession])

  // Aplica um par de tokens + carrega o /me
  const applyTokens = useCallback(async (tokens) => {
    setTokens(tokens)
    const me = await getMe()
    setUser(me.user)
    setAgency(me.agency)
    return me
  }, [])

  // Aplica o pacote que a API devolve num login ({ user, agency, tokens }).
  const aplicarSessao = useCallback((dados) => {
    setTokens(dados.tokens)
    setUser(dados.user)
    setAgency(dados.agency)
    return dados
  }, [])

  // Login de dev (sem OAuth). Nunca pede 2FA: o atalho só existe em desenvolvimento.
  const devLogin = useCallback(async (email) => aplicarSessao(await devLoginApi(email)), [aplicarSessao])

  // Captura tokens vindos do callback OAuth (#access_token=...&refresh_token=...).
  // O refresh do fragmento é trocado no /auth/refresh pelo Bearer: é essa
  // resposta que grava o cookie httpOnly. Sem ele (back antigo), vale o access.
  const loginWithTokens = useCallback(async (accessToken, refreshToken) => {
    if (refreshToken && await renovarSessao({ refreshBearer: refreshToken })) {
      const me = await getMe()
      setUser(me.user)
      setAgency(me.agency)
      return me
    }
    return applyTokens({ access_token: accessToken })
  }, [applyTokens])

  /** Recarrega /me — usado após editar o próprio perfil. */
  const refreshUser = useCallback(async () => {
    const me = await getMe()
    setUser(me.user)
    setAgency(me.agency)
    return me
  }, [])

  const logout = useCallback(() => {
    // A API apaga o cookie do refresh; o access em memória sai aqui
    // (ADR-001, terceira revisão). `auth: false`: o access pode já ter vencido,
    // e o logout não pode depender dele.
    api.post('/auth/logout', undefined, { auth: false }).catch(() => {})
    clearSession()
    const canal = abrirCanal()
    canal?.postMessage({ tipo: 'logout' })
    canal?.close()
  }, [clearSession])

  // As outras abas ouvem o logout desta e descartam o access em memória.
  useEffect(() => {
    const canal = abrirCanal()
    if (!canal) return undefined
    canal.onmessage = (evento) => {
      if (evento.data?.tipo === 'logout') clearSession()
    }
    return () => canal.close()
  }, [clearSession])

  // Restaura a sessão na carga: o access token não sobrevive ao F5 (vive só em
  // memória), então pede um novo ao /auth/refresh, que lê o cookie httpOnly.
  // Sem cookie, ou com ele vencido ou revogado, segue deslogado em silêncio —
  // é o mesmo efeito de nunca ter havido sessão.
  useEffect(() => {
    let cancelado = false
    // O retorno do Google/Microsoft traz a sessão nova no fragmento, e quem a
    // aplica é o AuthCallback. Renovar pelo cookie aqui correria com ele, e o
    // cookie pode ser o de quem usou o navegador antes.
    if (vemDoRetornoOAuth) return () => { cancelado = true }
    renovarSessao()
      .then((renovou) => (renovou ? getMe() : null))
      .then((me) => {
        if (cancelado || !me) return
        setUser(me.user)
        setAgency(me.agency)
      })
      .catch(() => { if (!cancelado) clearSession() })
      .finally(() => { if (!cancelado) setLoading(false) })

    return () => { cancelado = true }
  }, [clearSession, vemDoRetornoOAuth])

  const value = {
    user, agency, loading,
    isAuthenticated: !!user,
    devLogin, loginWithTokens, logout, refreshUser,
    aplicarSessao,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

/** Admin de agência sem CNPJ completa o cadastro antes de qualquer outra tela (spec, seção 5). */
export function precisaCompletarCadastro(user, agency) {
  return user?.role === 'admin' && !!agency && !agency.cnpj
}

export function destinoAposLogin(user, agency) {
  return precisaCompletarCadastro(user, agency) ? '/primeiro-acesso' : '/app/dashboard'
}

/**
 * Tela do segundo fator que falta para uma resposta de login, ou `null` se ela
 * já traz a sessão. `challenge`: a conta tem 2FA; `setup`: administrador sem
 * 2FA, que precisa ativar antes de entrar.
 */
export function rotaDoSegundoFator(dados) {
  if (dados?.mfa === 'challenge') return '/entrar/verificacao'
  if (dados?.mfa === 'setup') return '/entrar/ativar-2fa'
  return null
}
