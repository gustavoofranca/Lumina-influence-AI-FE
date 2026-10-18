/** Serviço de autenticação contra a API real. */
import { api } from '../lib/api.js'
import { cnpjCru } from '../lib/limites.js'

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

/** Login por e-mail e senha. */
export async function loginComSenha(email, password) {
  const res = await api.post('/auth/login', { email, password }, { auth: false })
  return res.data
}

/** Cadastro. Responde 202 igual para e-mail novo ou já cadastrado — quem sabe o resultado é o e-mail. */
export async function cadastrar(dados) {
  const res = await api.post('/auth/register', dados, { auth: false })
  return res.data
}

export async function verificarEmail(token) {
  const res = await api.post('/auth/verify-email', { token }, { auth: false })
  return res.data
}

export async function reenviarVerificacao(email) {
  const res = await api.post('/auth/resend-verification', { email }, { auth: false })
  return res.data
}

export async function esqueciSenha(email) {
  const res = await api.post('/auth/forgot-password', { email }, { auth: false })
  return res.data
}

export async function redefinirSenha(token, password) {
  await api.post('/auth/reset-password', { token, password }, { auth: false })
}

/** Troca a senha. Devolve um par novo: as outras sessões deixam de valer. */
export async function trocarSenha(atual, nova) {
  const res = await api.post('/auth/change-password', { current_password: atual, new_password: nova })
  return res.data
}

export async function aceitarTermos() {
  await api.post('/auth/accept-terms')
}

/** Situação do CNPJ na Receita (via API). Vai sem máscara: a barra quebraria o caminho. */
export async function consultarCnpj(cnpj) {
  const res = await api.get(`/auth/cnpj/${encodeURIComponent(cnpjCru(cnpj))}`, { auth: false })
  return res.data
}

/** Formas de login deste ambiente: `{ dev_login, google }`. */
export async function opcoesDeLogin() {
  const res = await api.get('/auth/options', { auth: false })
  return res.data
}
