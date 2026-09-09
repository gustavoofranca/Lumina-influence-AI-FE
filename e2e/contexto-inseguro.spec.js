import { test, expect } from '@playwright/test'

import { coletarErros } from './apoio/sessao.js'

/**
 * A landing tem que renderizar sem `crypto.randomUUID`.
 *
 * `crypto.randomUUID` só existe em **contexto seguro**: HTTPS ou `localhost`.
 * Todo o desenvolvimento acontece em `localhost`, então a função está sempre
 * lá — e o defeito que ela causa é invisível no lugar em que se trabalha. Ele
 * aparece na única situação que importa: a landing aberta pelo IP da máquina,
 * que é como se mostra o produto num celular ou num projetor.
 *
 * O `react-glass-ui` chamava `crypto.randomUUID()` para nomear o filtro SVG de
 * cada cartão de vidro. Sem contexto seguro a chamada lança, o erro sobe pela
 * árvore durante a renderização e o React desmonta a página inteira: tela
 * branca, não cartão sem efeito. O `CartaoDeVidro` passa um `id` próprio, e o
 * `??` da biblioteca para antes de chegar na chamada.
 *
 * `addInitScript` roda antes de qualquer script da página, então a remoção
 * vale desde o primeiro render — é o contexto inseguro reproduzido sem
 * precisar de um certificado e de um domínio.
 *
 * Este teste existe porque a correção é uma prop: some numa atualização da
 * biblioteca, num `git revert` ou em qualquer reescrita do cartão, e nada
 * acusaria — o desenvolvimento inteiro roda no lugar onde o defeito não
 * acontece.
 */
test('a landing renderiza sem crypto.randomUUID, como fora de HTTPS', async ({ page }) => {
  const erros = coletarErros(page)

  await page.addInitScript(() => {
    // `delete` é o que o navegador faz num contexto inseguro: a propriedade
    // não existe. Trocar por uma função que lança testaria outra coisa.
    delete Object.getPrototypeOf(crypto).randomUUID
    delete crypto.randomUUID
  })

  await page.goto('/')

  // Controle: sem isto o teste passaria mesmo que o `delete` não tivesse
  // efeito, e estaria medindo a landing normal.
  const removido = await page.evaluate(() => typeof crypto.randomUUID === 'undefined')
  expect(removido, 'o cenário não foi reproduzido: crypto.randomUUID ainda existe').toBe(true)

  await expect
    .poll(
      () =>
        page.evaluate(
          () => (document.querySelector('main') || document.body).innerText.trim().length
        ),
      { timeout: 15_000, message: 'a landing ficou em branco sem crypto.randomUUID' }
    )
    .toBeGreaterThan(50)

  // E os cartões de vidro chegaram a montar. O `<h2>Planos</h2>` não serviria:
  // ele fica fora do cartão, e passaria com a seção inteira quebrada. O nome do
  // plano é filho do `CartaoDeVidro` — se a biblioteca não montou, ele não
  // existe.
  await expect(page.getByRole('heading', { level: 3, name: 'Agência' })).toBeVisible()

  expect(erros, 'a landing sujou o console sem crypto.randomUUID').toEqual([])
})
