import { test, expect } from '@playwright/test'

import { entrarComoAdmin, coletarErros } from './apoio/sessao.js'

/**
 * Tema e idioma — os dois estados que o usuário troca e espera reencontrar.
 *
 * O idioma tem teste próprio porque já falhou exatamente assim: `i18n/index.js`
 * tinha `lng: 'pt'` fixo, e trocar para inglês e navegar por URL devolvia tudo
 * ao português.
 */
test('tema claro sobrevive ao recarregar', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)
  await page.goto('/app/dashboard')

  const raiz = page.locator('html')
  const inicial = await raiz.getAttribute('data-theme')
  const oposto = inicial === 'dark' ? 'light' : 'dark'

  await page.getByRole('button', { name: /tema (claro|escuro)/i }).click()
  await expect(raiz).toHaveAttribute('data-theme', oposto)

  // O que interessa é sobreviver ao recarregamento: a preferência mora no
  // localStorage, não na memória do componente.
  await page.reload()
  await expect(raiz).toHaveAttribute('data-theme', oposto)

  await page.getByRole('button', { name: /tema (claro|escuro)/i }).click()
  await expect(raiz).toHaveAttribute('data-theme', inicial)
  expect(erros).toEqual([])
})

test('idioma persiste ao navegar por URL', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/dashboard')

  await page.getByRole('button', { name: /idioma/i }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', /en/)

  // Navegação por URL recarrega o app inteiro: é onde a preferência se perdia.
  await page.goto('/app/influenciadores')
  await expect(page.locator('html')).toHaveAttribute('lang', /en/)
  await expect(page.locator('main')).toContainText(/Influencers|Creators/i)

  await page.getByRole('button', { name: /language|idioma/i }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', /pt/)
})
