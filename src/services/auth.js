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

/**
 * O que a exclusão da própria conta levaria junto.
 *
 * Consultado antes de pedir a confirmação: `scope: 'agency'` significa que o
 * usuário é o último administrador e que a agência inteira vai com ele. Avisar
 * isso depois do fato não é aviso, é notificação.
 */
export async function previewAccountDeletion() {
  const res = await api.get('/users/me/deletion-preview')
  return res.data
}

/**
 * Exclusão definitiva da própria conta (LGPD, art. 18, VI).
 *
 * Não é a mesma operação que remover um membro: aquela é feita por um admin e
 * é lógica. Esta apaga de verdade e, quando não resta outro administrador,
 * leva a agência junto — criadores, contas conectadas, publicações,
 * comentários, campanhas e relatórios. Não há como desfazer.
 */
export async function deleteOwnAccount() {
  const res = await api.delete('/users/me')
  return res.data
}
