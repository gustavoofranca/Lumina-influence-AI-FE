import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Trava a correção de 28/08: falha de carregamento não pode sair como estado
 * vazio.
 *
 * Com a API fora do ar, a aba Histórico afirmava "nenhuma análise no histórico
 * deste criador" sobre um criador com sete, e a campanha aparecia sem
 * participante. O banner de erro passa a substituir o conteúdo que falhou — se
 * alguém reverter isso, este teste cai.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

async function primeiroId(request, caminho) {
  const login = await request.post(`${API}/auth/dev-login`, { data: {} })
  const { data } = await login.json()
  const r = await request.get(`${API}${caminho}`, {
    headers: { Authorization: `Bearer ${data.tokens.access_token}` },
  })
  const corpo = await r.json()
  return corpo.data?.[0]?.id
}

/** Faz o endpoint escolhido responder 500, sem tocar nos demais. */
async function derrubarEndpoint(page, padrao) {
  await page.route(padrao, (rota) =>
    rota.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'server_error', message: 'Falha ao carregar' } }),
    })
  )
}

test('abas do criador mostram erro, não “nenhuma análise”', async ({ page, request }) => {
  const id = await primeiroId(request, '/influencers?per_page=1')
  await entrarComoAdmin(page)
  await derrubarEndpoint(page, '**/influencers/*/analyses**')
  await derrubarEndpoint(page, '**/influencers/*/posts**')

  await page.goto(`/app/influenciadores/${id}`)
  await page.getByRole('tab', { name: 'Histórico' }).click()

  await expect(page.getByRole('alert')).toContainText(/falha|erro/i)
  await expect(page.locator('main')).not.toContainText(/Nenhuma análise no histórico/i)

  await page.getByRole('tab', { name: 'Posts Analisados' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/Nenhum post analisado/i)
})

test('campanha com benchmarking fora do ar não vira campanha sem participante', async ({
  page,
  request,
}) => {
  const id = await primeiroId(request, '/campaigns?per_page=1')
  await entrarComoAdmin(page)
  await derrubarEndpoint(page, '**/campaigns/*/benchmarking**')

  await page.goto(`/app/campanhas/${id}`)

  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/nenhum participante/i)
})

test('erro no dashboard oferece tentar de novo', async ({ page }) => {
  await entrarComoAdmin(page)
  await derrubarEndpoint(page, '**/dashboard/overview**')

  await page.goto('/app/dashboard')

  const alerta = page.getByRole('alert').first()
  await expect(alerta).toBeVisible()
  await expect(alerta.getByRole('button')).toBeVisible()
})
