import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * O terceiro ponto cego da bateria: **nada sem texto é medido.**
 *
 * As sete verificações percorrem nós de texto. O `Skeleton` é `aria-hidden`,
 * não tem texto nenhum, e por isso nenhuma delas o alcançava — enquanto no tema
 * claro toda tela em carregamento virava uma grade de retângulos escuros.
 *
 * Medir isso exige a técnica que faltava: **segurar a resposta da API** para
 * que o estado intermediário exista tempo suficiente para ser observado. É a
 * dimensão do tempo, que a varredura estática não tem como cobrir.
 *
 * A regra: um placeholder pertence ao tema. No claro ele é claro, no escuro é
 * escuro — e nunca é um bloco que compete com o conteúdo real.
 */
const ROTA = '/app/influenciadores'

function medirPlaceholders() {
  const luminancia = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const parse = (cor) => {
    const m = String(cor).match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const p = m[1].split(',').map(Number)
    return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }
  }

  const fundoDaPagina = parse(getComputedStyle(document.body).backgroundColor)
  const base = fundoDaPagina ? fundoDaPagina.rgb : [255, 255, 255]

  const medidos = []
  for (const el of document.querySelectorAll('[data-skeleton]')) {
    const estilo = getComputedStyle(el)
    const caixa = el.getBoundingClientRect()
    if (caixa.width < 8 || caixa.height < 4) continue

    // O shimmer é gradiente, não cor sólida: a cor vem da imagem de fundo.
    const gradiente = estilo.backgroundImage
    const cores = [...String(gradiente).matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0]))
    const solida = parse(estilo.backgroundColor)
    const amostras = cores.filter(Boolean)
    if (solida && solida.a > 0.05) amostras.push(solida)
    if (!amostras.length) continue

    for (const amostra of amostras) {
      medidos.push({
        classe: String(el.className).slice(0, 70),
        luminancia: Math.round(luminancia(amostra.rgb) * 1000) / 1000,
      })
    }
  }
  return { medidos, luminanciaDaPagina: Math.round(luminancia(base) * 1000) / 1000 }
}

for (const tema of ['dark', 'light']) {
  test(`o placeholder de carregamento pertence ao tema ${tema}`, async ({ page }) => {
    await entrarComoAdmin(page)
    await page.goto('/app/dashboard')

    if (tema === 'light') {
      await page.getByRole('button', { name: /tema claro|light theme/i }).click()
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
        .toBe(false)
    }

    // Segura a listagem para que o estado intermediário exista tempo suficiente
    // para ser observado. Sem isto o carregamento dura ~300 ms e nenhuma
    // verificação o alcança — o defeito viveu meses exatamente nessa fresta.
    //
    // O padrão precisa ser largo: `**/influencers?**` exige a query e deixa
    // passar a chamada sem parâmetro, o que tornava o teste intermitente.
    let interceptou = false
    await page.route('**/api/v1/influencers**', async (rota) => {
      interceptou = true
      await new Promise((r) => setTimeout(r, 8000))
      await rota.continue()
    })
    await page.goto(ROTA)

    // Esperar o placeholder aparecer, e não um tempo fixo: espera cronometrada
    // contra render assíncrono é a receita de teste intermitente.
    await expect
      .poll(() => page.locator('[data-skeleton]').count(), { timeout: 15_000 })
      .toBeGreaterThan(0)
    expect(interceptou, 'a chamada da listagem não foi interceptada').toBe(true)

    const { medidos, luminanciaDaPagina } = await page.evaluate(medirPlaceholders)

    // Guarda contra teste vazio: se o seletor deixar de casar, "nenhuma falha"
    // vira "nenhuma medição" e o relatório não distingue as duas.
    expect(medidos.length, 'nenhum placeholder foi medido').toBeGreaterThan(0)

    const paginaClara = luminanciaDaPagina > 0.5
    const forasteiros = medidos.filter((m) =>
      paginaClara ? m.luminancia < 0.5 : m.luminancia > 0.5
    )
    expect(forasteiros, JSON.stringify({ luminanciaDaPagina, forasteiros }, null, 2)).toEqual([])
  })
}
