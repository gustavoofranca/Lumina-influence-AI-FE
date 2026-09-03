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
// O refresh token acompanha o access token na mesma gaveta, pela mesma razao:
// o que a ADR-001 comprou foi a sessao morrer junto com a aba. Guarda-lo em
// localStorage o faria sobreviver 30 dias no disco, que e exatamente o que a
// decisao recusou. Em memoria so, qualquer F5 derrubava a sessao de novo.
const CHAVE_REFRESH = 'lumina.refresh_token'

function lerGuardado(chave) {
  try {
    return sessionStorage.getItem(chave)
  } catch {
    // Navegador com armazenamento bloqueado: a sessao passa a valer so em memoria.
    return null
  }
}

function guardar(chave, valor) {
  try {
    if (valor) sessionStorage.setItem(chave, valor)
    else sessionStorage.removeItem(chave)
  } catch {
    // Sem armazenamento, segue valendo o valor em memoria.
  }
}

let _accessToken = lerGuardado(CHAVE_TOKEN)
let _refreshToken = lerGuardado(CHAVE_REFRESH)
let _onUnauthorized = null
let _renovacaoEmCurso = null

export function setAccessToken(token) {
  _accessToken = token || null
  guardar(CHAVE_TOKEN, _accessToken)
}

export function setRefreshToken(token) {
  _refreshToken = token || null
  guardar(CHAVE_REFRESH, _refreshToken)
}

/** Guarda o par que a API devolve no login e na renovacao. */
export function setTokens(tokens) {
  setAccessToken(tokens?.access_token || null)
  // A renovacao pode nao devolver refresh novo; nesse caso o atual continua.
  if (tokens?.refresh_token) setRefreshToken(tokens.refresh_token)
}

export function getAccessToken() {
  return _accessToken
}

export function getRefreshToken() {
  return _refreshToken
}

/**
 * Troca o refresh token por um par novo.
 *
 * Chamada com `fetch` direto, e nao pelo `request`: passar por ele criaria a
 * chance de um 401 na renovacao disparar outra renovacao. E o cabecalho aqui
 * leva o refresh token, nao o access token — `require_refresh`, no back-end,
 * le o token do `Authorization` e exige que o tipo seja `refresh`.
 *
 * Uma renovacao por vez: quatro requisicoes que expiram juntas — o que a tela
 * do criador faz — pediriam quatro renovacoes, e as tres ultimas usariam um
 * refresh token ja trocado.
 */
async function renovarSessao() {
  if (!_refreshToken) return false
  if (!_renovacaoEmCurso) {
    _renovacaoEmCurso = (async () => {
      try {
        const resp = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${_refreshToken}` },
        })
        if (!resp.ok) return false
        const payload = await resp.json()
        if (!payload?.data?.access_token) return false
        setTokens(payload.data)
        return true
      } catch {
        // Rede fora no meio da renovacao nao e sessao invalida: nao derruba.
        return false
      }
    })()
    _renovacaoEmCurso.finally(() => { _renovacaoEmCurso = null })
  }
  return _renovacaoEmCurso
}

/** Descarta o par inteiro — usado no logout e quando a renovacao falha. */
export function limparTokens() {
  setAccessToken(null)
  setRefreshToken(null)
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
  put:   (path, body, opts) => request('PUT', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
  raw: (path, opts) => request('GET', path, { ...opts, raw: true }),
  baseUrl: BASE_URL,
}
