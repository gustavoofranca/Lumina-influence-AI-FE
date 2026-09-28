import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Trava as duas mudanças de 28/09 no `useApi`.
 *
 * 1. **Resposta velha não vence a nova.** Trocar "7 dias" por "30 dias" rápido
 *    disparava duas buscas, e a que voltasse por último ficava na tela — mesmo
 *    sendo a mais antiga. Com a de 7 dias atrasada, a aba ficava em "30 dias" e
 *    o gráfico sumia (7 dias não tem pontos no banco de demonstração).
 *
 * 2. **Voltar a uma tela visitada não recarrega na frente do usuário.** A tela
 *    abre com a última resposta e busca de novo por trás. E qualquer escrita
 *    apaga essa memória, para que nada velho apareça depois de uma alteração.
 *
 * O esqueleto é detectado por um observador de DOM, e não olhando a tela num
 * instante: ele pode durar um quadro só, e um quadro não se captura por
 * cronômetro. O primeiro teste de memória mede também o caso em que o esqueleto
 * TEM que aparecer — sem esse controle, um observador quebrado passaria verde.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

/** Tela carregada: texto na área principal e nenhum esqueleto. */
async function esperarTelaPronta(page) {
  await page.waitForFunction(() => {
    const main = document.querySelector('main')
    return main && main.innerText.length > 120 && !main.querySelector('.animate-shimmer')
  }, null, { timeout: 30_000 })
}

/** Começa a registrar se algum esqueleto for inserido em `main` daqui em diante. */
async function vigiarEsqueleto(page) {
  await page.evaluate(() => {
    window.__viuEsqueleto = false
    window.__vigiaEsqueleto?.disconnect()
    const ver = () => { if (document.querySelector('main .animate-shimmer')) window.__viuEsqueleto = true }
    window.__vigiaEsqueleto = new MutationObserver(ver)
    window.__vigiaEsqueleto.observe(document.body, { childList: true, subtree: true })
  })
}

const viuEsqueleto = (page) => page.evaluate(() => window.__viuEsqueleto)

async function irPelaBarraLateral(page, nome) {
  await page.getByRole('link', { name: nome, exact: true }).first().click()
  await esperarTelaPronta(page)
}

test('a resposta atrasada de um período não sobrescreve o período escolhido depois', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/dashboard')
  const rotulosDoEixo = page.locator('main .recharts-xAxis .recharts-cartesian-axis-tick-value')
  await expect(rotulosDoEixo.first()).toBeVisible({ timeout: 30_000 })

  // Só 7 dias demora. 30 dias responde no tempo normal.
  await page.route('**/dashboard/overview?*period=7d*', async (rota) => {
    await new Promise((fim) => setTimeout(fim, 2_000))
    await rota.continue()
  })
  const respostaAtrasada = page.waitForResponse((r) => r.url().includes('period=7d'))

  await page.getByRole('tab', { name: '7 dias' }).click()
  await page.getByRole('tab', { name: '30 dias' }).click()
  await expect(rotulosDoEixo.first()).toHaveText(/^S\d/, { timeout: 15_000 })

  // A resposta velha chega agora. Ela tem que ser ignorada.
  await respostaAtrasada
  await page.waitForTimeout(500)

  await expect(page.getByRole('tab', { name: '30 dias' })).toHaveAttribute('aria-selected', 'true')
  await expect(rotulosDoEixo.first()).toBeVisible()
  await expect(rotulosDoEixo.first()).toHaveText(/^S\d/)
})

test('voltar a uma tela já visitada mostra o que ela tinha, sem esqueleto', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/dashboard')
  await esperarTelaPronta(page)

  // Controle: a primeira visita a uma tela tem que mostrar o esqueleto.
  await vigiarEsqueleto(page)
  await irPelaBarraLateral(page, 'Influenciadores')
  expect(await viuEsqueleto(page), 'o observador não viu o esqueleto nem na primeira visita').toBe(true)

  // A volta ao painel abre com a memória.
  await vigiarEsqueleto(page)
  await irPelaBarraLateral(page, 'Visão Geral')
  expect(await viuEsqueleto(page), 'o painel recarregou na frente do usuário').toBe(false)
})

test('depois de uma escrita, a volta à lista busca de novo em vez de usar a memória', async ({ page }) => {
  await entrarComoAdmin(page)
  const login = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const cabecalho = { Authorization: `Bearer ${(await login.json()).data.tokens.access_token}` }

  // Criador descartável, criado por fora do navegador: esta escrita não passa
  // pelo `api.js` e por isso não mexe na memória da página.
  const criado = await page.request.post(`${API}/influencers`, {
    headers: cabecalho, data: { display_name: `Memoria ${Date.now()}` },
  })
  const { data: criador } = await criado.json()

  try {
    // Tudo por clique daqui em diante: `page.goto` recarrega a página e zera a
    // memória, e aí a lista mostraria o esqueleto com ou sem invalidação — o
    // teste passaria sem provar nada.
    await page.goto('/app/influenciadores')
    await esperarTelaPronta(page)
    // A lista pagina de 8 em 8 e o criador novo pode cair fora da primeira
    // página: a busca da própria tela o traz para cima.
    await page.getByPlaceholder(/buscar por nome ou @/i).fill(criador.display_name)
    await page.getByText(criador.display_name, { exact: true }).first().click()
    await expect(page).toHaveURL(new RegExp(`/app/influenciadores/${criador.id}`))
    await esperarTelaPronta(page)

    // Sem escrita, a volta à lista usaria a memória — é o teste anterior.
    // Com uma escrita no meio, ela tem que buscar de novo.
    const gatilho = page.getByRole('button', { name: /status do criador|creator status/i })
    await expect(gatilho).toBeVisible({ timeout: 20_000 })
    await gatilho.click()
    await page.getByRole('option', { name: /^Em risco$/i }).click()
    await expect(gatilho).toContainText(/Em risco/i, { timeout: 15_000 })

    await vigiarEsqueleto(page)
    await irPelaBarraLateral(page, 'Influenciadores')
    expect(await viuEsqueleto(page), 'a lista abriu com a memória de antes da alteração').toBe(true)
  } finally {
    await page.request.delete(`${API}/influencers/${criador.id}`, { headers: cabecalho })
  }
})
