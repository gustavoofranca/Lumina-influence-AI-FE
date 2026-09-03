import { test, expect } from '@playwright/test'

import { coletarErros, entrarComoAdmin } from './apoio/sessao.js'

/**
 * O access token vale 1 hora; o refresh vale 30 dias.
 *
 * Até 03/09/2026 o front nunca guardava o refresh token e nunca chamava
 * `POST /auth/refresh` — a função existia no serviço e ninguém a importava, e
 * do jeito que estava escrita não funcionaria: mandava `auth: false`, e o
 * `require_refresh` lê o token do cabeçalho `Authorization`.
 *
 * O efeito era o pior possível numa demonstração: passada a hora, a primeira
 * requisição derrubava a sessão e jogava o usuário no login no meio do que
 * estava fazendo, sem mensagem nenhuma.
 *
 * Estes testes simulam o token expirado com um 401 na primeira resposta, em vez
 * de esperar uma hora, e conferem os dois lados: renovar quando dá, e não
 * insistir quando não dá.
 */

const NEGADO = {
  status: 401,
  contentType: 'application/json',
  body: JSON.stringify({ error: { code: 'token_expired', message: 'Token expirado' } }),
}

test('o 401 depois da hora renova a sessão em vez de derrubar o usuário', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)

  let renovacoes = 0
  let cabecalhoDaRenovacao = null
  await page.route('**/api/v1/auth/refresh', async (rota) => {
    renovacoes += 1
    cabecalhoDaRenovacao = rota.request().headers()['authorization'] || ''
    // Segue para o back-end real: o valor do token é conferido de verdade.
    await rota.continue()
  })

  let jaNegou = false
  await page.route('**/api/v1/influencers?**', async (rota) => {
    if (!jaNegou) {
      jaNegou = true
      return rota.fulfill(NEGADO)
    }
    return rota.continue()
  })

  await page.goto('/app/influenciadores')

  // Não foi para o login, e a lista chegou depois da renovação.
  await expect(page).toHaveURL(/\/app\/influenciadores/)
  await expect(page.locator('main')).toContainText(/\w/)
  expect(jaNegou).toBe(true)
  expect(renovacoes).toBe(1)
  // O cabeçalho leva o refresh token, não o access token — é o que o
  // `require_refresh` exige, e era o erro da implementação anterior.
  expect(cabecalhoDaRenovacao).toMatch(/^Bearer .+/)
  // O 401 é provocado por este teste: o navegador registra o recurso recusado
  // no console e isso não é defeito. O que não pode aparecer é o resto — uma
  // exceção do React ao reprocessar a requisição repetida, por exemplo.
  const inesperados = erros.filter((e) => !/401|Unauthorized/i.test(e))
  expect(inesperados).toEqual([])
})

test('quando a renovação também falha, a sessão cai e vai para o login', async ({ page }) => {
  await entrarComoAdmin(page)

  let tentativas = 0
  await page.route('**/api/v1/auth/refresh', async (rota) => {
    tentativas += 1
    await rota.fulfill(NEGADO)
  })
  await page.route('**/api/v1/**', async (rota) => {
    if (rota.request().url().includes('/auth/refresh')) return rota.fallback()
    return rota.fulfill(NEGADO)
  })

  await page.goto('/app/influenciadores')

  await expect(page).toHaveURL(/\/login/)
  // Uma tentativa, não um laço: o token novo recusado não pede outro token.
  expect(tentativas).toBe(1)
})
