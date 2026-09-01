import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * `DELETE /campaigns/<id>` existia desde a B4 e a interface nunca o ofereceu:
 * dava para criar e editar campanha, mas não para remover — a lista só crescia.
 *
 * O que se mede além do sumiço: a confirmação precisa declarar corretamente o
 * que **sobrevive**. Posts e relatórios têm `SET NULL` e continuam existindo,
 * desvinculados; dizer só o que se perde faria o usuário imaginar o pior, e
 * aqui o pior é falso.
 */
async function campanhaDescartavel(request, token) {
  const nome = `Descartável ${Date.now()}`
  const r = await request.post(`${API}/campaigns`, {
    headers: { Authorization: `Bearer ${token}` },
    // O campo é `title`, e o schema recusa extras. `name` na interface é
    // `title || brand_name` — é ele que a confirmação vai pedir digitado.
    data: {
      title: nome, brand_name: 'Marca Teste',
      period_start: '2026-01-01', period_end: '2026-02-01',
    },
  })
  if (!r.ok()) throw new Error(`não consegui criar a campanha: ${r.status()}`)
  const { data } = await r.json()
  return { id: data.id, nome }
}

test('excluir campanha exige o nome digitado e diz o que permanece', async ({ page }) => {
  await entrarComoAdmin(page)
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await r.json()).data.tokens.access_token
  const cabecalho = { Authorization: `Bearer ${token}` }
  const { id, nome } = await campanhaDescartavel(page.request, token)

  await page.goto(`/app/campanhas/${id}`)
  await page.getByRole('button', { name: /excluir campanha|delete campaign/i }).click()

  // O que permanece precisa estar escrito, não só o que se perde.
  await expect(page.getByText(/O que permanece|What stays/i)).toBeVisible()
  await expect(page.getByText(/publicações coletadas continuam|posts stay/i)).toBeVisible()

  const confirmar = page.getByRole('button', { name: /excluir definitivamente|delete permanently/i })
  await expect(confirmar).toBeDisabled()
  await page.getByLabel(new RegExp(`Digite ${nome}`, 'i')).fill('outra coisa')
  await expect(confirmar).toBeDisabled()
  await page.getByLabel(new RegExp(`Digite ${nome}`, 'i')).fill(nome)
  await expect(confirmar).toBeEnabled()
  await confirmar.click()

  await expect(page).toHaveURL(/\/app\/campanhas$/)
  await expect(page.locator('[data-toast-live]')).toContainText(nome, { timeout: 15_000 })

  // Apagou mesmo — não só sumiu da tela.
  const depois = await page.request.get(`${API}/campaigns/${id}`, { headers: cabecalho })
  expect(depois.status()).toBe(404)
})
