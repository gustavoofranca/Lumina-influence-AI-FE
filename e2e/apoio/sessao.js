/**
 * Apoio de sessão para os testes que não estão testando o login em si.
 *
 * Entra pelo atalho `POST /auth/dev-login` — o mesmo que a tela de login usa em
 * desenvolvimento. Desde a terceira revisão da ADR-001, a sessão é o cookie
 * httpOnly do refresh, que a própria API grava.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

export async function entrarComoAdmin(page) {
  const resposta = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  if (!resposta.ok()) {
    throw new Error(
      `dev-login respondeu ${resposta.status()}. A stack está de pé e o seed aplicado?`
    )
  }
  const { data } = await resposta.json()
  // Nada a injetar na página: `page.request` divide o armazenamento de cookies
  // com o contexto do navegador, e o dev-login respondeu com o cookie httpOnly
  // do refresh. Na carga, o app troca esse cookie por um access token — o
  // mesmo caminho de quem abre o sistema numa aba nova.
  return data.user
}

/** Coletor de erro de console e de exceção não tratada, por página. */
export function coletarErros(page) {
  const erros = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') erros.push(`console: ${msg.text().slice(0, 200)}`)
  })
  page.on('pageerror', (err) => erros.push(`exceção: ${String(err.message).slice(0, 200)}`))
  return erros
}
