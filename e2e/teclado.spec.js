import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * `role="tab"` promete navegação por setas e uma única parada de tabulação.
 * Antes de 28/08 o componente declarava o papel sem cumprir nenhuma das duas.
 */
test('abas do criador andam pelas setas e ocupam uma só parada de Tab', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/influenciadores')

  await page.getByRole('row').nth(1).click()
  await expect(page).toHaveURL(/\/app\/influenciadores\/[0-9a-f-]{36}/)

  const primeira = page.getByRole('tab', { name: 'Visão Geral' })
  await primeira.click()
  await expect(primeira).toHaveAttribute('aria-selected', 'true')

  // Só a aba selecionada está na ordem de tabulação
  const paradas = await page.evaluate(
    () => [...document.querySelectorAll('[role="tab"]')].filter((t) => t.tabIndex === 0).length
  )
  expect(paradas, 'mais de uma aba na ordem de tabulação').toBe(1)

  await primeira.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Posts Analisados' })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('End')
  await expect(page.getByRole('tab', { name: 'Histórico' })).toHaveAttribute('aria-selected', 'true')

  await page.keyboard.press('Home')
  await expect(primeira).toHaveAttribute('aria-selected', 'true')
})
