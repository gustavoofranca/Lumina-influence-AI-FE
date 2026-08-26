/**
 * Cliente HTTP encapsulado para a API do back-end Lumina.
 *
 * - Injeta o Authorization: Bearer <token> (token mantido em memória).
 * - Desembrulha o envelope { data, meta } / { error }.
 * - Em 401, dispara um callback de "sessão expirada" (logout).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

// ADR-001 (revisada em 26/08/2026): o access token vive em sessionStorage, nunca
// em localStorage. sessionStorage morre junto com a aba, que e a propriedade que
// a decisao precisa — so em memoria, qualquer F5 derrubava a sessao.
const CHAVE_TOKEN = 'lumina.access_token'

function lerTokenGuardado() {
  try {
    return sessionStorage.getItem(CHAVE_TOKEN)
  } catch {
    // Navegador com armazenamento bloqueado: a sessao passa a valer so em memoria.
    return null
  }
}

let _accessToken = lerTokenGuardado()
let _onUnauthorized = null

export function setAccessToken(token) {
  _accessToken = token || null
  try {
    if (_accessToken) sessionStorage.setItem(CHAVE_TOKEN, _accessToken)
    else sessionStorage.removeItem(CHAVE_TOKEN)
  } catch {
    // Sem armazenamento, segue valendo o valor em memoria.
  }
}

export function getAccessToken() {
  return _accessToken
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

async function request(method, path, { body, params, auth = true, raw = false } = {}) {
  const url = new URL(BASE_URL + path)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
    })
  }

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && _accessToken) headers['Authorization'] = `Bearer ${_accessToken}`

  let resp
  try {
    resp = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkErr) {
    throw new ApiError('Falha de conexão com a API. O back-end está rodando?', {
      status: 0,
      code: 'network_error',
    })
  }

  if (resp.status === 204) return null
  if (raw) return resp

  let payload = null
  const text = await resp.text()
  if (text) {
    try { payload = JSON.parse(text) } catch { payload = null }
  }

  if (!resp.ok) {
    if (resp.status === 401 && _onUnauthorized) _onUnauthorized()
    const err = payload?.error || {}
    throw new ApiError(err.message || `Erro ${resp.status}`, {
      status: resp.status,
      code: err.code,
      details: err.details,
    })
  }

  return payload
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  raw: (path, opts) => request('GET', path, { ...opts, raw: true }),
  baseUrl: BASE_URL,
}
