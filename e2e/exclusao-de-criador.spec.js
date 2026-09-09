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
    //
    // A busca é dentro do aviso, e não no documento inteiro. Procurar o nome
    // na página toda casava também com o título e o texto do modal da tela de
    // detalhe, que ainda está montada no instante em que a URL já mudou — o
    // teste reprovava por violação de modo estrito, e não por defeito. Foi o
    // primeiro CI de ponta a ponta que expôs a corrida, porque lá a máquina é
    // mais lenta e a janela entre a troca de URL e a troca de DOM abre.
    await expect(page).toHaveURL(/\/app\/influenciadores$/)
    await expect(page.getByRole('status').filter({ hasText: nome })).toBeVisible()

    // E apagou mesmo — não só sumiu da tela.
    const depois = await page.request.get(`${API}/influencers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(depois.status()).toBe(404)
  })

  /**
   * O mesmo caminho, com a corrida que fazia o teste acima falhar uma vez a
   * cada tantas execuções da suíte inteira.
   *
   * O aviso na lista vinha do nome do criador **relido depois do `DELETE`**.
   * Nesse ponto o criador já não existe: qualquer busca pelo detalhe volta
   * 404, o estado da tela vira `null` e o nome chega `undefined`. A lista
   * abria um toast vazio — a exclusão terminava em silêncio, que é o defeito
   * que o teste acima existe para impedir.
   *
   * Isolado ele nunca reproduzia, porque a janela entre o `DELETE` e a busca
   * em voo é de milissegundos e só abre quando a API está sob carga. Forçar o
   * 404 a partir do clique transforma essa janela em certeza: se o nome voltar
   * a ser lido tarde, este teste falha sempre, e não uma vez por hora.
   */
  test('o aviso sobrevive ao criador deixar de existir durante a exclusão', async ({ page }) => {
    const { id, nome } = await criarDescartavel(page.request, token)
    await page.goto(`/app/influenciadores/${id}`)

    await page.getByRole('button', { name: 'Excluir criador' }).click()
    await page.getByLabel(`Digite ${nome} para confirmar`).fill(nome)

    // Só as buscas: o `DELETE` tem que passar de verdade, senão o teste mede
    // um erro de rede em vez do comportamento.
    await page.route(new RegExp(`/influencers/${id}(\\?|$)`), async (rota) => {
      if (rota.request().method() !== 'GET') return rota.fallback()
      await rota.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    })

    await page.getByRole('button', { name: 'Excluir definitivamente' }).click()

    await expect(page).toHaveURL(/\/app\/influenciadores$/)
    await expect(page.getByRole('status').filter({ hasText: nome })).toBeVisible()

    await page.unrouteAll({ behavior: 'ignoreErrors' })
  })
})
