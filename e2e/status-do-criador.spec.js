import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * O status do criador é um julgamento da agência — "ativo", "monitorar", "em
 * risco". Até esta frente ele vinha só do seed: aparecia no cabeçalho e
 * ninguém podia mexer, embora o `PATCH /influencers/<id>` exista desde a B4.
 *
 * O teste mede o que faltava: a mudança chega ao banco e sobrevive ao F5.
 */
test('mudar o status persiste e sobrevive ao recarregar', async ({ page }) => {
  await entrarComoAdmin(page)
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const cabecalho = { Authorization: `Bearer ${token}` }

  // Criador descartável: mexer no status de um do seed mudaria o cenário das
  // outras verificações.
  const criado = await page.request.post(`${API}/influencers`, {
    headers: cabecalho, data: { display_name: `Status ${Date.now()}` },
  })
  const { data: inf } = await criado.json()

  await page.goto(`/app/influenciadores/${inf.id}`)
  const gatilho = page.getByRole('button', { name: /status do criador|creator status/i })
  await expect(gatilho).toBeVisible({ timeout: 20_000 })
  await gatilho.click()

  await page.getByRole('option', { name: /^Em risco$/i }).click()

  // O aviso confirma, e o valor exibido vem do que foi gravado.
  await expect(page.locator('[data-toast-live]')).toContainText(/Em risco/i, { timeout: 15_000 })
  await expect(gatilho).toContainText(/Em risco/i)

  // Chegou ao banco: `risk` na tela é `archived` na API.
  const depois = await page.request.get(`${API}/influencers/${inf.id}`, { headers: cabecalho })
  expect((await depois.json()).data.status).toBe('archived')

  await page.reload()
  await expect(
    page.getByRole('button', { name: /status do criador|creator status/i })
  ).toContainText(/Em risco/i, { timeout: 20_000 })

  await page.request.delete(`${API}/influencers/${inf.id}`, { headers: cabecalho })
})
