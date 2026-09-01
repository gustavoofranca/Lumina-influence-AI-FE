import { test, expect } from '@playwright/test'
import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Verificação 2 da bateria, automatizada — e com o ponto cego fechado.
 *
 * A varredura manual percorria nós de texto lendo a propriedade `color`. SVG
 * não pinta com `color`, pinta com `fill`: os 10 rótulos de eixo dos gráficos
 * saíam a 2,4:1 no tema claro e passaram limpos em duas execuções da bateria.
 * Aqui os dois são medidos, cada um pela propriedade certa.
 *
 * O outro ponto cego registrado — elemento sem texto nunca é alcançado — está
 * em `carregamento.spec.js`, que precisa de outra técnica.
 */
const ROTAS = ['/app/dashboard', '/app/influenciadores', '/app/campanhas']
// Onde há Recharts. Nestas, esperar o texto de `main` não basta.
const ROTAS_COM_GRAFICO = ['/app/dashboard']

/**
 * Roda dentro da página. Recebe os mínimos como argumento porque interpolar
 * valor em template literal quebra assim que o código tem crase num comentário.
 */
function medirContraste({ minimoPequeno, minimoGrande }) {
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
    const partes = m[1].split(',').map((n) => parseFloat(n))
    return { rgb: partes.slice(0, 3), a: partes.length > 3 ? partes[3] : 1 }
  }
  // Fundo efetivo: **compõe** as camadas translúcidas em vez de ignorá-las.
  //
  // A varredura manual parava na primeira camada com alpha > 0,85 e descartava
  // o resto. Isso reprovava o selo de duração do reel a cada execução — branco
  // sobre `neutral-950/70`, medido contra o cartão claro que estava atrás, e
  // não contra o preto translúcido que o cobre. A bateria registrava aquilo
  // como falso positivo conhecido; compor resolve de verdade, e sem exceção
  // escrita à mão para um componente específico.
  const fundoDe = (el) => {
    const camadas = []
    let no = el
    while (no && no !== document.documentElement) {
      const cor = parse(getComputedStyle(no).backgroundColor)
      if (cor && cor.a > 0) {
        camadas.push(cor)
        if (cor.a >= 0.999) break
      }
      no = no.parentElement
    }
    const corpo = parse(getComputedStyle(document.body).backgroundColor)
    const base = corpo && corpo.a >= 0.999 ? corpo.rgb : [255, 255, 255]
    // Da mais funda para a mais rasa: cada uma pinta por cima da anterior.
    return camadas.reduceRight(
      (atras, camada) => camada.rgb.map((c, i) => c * camada.a + atras[i] * (1 - camada.a)),
      base
    )
  }
  const razao = (a, b) => {
    const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }

  const achados = []
  const alvos = [
    ...document.querySelectorAll('main *:not(svg):not(script):not(style)'),
    ...document.querySelectorAll('main svg text'),
  ]
  for (const el of alvos) {
    const texto = (el.textContent || '').trim()
    if (!texto || texto.length > 120) continue
    const estilo = getComputedStyle(el)
    if (estilo.visibility === 'hidden' || estilo.display === 'none') continue

    const eSvg = el.ownerSVGElement != null
    // Aqui mora o ponto cego: SVG pinta com fill, e não com color.
    const frente = parse(eSvg ? estilo.fill : estilo.color)
    if (!frente || frente.a === 0) continue
    // Nó com filho elemento repete o texto dos descendentes; só folha conta.
    // Vale para SVG também: Recharts aninha tspan dentro de text, e sem isto
    // o mesmo rótulo entra duas vezes no relatório.
    if (el.children.length > 0) continue

    const tamanho = parseFloat(estilo.fontSize)
    const negrito = parseInt(estilo.fontWeight, 10) >= 700
    const grande = tamanho >= 24 || (negrito && tamanho >= 18.66)
    achados.push({
      texto: texto.slice(0, 40),
      // A classe entra no relatório porque "3,57:1 no texto '5'" não diz onde
      // consertar; a lista de utilitários diz.
      classe: String(el.className.baseVal ?? el.className).slice(0, 90),
      svg: eSvg,
      razao: Math.round(razao(frente.rgb, fundoDe(el)) * 100) / 100,
      minimo: grande ? minimoGrande : minimoPequeno,
    })
  }
  return achados
}

const MINIMOS = { minimoPequeno: 4.5, minimoGrande: 3.0 }

for (const tema of ['dark', 'light']) {
  test(`contraste no tema ${tema}, incluindo rótulo de gráfico`, async ({ page }) => {
    await entrarComoAdmin(page)
    await page.goto('/app/dashboard')

    if (tema === 'light') {
      // Pelo botão da interface, nunca por script: o efeito do React reaplica o
      // estado por cima e a medição sai contaminada.
      await page.getByRole('button', { name: /tema claro|light theme/i }).click()
      await expect.poll(() =>
        page.evaluate(() => document.documentElement.classList.contains('dark'))
      ).toBe(false)
    }

    const reprovados = []
    let rotulosDeSvgMedidos = 0

    for (const rota of ROTAS) {
      await page.goto(rota)
      await expect
        .poll(async () => (await page.locator('main').innerText()).length, { timeout: 20_000 })
        .toBeGreaterThan(200)

      // Recharts desenha os eixos **depois** do primeiro paint, e o dado vem
      // do Supabase. Esperar só o texto de `main` mede a tela antes de existir
      // rótulo nenhum em SVG — que é passar por vazio no exato ponto que este
      // teste existe para cobrir. Nas rotas com gráfico, espere o rótulo.
      if (ROTAS_COM_GRAFICO.includes(rota)) {
        await expect
          .poll(() => page.locator('main svg text').count(), { timeout: 25_000 })
          .toBeGreaterThan(0)
      }
      await page.waitForTimeout(800)

      for (const a of await page.evaluate(medirContraste, MINIMOS)) {
        if (a.svg) rotulosDeSvgMedidos += 1
        if (a.razao < a.minimo) reprovados.push({ rota, ...a })
      }
    }

    // A guarda contra teste vazio fica **dentro** do teste: sem ela, um seletor
    // que deixe de casar transforma "nenhuma falha" em "nenhuma medição", e os
    // dois se parecem no relatório. Foi assim que 2,4:1 sobreviveu duas vezes.
    expect(rotulosDeSvgMedidos, 'nenhum rótulo em SVG foi medido').toBeGreaterThan(0)
    expect(reprovados, JSON.stringify(reprovados, null, 2)).toEqual([])
  })
}

test('o gráfico do dashboard chega a desenhar rótulo em SVG', async ({ page }) => {
  // Guarda de ambiente, separada da guarda interna dos testes de contraste: se
  // o dashboard parar de renderizar gráfico, aqueles dois falham por falta de
  // medição e esta falha diz por quê.
  await entrarComoAdmin(page)
  await page.goto('/app/dashboard')
  await expect
    .poll(() => page.locator('main svg text').count(), { timeout: 25_000 })
    .toBeGreaterThan(0)
})
