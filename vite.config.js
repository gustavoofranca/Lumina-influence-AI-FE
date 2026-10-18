import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Content-Security-Policy do build de produção.
 *
 * O token de sessão mora em sessionStorage (ADR-001): um script injetado o
 * leria. A CSP é a barreira contra isso — só roda script servido pela própria
 * origem.
 *
 * Vai como <meta> porque o projeto ainda não tem servidor de produção definido.
 * `frame-ancestors` não funciona em <meta>; a proteção contra ser embutido em
 * frame precisa de cabeçalho no servidor que hospedar o build (README).
 *
 * Só no build: o servidor de desenvolvimento do Vite injeta script inline para
 * o recarregamento a quente, e a política o bloquearia.
 */
function politica(origemDaApi) {
  return [
    "default-src 'self'",
    "script-src 'self'",
    // `unsafe-inline` só em estilo: bibliotecas de gráfico e animação gravam
    // atributo `style`. Estilo injetado não lê sessionStorage.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // Foto de perfil e miniatura vêm das CDNs das plataformas, que mudam de host.
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    // Sem origem extra quando a API é relativa: 'self' já cobre a chamada.
    ['connect-src', "'self'", origemDaApi].filter(Boolean).join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function cspNoBuild(origemDaApi) {
  return {
    name: 'lumina-csp',
    apply: 'build',
    transformIndexHtml: (html) => html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${politica(origemDaApi)}" />`
    ),
  }
}

/**
 * Origem que a CSP precisa liberar para `connect-src`, a partir de
 * VITE_API_BASE_URL. Retorna null quando a API é relativa à própria origem
 * (ex.: `/api/v1` atrás de proxy reverso), porque 'self' já a cobre.
 *
 * Um `new URL(...)` direto aqui derrubaria `dev`, `build` e `preview` com um
 * "Invalid URL" que não diz qual variável falhou, e o app aceita base relativa
 * (src/lib/api.js). Por isso o valor é validado com mensagem própria.
 */
function origemDaApiDoEnv(valor) {
  if (valor.startsWith('/') && !valor.startsWith('//')) return null
  // `//host/...` é relativo ao esquema, mas aponta para outro host: recusa
  // em vez de liberar uma origem que a leitura do valor não deixa clara.
  let origem = 'null'
  try {
    origem = new URL(valor).origin
  } catch {
    // cai na recusa abaixo
  }
  // `localhost:5000` faz parse sem erro e dá origem "null": também é inválido.
  if (origem === 'null' || valor.startsWith('//')) {
    throw new Error(`VITE_API_BASE_URL inválida para a CSP: ${valor}`)
  }
  return origem
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origemDaApi = origemDaApiDoEnv(env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')
  return {
    plugins: [react(), cspNoBuild(origemDaApi)],
    server: {
      port: 5173,
      open: false,
    },
  }
})
