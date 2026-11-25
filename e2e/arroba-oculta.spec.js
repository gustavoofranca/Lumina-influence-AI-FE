import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * O @ do criador começa escondido e só aparece no clique do olho.
 *
 * A tabela de criadores é o caso difícil: a linha inteira leva ao perfil, e o
 * clique no olho não pode navegar junto.
 */
test('o @ começa escondido, o olho revela só aquele e não abre o perfil', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/influenciadores')

  const tabela = page.locator('main')
  await expect(tabela.getByText('@•••••••').first()).toBeVisible()
  // Escondido, o @ verdadeiro não está em lugar nenhum do texto da tabela.
  const ocultos = await tabela.getByText('@•••••••').count()
  expect(ocultos).toBeGreaterThan(0)

  const olhos = tabela.getByRole('button', { name: 'Mostrar @' })
  await olhos.first().click()
  await expect(page).toHaveURL(/\/app\/influenciadores$/)
  await expect(olhos.first()).toHaveAttribute('aria-pressed', 'true')
  await expect(tabela.getByText('@•••••••')).toHaveCount(ocultos - 1)

  // Recarregar esconde de novo.
  await page.reload()
  await expect(tabela.getByText('@•••••••')).toHaveCount(ocultos)
})
