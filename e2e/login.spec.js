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

/**
 * O produto não tem senha: a autenticação é OAuth 2.0 e nenhum modelo do
 * back-end guarda credencial. A tela de login exibia um campo de senha assim
 * mesmo — o valor digitado não era enviado a lugar nenhum e nada o verificava.
 *
 * Era a assinatura do projeto na primeira tela do produto: afirmar uma
 * verificação que não acontece. Este teste existe para que o campo não volte.
 */
test('a tela de login não pede senha, porque o produto não tem senha', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Autenticar' })).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
})

/**
 * `DEV_LOGIN_ENABLED` é False fixo em staging e produção, então o atalho de
 * demonstração responde 403 assim que o sistema sair do ambiente local — o que
 * acontece no domínio HTTPS exigido pelo App Review da Meta. Sem este ramo o
 * revisor lia "Forbidden" e não tinha como descobrir que a porta era o Google.
 */
test('com o atalho desligado, a tela diz qual é o caminho que resta', async ({ page }) => {
  await page.route('**/auth/dev-login', (rota) =>
    rota.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'dev_login_disabled', message: 'dev-login desabilitado' } }),
    })
  )

  await page.goto('/login')
  await page.getByRole('button', { name: 'Autenticar' }).click()

  await expect(page.getByText(/Google/i).first()).toBeVisible()
  await expect(page.locator('form')).toContainText(/desativado/i)
  await expect(page).toHaveURL(/\/login/)
})
