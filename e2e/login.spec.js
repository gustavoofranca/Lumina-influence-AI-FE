import { test, expect } from '@playwright/test'

import { coletarErros } from './apoio/sessao.js'

/**
 * Fluxo de entrada. O atalho de desenvolvimento (campos vazios + Autenticar)
 * é o caminho que a demonstração usa; o login por Google exige conta real e
 * está verificado à mão em docs/testes.
 */
test('entra pela tela de login e chega ao dashboard', async ({ page }) => {
  const erros = coletarErros(page)
  await page.goto('/login')

  await page.getByRole('button', { name: 'Autenticar' }).click()

  await expect(page).toHaveURL(/\/app\/dashboard/)
  await expect(page.locator('main')).toContainText(/./)
  expect(erros).toEqual([])
})

test('rota protegida sem sessão volta para o login', async ({ page }) => {
  await page.goto('/app/dashboard')
  await expect(page).toHaveURL(/\/login/)
})

test('sessão sobrevive ao F5 mas não à aba nova', async ({ page, context }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: 'Autenticar' }).click()
  await expect(page).toHaveURL(/\/app\/dashboard/)

  await page.reload()
  await expect(page).toHaveURL(/\/app\/dashboard/)

  // ADR-001: o token vive em sessionStorage, então fechar a aba encerra a
  // sessão. Aba nova no mesmo contexto não herda sessionStorage.
  const outraAba = await context.newPage()
  await outraAba.goto('/app/dashboard')
  await expect(outraAba).toHaveURL(/\/login/)
  await outraAba.close()
})
