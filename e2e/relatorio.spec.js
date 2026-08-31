import { test, expect } from '@playwright/test'

import { entrarComoAdmin, coletarErros } from './apoio/sessao.js'

/**
 * Assistente de relatório, do zero até a pré-visualização.
 *
 * Para no passo 4 de propósito: exportar gera PDF de verdade e grava relatório
 * no banco compartilhado. A robustez do PDF em si está coberta em
 * docs/testes/robustez-pdf.md, com 11 cenários adversos.
 */
test('monta um relatório até a pré-visualização', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)
  await page.goto('/app/relatorios/novo')

  // Passo 1 — campanha
  const primeiraCampanha = page.locator('main button').filter({ hasText: /→/ }).first()
  await primeiraCampanha.click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Passo 2 — período e criadores: a lista vem do benchmarking da campanha
  await expect(page.locator('main')).toContainText(/criadores/i)
  await expect(page.locator('main [aria-pressed]').first()).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Passo 3 — seções
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Passo 4 — pré-visualização montada com dado real
  await expect
    .poll(
      () => page.evaluate(() => document.querySelector('main')?.innerText.trim().length ?? 0),
      { timeout: 30_000, message: 'a pré-visualização ficou sem conteúdo' }
    )
    .toBeGreaterThan(300)

  expect(erros).toEqual([])
})

test('o assistente barra o avanço sem campanha escolhida', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/relatorios/novo')

  await page.getByRole('button', { name: 'Continuar' }).click()

  // Continua no passo 1, com o erro de validação à vista.
  await expect(page.locator('main')).toContainText(/Escolha a campanha/i)
})
