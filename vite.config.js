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
    `connect-src 'self' ${origemDaApi}`,
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const origemDaApi = new URL(env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').origin
  return {
    plugins: [react(), cspNoBuild(origemDaApi)],
    server: {
      port: 5173,
      open: false,
    },
  }
})
