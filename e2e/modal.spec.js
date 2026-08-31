import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Modal com `aria-modal="true"` promete confinar o foco. Antes de 28/08 não
 * confinava: o foco continuava no botão atrás do overlay e o Tab passeava pela
 * página bloqueada, deixando o formulário inalcançável por teclado.
 */
test('modal leva o foco para dentro, prende o Tab e devolve ao fechar', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/influenciadores')

  const abrir = page.getByRole('button', { name: /adicionar influenciador/i }).first()
  await abrir.click()

  const dialogo = page.getByRole('dialog')
  await expect(dialogo).toBeVisible()

  // 1) o foco entrou no diálogo
  await expect
    .poll(() => page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]')
      return Boolean(d && d.contains(document.activeElement))
    }))
    .toBe(true)

  // 2) o Tab não escapa — vinte passos e o foco continua dentro
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
  }
  const continuaDentro = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]')
    return Boolean(d && d.contains(document.activeElement))
  })
  expect(continuaDentro, 'o foco escapou do modal').toBe(true)

  // 3) Escape fecha e o foco volta para quem abriu
  await page.keyboard.press('Escape')
  await expect(dialogo).toBeHidden()
  const voltouParaOGatilho = await page.evaluate(
    () => document.activeElement?.innerText?.toLowerCase().includes('adicionar')
  )
  expect(voltouParaOGatilho, 'o foco não voltou para o botão que abriu').toBe(true)
})
