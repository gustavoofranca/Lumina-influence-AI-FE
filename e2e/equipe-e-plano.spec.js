import { test, expect } from '@playwright/test'

import { coletarErros, entrarComoAdmin } from './apoio/sessao.js'

/**
 * Duas telas que chamavam serviços que nenhuma tela importava.
 *
 * `updateMemberRole` e `listPlans` existiam em `services/` desde a B4 e não
 * tinham consumidor: o papel do membro era distintivo de leitura — corrigir um
 * convite feito com o papel errado exigia remover a pessoa e convidá-la de
 * novo — e a seção de plano mostrava só o plano vigente, sem dizer o que os
 * outros ofereciam.
 */

test('o papel do membro é editável e o valor exibido vem do que foi gravado', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)
  await page.goto('/app/configuracoes/equipe')

  // Uma linha de alguém que não é admin: mexer no papel de admin no seed
  // arriscaria a sessão das outras especificações.
  const linha = page.locator('tr', { hasText: 'Aline Tavares' })
  await expect(linha).toBeVisible()

  const gatilho = linha.getByRole('button', { name: /Papel de/i })
  await expect(gatilho).toBeVisible()

  const trocar = async (destino) => {
    await gatilho.click()
    const resposta = page.waitForResponse(
      (r) => /\/api\/v1\/users\//.test(r.url()) && r.request().method() === 'PATCH'
    )
    await page.getByRole('option', { name: destino, exact: true }).click()
    const r = await resposta
    expect(r.status()).toBe(200)
  }

  await trocar('Apenas leitura')
  await expect(linha).toContainText('Apenas leitura')

  // Sobrevive ao recarregar: o que a tela mostra tem que estar no banco.
  await page.reload()
  await expect(page.locator('tr', { hasText: 'Aline Tavares' })).toContainText('Apenas leitura')

  // Devolve ao papel original — o seed é compartilhado com as outras 74.
  await trocar('Membro')
  await expect(linha).toContainText('Membro')

  expect(erros).toEqual([])
})

test('a seção de plano lista os planos que existem, sem afirmar preço não definido', async ({ page }) => {
  const erros = coletarErros(page)
  await entrarComoAdmin(page)
  await page.goto('/app/configuracoes/plano')

  const comparativo = page.locator('section, div').filter({ hasText: 'Planos disponíveis' }).first()
  await expect(comparativo).toBeVisible()

  // Os três planos do seed aparecem pelo nome.
  for (const nome of ['Free', 'Agency', 'Enterprise']) {
    await expect(comparativo.getByText(nome, { exact: true }).first()).toBeVisible()
  }

  // E nenhum deles exibe "R$ 0": zero na base significa "gratuito" no Free e
  // "sem valor definido" no Enterprise, e a tela não pode escolher um dos dois.
  await expect(comparativo).not.toContainText(/R\$\s*0(,00)?\s*\/?/)

  expect(erros).toEqual([])
})
