import { test, expect } from '@playwright/test'

import { coletarErros } from './apoio/sessao.js'

const DEMO = 'Entrar na conta de demonstração'
const json = (status, corpo) => ({ status, contentType: 'application/json', body: JSON.stringify(corpo) })

/**
 * Fluxo de entrada.
 *
 * Os casos de erro respondem por `page.route`: errar a senha de verdade gastaria
 * o limite de tentativas da conta admin, que é a mesma da demonstração. O login
 * real por senha só roda com LUMINA_ADMIN_EMAIL e LUMINA_ADMIN_SENHA no ambiente —
 * a senha nunca fica no repositório. O que a API faz com cada caso está no
 * pytest (`tests/test_login_senha.py`).
 */
test('entra pela conta de demonstração e chega ao dashboard', async ({ page }) => {
  const erros = coletarErros(page)
  await page.goto('/login')
  await page.getByRole('button', { name: DEMO }).click()
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
  await page.getByRole('button', { name: DEMO }).click()
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

test('a tela de login pede e-mail e senha, e mostra a senha quando pedido', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Mostrar senha' }).click()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Esqueci minha senha' })).toBeVisible()
})

test('senha errada mostra a frase genérica e não sai da tela', async ({ page }) => {
  await page.route('**/auth/login', (rota) => rota.fulfill(json(401, {
    error: { code: 'invalid_credentials', message: 'E-mail ou senha incorretos.', details: {} },
  })))
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('alguem@agencia.com.br')
  await page.getByLabel('Senha', { exact: true }).fill('qualquer senha longa')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  await expect(page).toHaveURL(/\/login/)
})

test('e-mail não confirmado oferece reenviar o link', async ({ page }) => {
  await page.route('**/auth/login', (rota) => rota.fulfill(json(403, {
    error: { code: 'email_not_verified', message: 'Confirme seu e-mail antes de entrar.', details: {} },
  })))
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('alguem@agencia.com.br')
  await page.getByLabel('Senha', { exact: true }).fill('qualquer senha longa')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByText('Confirme seu e-mail antes de entrar.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reenviar link' })).toBeVisible()
})

test('sem o atalho de demonstração, o botão não aparece', async ({ page }) => {
  await page.route('**/auth/options', (rota) => rota.fulfill(json(200, { data: { dev_login: false, google: true } })))
  await page.goto('/login')
  await expect(page.getByRole('button', { name: 'Entrar com Google' })).toBeVisible()
  await expect(page.getByRole('button', { name: DEMO })).toHaveCount(0)
})

test('entra com e-mail e senha de verdade', async ({ page }) => {
  test.skip(!process.env.LUMINA_ADMIN_EMAIL || !process.env.LUMINA_ADMIN_SENHA,
    'defina LUMINA_ADMIN_EMAIL e LUMINA_ADMIN_SENHA para rodar')
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(process.env.LUMINA_ADMIN_EMAIL)
  await page.getByLabel('Senha', { exact: true }).fill(process.env.LUMINA_ADMIN_SENHA)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/app\/dashboard/)
})
