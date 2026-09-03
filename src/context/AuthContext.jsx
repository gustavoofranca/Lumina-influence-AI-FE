import { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { api, getAccessToken, setTokens, limparTokens, setOnUnauthorized } from '../lib/api.js'
import { devLogin as devLoginApi, getMe } from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [agency, setAgency]   = useState(null)
  const [loading, setLoading] = useState(true)   // true até resolver o token inicial

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

  // Login de dev (sem OAuth)
  const devLogin = useCallback(async (email) => {
    const data = await devLoginApi(email)
    setTokens(data.tokens)
    setUser(data.user)
    setAgency(data.agency)
    return data
  }, [])

  // Captura tokens vindos do callback OAuth (#access_token=...&refresh_token=...)
  const loginWithTokens = useCallback(async (accessToken, refreshToken) => {
    await applyTokens({ access_token: accessToken, refresh_token: refreshToken })
  }, [applyTokens])

  /** Recarrega /me — usado após editar o próprio perfil. */
  const refreshUser = useCallback(async () => {
    const me = await getMe()
    setUser(me.user)
    setAgency(me.agency)
    return me
  }, [])

  const logout = useCallback(() => {
    // Logout stateless (ADR-001): cliente descarta os tokens.
    api.post('/auth/logout').catch(() => {})
    clearSession()
  }, [clearSession])

  // Restaura a sessão da aba: o token sobrevive ao F5 em sessionStorage
  // (ADR-001 revisada). Token inválido ou expirado cai fora silenciosamente —
  // é o mesmo efeito de nunca ter havido sessão.
  useEffect(() => {
    let cancelado = false
    const guardado = getAccessToken()
    if (!guardado) { setLoading(false); return }

    getMe()
      .then((me) => {
        if (cancelado) return
        setUser(me.user)
        setAgency(me.agency)
      })
      .catch(() => { if (!cancelado) clearSession() })
      .finally(() => { if (!cancelado) setLoading(false) })

    return () => { cancelado = true }
  }, [clearSession])

  const value = {
    user, agency, loading,
    isAuthenticated: !!user,
    devLogin, loginWithTokens, logout, refreshUser,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
