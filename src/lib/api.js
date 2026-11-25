/**
 * Cliente HTTP encapsulado para a API do back-end Lumina.
 *
 * - Injeta o Authorization: Bearer <token> (token mantido em memória).
 * - Desembrulha o envelope { data, meta } / { error }.
 * - Em 401, dispara um callback de "sessão expirada" (logout).
 */

import { limparCacheDaApi } from './cacheDaApi.js'
import { mascarar } from './mascara.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// ADR-001 (terceira revisao, 25/11/2026): o refresh token vive num cookie
// httpOnly que o JavaScript nao le, gravado pela propria API. O access token
// fica so em memoria — F5, aba nova ou navegador reaberto pedem outro ao
// `/auth/refresh`, que le o cookie. E o que deixa a sessao sobreviver a aba sem
// pôr credencial de 30 dias onde um XSS alcançaria.
const CABECALHO_CSRF = { 'X-Lumina-Csrf': '1' }

// Versoes anteriores guardavam o par no sessionStorage. Sai na carga, para nao
// sobrar refresh token legivel de uma sessao antiga.
try {
  sessionStorage.removeItem('lumina.access_token')
  sessionStorage.removeItem('lumina.refresh_token')
} catch {
  // Armazenamento bloqueado: nada a apagar.
}

let _accessToken = null
let _onUnauthorized = null
let _renovacaoEmCurso = null

export function setAccessToken(token) {
  _accessToken = token || null
}

/** Guarda o access token que a API devolve no login e na renovacao. */
export function setTokens(tokens) {
  setAccessToken(tokens?.access_token || null)
}

export function getAccessToken() {
  return _accessToken
}

/**
 * Pede um access token novo ao `/auth/refresh`.
 *
 * Sem argumento, vale o cookie httpOnly (com o cabecalho anti-CSRF que a API
 * exige). Com `refreshBearer`, manda aquele refresh no `Authorization`: e o caso
 * do retorno do Google e da Microsoft, que trazem o par no fragmento da URL —
 * a resposta grava o cookie, e dali em diante e ele que vale.
 *
 * Chamada com `fetch` direto, e nao pelo `request`: passar por ele criaria a
 * chance de um 401 na renovacao disparar outra renovacao. Uma renovacao por
 * vez: quatro requisicoes que expiram juntas — o que a tela do criador faz —
 * pediriam quatro.
 */
async function pedirRenovacao(headers) {
  try {
    const resp = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers,
    })
    // 204: a API não achou cookie nem Bearer — visita sem sessão.
    if (!resp.ok || resp.status === 204) return false
    const payload = await resp.json()
    const tokens = payload?.data?.tokens
    if (!tokens?.access_token) return false
    setTokens(tokens)
    return true
  } catch {
    // Rede fora no meio da renovacao nao e sessao invalida: nao derruba.
    return false
  }
}

export async function renovarSessao({ refreshBearer } = {}) {
  // O refresh do fragmento e uma sessao nova: nao pega carona numa renovacao
  // pelo cookie que estiver em curso, que pode ser de outra pessoa.
  if (refreshBearer) return pedirRenovacao({ Authorization: `Bearer ${refreshBearer}` })
  if (!_renovacaoEmCurso) {
    _renovacaoEmCurso = pedirRenovacao(CABECALHO_CSRF)
    _renovacaoEmCurso.finally(() => { _renovacaoEmCurso = null })
  }
  return _renovacaoEmCurso
}

/**
 * Descarta o access token — usado no logout e quando a renovacao falha. O
 * cookie quem apaga e a API, no `POST /auth/logout`.
 *
 * Leva junto a memoria de respostas: e o ponto por onde toda sessao termina, e
 * a proxima pode ser de outra pessoa, de outra agencia.
 */
export function limparTokens() {
  setAccessToken(null)
  limparCacheDaApi()
}

export function setOnUnauthorized(fn) {
  _onUnauthorized = fn
}

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request(method, path, { body, params, auth = true, raw = false, jaRenovou = false } = {}) {
  const url = new URL(BASE_URL + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  // FormData e o caso do upload de video, o unico envio de arquivo do produto.
  // O Content-Type dele precisa carregar o `boundary` que separa as partes, e
  // quem sabe o boundary e o proprio navegador: declarar 'multipart/form-data'
  // na mao produz um cabecalho sem boundary, e o servidor nao consegue separar
  // os campos. Por isso aqui a regra e nao tocar no cabecalho.
  const ehFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const headers = {}
  if (body !== undefined && !ehFormData) headers['Content-Type'] = 'application/json'
  if (auth && _accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  let resp
  try {
    resp = await fetch(url.toString(), {
      method,
      headers,
      // Sem isto o navegador descarta o Set-Cookie das respostas de login (a
      // API e outra origem). O cookie tem Path=/api/v1/auth: as demais rotas
      // nao o recebem.
      credentials: 'include',
      body: body === undefined ? undefined : ehFormData ? body : JSON.stringify(body),
    })
  } catch (networkErr) {
    throw new ApiError('Falha de conexão com a API. O back-end está rodando?', {
      status: 0,
      code: 'network_error',
    })
  }

  // Escrita que deu certo apaga a memoria de respostas inteira: qualquer
  // leitura guardada pode ter ficado velha. Antes do `return` do 204, que e o
  // que o DELETE devolve.
  if (resp.ok && method !== 'GET') limparCacheDaApi()

  if (resp.status === 204) return null
  if (raw) return resp

  let payload = null
  const text = await resp.text()
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = null }
  }

  if (!resp.ok) {
    // 401 nao e o fim da sessao: o access token vale 1 hora e o refresh vale
    // 30 dias. Antes disto, a primeira requisicao depois da hora derrubava o
    // usuario na tela de login no meio do que ele estava fazendo, sem aviso.
    // Uma tentativa so — `jaRenovou` impede o laco quando o token novo tambem
    // e recusado.
    if (resp.status === 401 && auth && !jaRenovou) {
      if (await renovarSessao()) {
        return request(method, path, { body, params, auth, raw, jaRenovou: true })
      }
      limparTokens()
    }
    // Só chamada autenticada derruba a sessão: um 401 de /auth/login é senha errada.
    if (resp.status === 401 && auth && _onUnauthorized) _onUnauthorized()
    const err = payload?.error || {}
    throw new ApiError(err.message || `Erro ${resp.status}`, {
      status: resp.status,
      code: err.code,
      details: err.details,
    })
  }

  return mascarar(payload)
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put:   (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  raw: (path, opts) => request('GET', path, { ...opts, raw: true }),
  baseUrl: BASE_URL,
}
