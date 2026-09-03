/**
 * Apoio de sessão para os testes que não estão testando o login em si.
 *
 * Entra pelo atalho `POST /auth/dev-login` — o mesmo que a tela de login usa em
 * desenvolvimento — e grava o par onde o app o procura. A ADR-001 mantém os
 * tokens em sessionStorage, então é lá que eles vão; escrever em localStorage
 * seria testar um contrato que não existe.
 *
 * O refresh token vai junto de propósito: o app passou a guardá-lo, e uma
 * sessão de teste sem ele não seria a sessão que o produto cria — o 401 depois
 * da hora se comportaria aqui de um jeito e lá de outro.
 */
const CHAVE_TOKEN = 'lumina.access_token'
const CHAVE_REFRESH = 'lumina.refresh_token'
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

export async function entrarComoAdmin(page) {
  const resposta = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  if (!resposta.ok()) {
    throw new Error(
      `dev-login respondeu ${resposta.status()}. A stack está de pé e o seed aplicado?`
    )
  }
  const { data } = await resposta.json()

  // O token precisa existir antes do primeiro script da página: o ProtectedRoute
  // decide o redirect no primeiro render.
  await page.addInitScript(
    ([chaveToken, token, chaveRefresh, refresh]) => {
      window.sessionStorage.setItem(chaveToken, token)
      if (refresh) window.sessionStorage.setItem(chaveRefresh, refresh)
    },
    [CHAVE_TOKEN, data.tokens.access_token, CHAVE_REFRESH, data.tokens.refresh_token]
  )
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
