import { test, expect } from '@playwright/test'

import { entrarComoAdmin, coletarErros } from './apoio/sessao.js'

/**
 * Automação da verificação 1 da bateria pré-entrega: tela que não renderiza.
 *
 * É a mais valiosa das sete porque uma tela quebrada passa em silêncio por
 * todas as outras — contraste, i18n e botão morto leem um DOM que não existe.
 * Foi assim que `/app/configuracoes/equipe` ficou em branco em 27/08 com build
 * e 230 testes de back-end passando.
 *
 * O critério é o mesmo da varredura manual: tela viva tem centenas de
 * caracteres em `main`, tela quebrada tem zero, e o console fica limpo.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

const ROTAS_PUBLICAS = ['/', '/login', '/cadastro', '/rota-que-nao-existe']

const ROTAS_DO_APP = [
  '/app/dashboard',
  '/app/influenciadores',
  '/app/campanhas',
  '/app/campanhas/nova',
  '/app/diagnostico',
  '/app/relatorios',
  '/app/relatorios/novo',
  '/app/configuracoes/perfil',
  '/app/configuracoes/agencia',
  '/app/configuracoes/integracoes',
  '/app/configuracoes/equipe',
  '/app/configuracoes/plano',
  '/app/configuracoes/preferencias',
]

/** Ids reais para as rotas de detalhe — inventar um uuid só exercitaria o 404. */
async function idsDeDetalhe(request, token) {
  const cabecalho = { Authorization: `Bearer ${token}` }
  const primeiro = async (caminho) => {
    const r = await request.get(`${API}${caminho}`, { headers: cabecalho })
    const { data } = await r.json()
    return data?.[0]?.id
  }
  return {
    influenciador: await primeiro('/influencers?per_page=1'),
    campanha: await primeiro('/campaigns?per_page=1'),
  }
}

test.describe('toda rota renderiza', () => {
  for (const rota of ROTAS_PUBLICAS) {
    test(`pública ${rota}`, async ({ page }) => {
      const erros = coletarErros(page)
      await page.goto(rota)

      // Medir logo após o goto lê o DOM antes do primeiro render do React e
      // acusa tela em branco onde não há. Espere o texto aparecer.
      await expect
        .poll(
          () =>
            page.evaluate(
              () => (document.querySelector('main') || document.body).innerText.trim().length
            ),
          { timeout: 15_000, message: `${rota} renderizou sem texto` }
        )
        .toBeGreaterThan(50)

      expect(erros, `${rota} sujou o console`).toEqual([])
    })
  }

  for (const rota of ROTAS_DO_APP) {
    test(`autenticada ${rota}`, async ({ page }) => {
      const erros = coletarErros(page)
      await entrarComoAdmin(page)
      await page.goto(rota)

      // A tela do criador faz quatro requisições; medir cedo demais é falso
      // positivo garantido. Esperar o texto aparecer é mais firme que um sleep.
      await expect
        .poll(
          () => page.evaluate(() => document.querySelector('main')?.innerText.trim().length ?? 0),
          { timeout: 20_000, message: `${rota} ficou sem texto em main` }
        )
        .toBeGreaterThan(50)

      expect(page.url()).toContain(rota)
      expect(erros, `${rota} sujou o console`).toEqual([])
    })
  }

  test('rotas de detalhe renderizam com id real', async ({ page, request }) => {
    const erros = coletarErros(page)
    const usuario = await entrarComoAdmin(page)
    expect(usuario.email).toBeTruthy()

    const resposta = await request.post(`${API}/auth/dev-login`, { data: {} })
    const { data } = await resposta.json()
    const ids = await idsDeDetalhe(request, data.tokens.access_token)

    for (const rota of [
      `/app/influenciadores/${ids.influenciador}`,
      `/app/campanhas/${ids.campanha}`,
    ]) {
      await page.goto(rota)
      await expect
        .poll(
          () => page.evaluate(() => document.querySelector('main')?.innerText.trim().length ?? 0),
          { timeout: 20_000, message: `${rota} ficou sem texto em main` }
        )
        .toBeGreaterThan(50)
    }
    expect(erros).toEqual([])
  })
})
