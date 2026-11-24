import { test, expect } from '@playwright/test'

import { colar } from './apoio/colar.js'
import { entrarComoAdmin } from './apoio/sessao.js'

// O formato do pt-BR põe espaço inseparável depois do "R$".
const reais = (texto) => texto.replace(' ', ' ')

test.beforeEach(async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/campanhas/nova')
})

test('orçamento aceita só dígitos e formata em reais', async ({ page }) => {
  const campo = page.getByLabel('Orçamento (R$)')
  await campo.click()
  await campo.pressSequentially('15000')
  await expect(campo).toHaveValue(reais('R$ 150,00'))
  await campo.pressSequentially('e-+')
  await expect(campo).toHaveValue(reais('R$ 150,00'))
})

test('rolar o mouse sobre o campo não muda o valor', async ({ page }) => {
  const campo = page.getByLabel('Orçamento (R$)')
  await campo.click()
  await campo.pressSequentially('15000')
  await campo.hover()
  await page.mouse.wheel(0, -400)
  await expect(campo).toHaveValue(reais('R$ 150,00'))
})

test('colar valor em reais', async ({ page }) => {
  const campo = page.getByLabel('Orçamento (R$)')
  await colar(campo, 'R$ 2.500,50')
  await expect(campo).toHaveValue(reais('R$ 2.500,50'))
})
