import path from 'node:path'
import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Regerador das capturas de tela usadas na escrita.
 *
 * Fica desligado por padrão: capturar não verifica nada, e misturar isso com a
 * suíte faria toda execução escrever arquivo em `docs/`. Roda sob demanda:
 *
 *   CAPTURAS=1 npx playwright test capturas.spec.js
 *
 * Existe versionado porque o conjunto de 27/08 envelheceu em quatro dias — a
 * landing foi refeita segundo o Figma, o tema claro teve contraste corrigido em
 * três famílias de componente e três telas novas passaram a existir. Figura de
 * TCC que mostra um produto que não existe mais é pior que figura nenhuma, e
 * repetir 14 navegações na mão garante que ninguém as refaça.
 */
const DESTINO = path.resolve(
  process.env.CAPTURAS_DIR ||
    '../../Lumina-Influence-AI-BE/docs/capturas'
)
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'

test.skip(!process.env.CAPTURAS, 'defina CAPTURAS=1 para regerar as figuras')
test.describe.configure({ mode: 'serial' })
test.use({ viewport: { width: 1440, height: 1000 } })

/** Espera a tela ter conteúdo de verdade antes de fotografar. */
async function pronta(page, { minimo = 200, extra = 1200 } = {}) {
  await expect
    .poll(async () => (await page.locator('main, body').first().innerText()).length,
          { timeout: 25_000 })
    .toBeGreaterThan(minimo)
  // Recharts e as animações de entrada terminam depois do primeiro paint.
  await page.waitForTimeout(extra)
}

async function fotografar(page, arquivo, { inteira = true } = {}) {
  await page.screenshot({ path: path.join(DESTINO, arquivo), fullPage: inteira })
}

async function idsDoSeed(request, token) {
  const cabecalho = { Authorization: `Bearer ${token}` }
  const pega = async (caminho) => {
    const r = await request.get(`${API}${caminho}`, { headers: cabecalho })
    const { data } = await r.json()
    return data?.[0]?.id
  }
  return {
    criador: await pega('/influencers?per_page=1'),
    campanha: await pega('/campaigns?per_page=1'),
  }
}

test('regera o conjunto de capturas', async ({ page }) => {
  test.setTimeout(300_000)

  // --- Públicas, sem sessão ---------------------------------------------
  await page.goto('/')
  await pronta(page, { extra: 2000 })
  await fotografar(page, '01-landing.png')

  await page.goto('/login')
  await pronta(page)
  await fotografar(page, '02-login.png')

  // Novas: o App Review da Meta abre estas antes de olhar o app.
  await page.goto('/privacidade')
  await pronta(page, { minimo: 1500 })
  await fotografar(page, '15-privacidade.png')

  await page.goto('/exclusao-de-dados')
  await pronta(page, { minimo: 1000 })
  await fotografar(page, '16-exclusao-de-dados.png')

  // --- App interno -------------------------------------------------------
  const resposta = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  const token = (await resposta.json()).data.tokens.access_token
  await entrarComoAdmin(page)
  const ids = await idsDoSeed(page.request, token)

  await page.goto('/app/dashboard')
  await pronta(page, { extra: 2500 })
  await fotografar(page, '03-dashboard.png')

  await page.goto('/app/influenciadores')
  await pronta(page)
  await fotografar(page, '04-influenciadores.png')

  if (ids.criador) {
    await page.goto(`/app/influenciadores/${ids.criador}`)
    await pronta(page, { extra: 2500 })
    await fotografar(page, '06-criador-diagnostico.png')

    await page.getByRole('tab', { name: /visão geral|overview/i }).click()
    await pronta(page, { extra: 1500 })
    await fotografar(page, '05-criador-visao-geral.png')

    await page.getByRole('tab', { name: /posts/i }).click()
    await pronta(page, { extra: 1500 })
    await fotografar(page, '07-criador-posts.png')

    await page.getByRole('tab', { name: /histórico|history/i }).click()
    await pronta(page, { extra: 1500 })
    await fotografar(page, '10-diagnostico.png')

    // Nova: a exclusão em cascata, com a confirmação digitada.
    await page.getByRole('button', { name: /excluir criador|delete creator/i }).click()
    await page.waitForTimeout(600)
    await fotografar(page, '17-exclusao-de-criador.png', { inteira: false })
    await page.getByRole('button', { name: /cancelar|cancel/i }).click()
  }

  await page.goto('/app/campanhas')
  await pronta(page)
  await fotografar(page, '08-campanhas.png')

  if (ids.campanha) {
    await page.goto(`/app/campanhas/${ids.campanha}`)
    await pronta(page, { extra: 2500 })
    await fotografar(page, '09-campanha-benchmarking.png')
  }

  await page.goto('/app/relatorios/novo')
  await pronta(page, { extra: 2000 })
  await fotografar(page, '11-relatorio-wizard.png')

  // A pré-visualização exige percorrer os quatro passos — o mesmo caminho de
  // `relatorio.spec.js`. Sem isto a figura 12 ficava congelada em 27/08, que é
  // como o conjunto envelhece: a captura difícil é a que ninguém refaz.
  await page.locator('main button').filter({ hasText: /→/ }).first().click()
  for (let passo = 0; passo < 3; passo += 1) {
    await page.getByRole('button', { name: /continuar|continue/i }).click()
    await page.waitForTimeout(1200)
  }
  await pronta(page, { minimo: 400, extra: 3000 })
  await fotografar(page, '12-relatorio-preview.png')

  await page.goto('/app/configuracoes/integracoes')
  await pronta(page)
  await fotografar(page, '13-configuracoes-integracoes.png')

  // Nova: a zona de perigo do perfil, com a contagem do que a exclusão leva.
  await page.goto('/app/configuracoes/perfil')
  await pronta(page, { extra: 1500 })
  await fotografar(page, '18-exclusao-de-conta.png')

  // --- Tema claro, por último para não contaminar as anteriores ----------
  await page.goto('/app/dashboard')
  await pronta(page, { extra: 2000 })
  await page.getByRole('button', { name: /tema claro|light theme/i }).click()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
    .toBe(false)
  await page.waitForTimeout(2500)
  await fotografar(page, '14-tema-claro.png')
})
