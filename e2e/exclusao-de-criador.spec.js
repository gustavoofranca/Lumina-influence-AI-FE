import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/**
 * A exclusão de criador é a ação mais destrutiva da interface: delete físico em
 * cascata, sem lixeira. É também o caminho que a página pública de exclusão de
 * dados promete ao titular, então precisa funcionar de fato.
 *
 * O teste cria um criador descartável e apaga esse — nunca um do seed, que as
 * outras 42 verificações usam como base.
 */
async function criarDescartavel(request, token) {
  const nome = `Descartável ${Date.now()}`
  const r = await request.post(`${API}/influencers`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { display_name: nome },
  })
  if (!r.ok()) throw new Error(`não consegui criar o criador de teste: ${r.status()}`)
  const { data } = await r.json()
  return { id: data.id, nome }
}

test.describe('exclusão de criador', () => {
  let token

  test.beforeEach(async ({ page }) => {
    const resposta = await page.request.post(`${API}/auth/dev-login`, { data: {} })
    token = (await resposta.json()).data.tokens.access_token
    await entrarComoAdmin(page)
  })

  test('o botão só libera depois que o nome é digitado', async ({ page }) => {
    const { id, nome } = await criarDescartavel(page.request, token)
    await page.goto(`/app/influenciadores/${id}`)

    await page.getByRole('button', { name: 'Excluir criador' }).click()

    const confirmar = page.getByRole('button', { name: 'Excluir definitivamente' })
    await expect(confirmar).toBeDisabled()

    // Nome errado não libera: a guarda tem que ser sobre o que foi digitado,
    // não sobre ter digitado alguma coisa.
    await page.getByLabel(`Digite ${nome} para confirmar`).fill('qualquer coisa')
    await expect(confirmar).toBeDisabled()

    await page.getByLabel(`Digite ${nome} para confirmar`).fill(nome)
    await expect(confirmar).toBeEnabled()

    // Sai sem excluir — o criador precisa continuar existindo.
    await page.getByRole('button', { name: 'Cancelar' }).click()
    const ainda = await page.request.get(`${API}/influencers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(ainda.status()).toBe(200)

    await page.request.delete(`${API}/influencers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  })

  test('confirmar apaga o criador de verdade e avisa na lista', async ({ page }) => {
    const { id, nome } = await criarDescartavel(page.request, token)
    await page.goto(`/app/influenciadores/${id}`)

    await page.getByRole('button', { name: 'Excluir criador' }).click()
    await page.getByLabel(`Digite ${nome} para confirmar`).fill(nome)
    await page.getByRole('button', { name: 'Excluir definitivamente' }).click()

    // Volta para a lista e diz o que aconteceu: a ação mais destrutiva do
    // produto não pode terminar numa tela silenciosa.
    await expect(page).toHaveURL(/\/app\/influenciadores$/)
    await expect(page.getByText(nome, { exact: false })).toBeVisible()

    // E apagou mesmo — não só sumiu da tela.
    const depois = await page.request.get(`${API}/influencers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(depois.status()).toBe(404)
  })
})
