/** Serviço de autenticação contra a API real. */
import { api } from '../lib/api.js'

/** Login de desenvolvimento (sem OAuth) — emite JWT pra um usuário seedado. */
export async function devLogin(email) {
  const res = await api.post('/auth/dev-login', email ? { email } : {}, { auth: false })
  return res.data // { user, agency, tokens }
}

/** URL pra iniciar o fluxo OAuth Google (redireciona o browser pra cá). */
export function googleLoginUrl() {
  return `${api.baseUrl}/auth/google/login`
}

/** Retorna o usuário logado a partir do token atual. */
export async function getMe() {
  const res = await api.get('/auth/me')
  return res.data // { user, agency }
}

export async function refresh(refreshToken) {
  const res = await api.post('/auth/refresh', undefined, { auth: false })
  return res.data
}
