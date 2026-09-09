import { test, expect } from '@playwright/test'

/**
 * Nenhuma seção adiada pode recortar o brilho de um cartão.
 *
 * A landing adia o desenho das seções fora da tela com `content-visibility:
 * auto`, que é o que a mantém fluida numa máquina modesta. O preço é discreto
 * e fácil de esquecer: `content-visibility: auto` implica `contain: paint`, e
 * **containment de pintura recorta tudo que passa da borda da caixa**.
 *
 * O brilho dos cartões é uma sombra externa. Quando ela alcança mais longe do
 * que a folga até a borda da seção, a luz termina numa linha reta vertical —
 * foi assim que o defeito apareceu na tela de planos, com 64px de alcance
 * contra 32px de folga.
 *
 * O que torna isso perigoso é que nada acusa: a página monta, o console fica
 * limpo, a suíte passa, e o único sinal é uma aresta que alguém precisa
 * reparar. Este teste mede a aritmética — alcance da sombra contra folga — em
 * toda seção que estiver adiada, então uma sombra nova, um padding menor ou
 * uma seção nova marcada para adiar reprovam aqui.
 */
test('nenhuma seção adiada recorta o brilho dos cartões', async ({ page }) => {
  await page.goto('/')

  const recortes = await page.evaluate(() => {
    // Alcance de uma sombra externa: o quanto ela passa da borda do elemento.
    // Camadas `inset` não contam — elas pintam para dentro.
    const alcanceDaSombra = (boxShadow) => {
      let maior = 0
      for (const camada of boxShadow.split(/,(?![^()]*\))/)) {
        if (/inset/.test(camada)) continue
        const nums = [...camada.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((m) => +m[1])
        if (nums.length < 3) continue
        const [ox, oy, blur, spread = 0] = nums
        const alcance = Math.max(Math.abs(ox), Math.abs(oy)) + blur + spread
        if (alcance > maior) maior = alcance
      }
      return maior
    }

    const achados = []
    for (const secao of document.querySelectorAll('main[data-secoes-diferidas] > section')) {
      if (getComputedStyle(secao).contentVisibility !== 'auto') continue
      const caixaDaSecao = secao.getBoundingClientRect()
      for (const el of secao.querySelectorAll('*')) {
        const sombra = getComputedStyle(el).boxShadow
        if (!sombra || sombra === 'none') continue
        const alcance = alcanceDaSombra(sombra)
        if (alcance <= 0) continue
        const caixa = el.getBoundingClientRect()
        const folga = Math.min(caixa.left - caixaDaSecao.left, caixaDaSecao.right - caixa.right)
        if (alcance > folga) {
          achados.push({
            secao: secao.id || secao.className.slice(0, 40),
            elemento: (el.className?.toString?.() ?? '').slice(0, 50),
            alcance: Math.round(alcance),
            folga: Math.round(folga),
            recortado: Math.round(alcance - folga),
          })
        }
      }
    }
    return achados
  })

  expect(
    recortes,
    'seção adiada com sombra maior que a folga até a borda — a luz vai aparecer ' +
      'cortada numa linha reta. Marque a seção com `data-sem-diferir` ou reduza a ' +
      'sombra:\n' + JSON.stringify(recortes, null, 2)
  ).toEqual([])

  // Controle: sem isto o teste passaria com zero seções adiadas — por exemplo
  // se a regra de CSS fosse removida — e estaria medindo o vazio.
  const adiadas = await page.evaluate(
    () =>
      [...document.querySelectorAll('main[data-secoes-diferidas] > section')].filter(
        (s) => getComputedStyle(s).contentVisibility === 'auto'
      ).length
  )
  expect(adiadas, 'nenhuma seção está sendo adiada: o teste acima não mediu nada').toBeGreaterThan(0)
})
