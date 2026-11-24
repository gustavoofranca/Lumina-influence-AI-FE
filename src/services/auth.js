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

/** Conta criada com senha só é ativada junto com ela; convite confirma só com o token. */
export async function verificarEmail(token, senha) {
  const corpo = senha === undefined ? { token } : { token, password: senha }
  const res = await api.post('/auth/verify-email', corpo, { auth: false })
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

/**
 * Troca a senha. Devolve um par novo: as outras sessões deixam de valer.
 * Com 2FA ativo, a API exige o código do app (`codigo`).
 */
export async function trocarSenha(atual, nova, codigo) {
  const corpo = { current_password: atual, new_password: nova }
  if (codigo) corpo.totp_code = codigo
  const res = await api.post('/auth/change-password', corpo)
  return res.data
}

// ---------------------------------------------------------------- 2FA
// Quando falta o segundo fator, o login devolve `{ mfa, mfa_ticket }` no lugar
// da sessão. As chamadas com ticket vão sem o Bearer: ainda não há sessão.

/** Troca o ticket de desafio pela sessão, com o código do app ou de recuperação. */
export async function verificarDoisFatores(ticket, codigo) {
  const res = await api.post('/auth/2fa/verify', { mfa_ticket: ticket, code: codigo }, { auth: false })
  return res.data
}

/** Começa a ativação: `{ secret, otpauth_uri, qr_svg }`. Sem ticket, vale a sessão. */
export async function iniciarDoisFatores(ticket) {
  const res = ticket
    ? await api.post('/auth/2fa/setup', { mfa_ticket: ticket }, { auth: false })
    : await api.post('/auth/2fa/setup', {})
  return res.data
}

/** Confirma com o primeiro código: devolve `recovery_codes` e uma sessão nova. */
export async function confirmarDoisFatores(codigo, ticket) {
  const res = ticket
    ? await api.post('/auth/2fa/setup/confirm', { code: codigo, mfa_ticket: ticket }, { auth: false })
    : await api.post('/auth/2fa/setup/confirm', { code: codigo })
  return res.data
}

export async function novosCodigosDeRecuperacao(codigo) {
  const res = await api.post('/auth/2fa/recovery-codes', { code: codigo })
  return res.data
}

/** Desliga o 2FA (membro e visualizador). Conta com senha manda a senha junto. */
export async function desligarDoisFatores(codigo, senha) {
  const corpo = { code: codigo }
  if (senha) corpo.password = senha
  await api.post('/auth/2fa/disable', corpo)
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
