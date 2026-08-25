import { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { api, setAccessToken, setOnUnauthorized } from '../lib/api.js'
import { devLogin as devLoginApi, getMe } from '../services/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [agency, setAgency]   = useState(null)
  const [loading, setLoading] = useState(true)   // true até resolver o token inicial

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setAgency(null)
  }, [])

  // 401 em qualquer request → derruba a sessão
  useEffect(() => {
    setOnUnauthorized(() => clearSession())
  }, [clearSession])

  // Aplica um par de tokens + carrega o /me
  const applyTokens = useCallback(async (tokens) => {
    setAccessToken(tokens.access_token)
    const me = await getMe()
    setUser(me.user)
    setAgency(me.agency)
    return me
  }, [])

  // Login de dev (sem OAuth)
  const devLogin = useCallback(async (email) => {
    const data = await devLoginApi(email)
    setAccessToken(data.tokens.access_token)
    setUser(data.user)
    setAgency(data.agency)
    return data
  }, [])

  // Captura tokens vindos do callback OAuth (#access_token=...&refresh_token=...)
  const loginWithTokens = useCallback(async (accessToken) => {
    await applyTokens({ access_token: accessToken })
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

  // Sem persistência (sem localStorage nesta fase) → começa deslogado.
  useEffect(() => { setLoading(false) }, [])

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
