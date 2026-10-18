import { test, expect } from '@playwright/test'

import { colar } from './apoio/colar.js'

/**
 * Cadastro, confirmação de e-mail e recuperação de senha — sem gravar no banco.
 * Todo envio que criaria conta ou mandaria e-mail responde por `page.route`; o
 * que a API faz com ele está no pytest (`test_cadastro.py`, `test_login_senha.py`).
 */
const json = (status, corpo) => ({ status, contentType: 'application/json', body: JSON.stringify(corpo) })
const ATIVA = {
  data: {
    cnpj: '19.131.243/0001-97', encontrado: true, razao_social: 'OPEN KNOWLEDGE BRASIL',
    situacao: 'ATIVA', impeditiva: false,
  },
}
const NAO_ENCONTRADO = { data: { encontrado: false, razao_social: null, situacao: null, impeditiva: false } }

async function preencherValido(page) {
  await page.getByLabel('Seu nome').fill('Marina Costa')
  await page.getByLabel('E-mail').fill('nova@agencia.com.br')
  await page.getByLabel('Senha', { exact: true }).fill('café com pão de queijo')
  await page.getByLabel('CNPJ').fill('19131243000197')
  await page.getByRole('checkbox').check()
}

test('o erro aparece ao sair do campo e some ao corrigir', async ({ page }) => {
  await page.goto('/cadastro')
  const nome = page.getByLabel('Seu nome')
  await nome.fill('Marina2')
  await nome.blur()
  await expect(page.getByText('Nome não pode ter números.')).toBeVisible()
  await nome.fill('Marina Costa')
  await expect(page.getByText('Nome não pode ter números.')).toHaveCount(0)
})

test('CNPJ alfanumérico é formatado e letra não entra no dígito', async ({ page }) => {
  await page.route('**/auth/cnpj/**', (rota) => rota.fulfill(json(200, NAO_ENCONTRADO)))
  await page.goto('/cadastro')
  const cnpj = page.getByLabel('CNPJ')
  await cnpj.fill('12abc34501de35')
  await expect(cnpj).toHaveValue('12.ABC.345/01DE-35')
  await cnpj.fill('12.ABC.345/01DE-3X')
  await expect(cnpj).toHaveValue('12.ABC.345/01DE-3')
})

test('CNPJ colado com texto em volta', async ({ page }) => {
  await page.route('**/auth/cnpj/**', (rota) => rota.fulfill(json(200, NAO_ENCONTRADO)))
  await page.goto('/cadastro')
  const cnpj = page.getByLabel('CNPJ')
  await colar(cnpj, 'CNPJ: 12.abc.345/01de-35')
  await expect(cnpj).toHaveValue('12.ABC.345/01DE-35')
})

test('a consulta à Receita sugere o nome da agência', async ({ page }) => {
  await page.route('**/auth/cnpj/**', (rota) => rota.fulfill(json(200, ATIVA)))
  await page.goto('/cadastro')
  await page.getByLabel('CNPJ').fill('19131243000197')
  await expect(page.getByLabel('Nome da agência')).toHaveValue('OPEN KNOWLEDGE BRASIL')
  await expect(page.getByText('Empresa ATIVA na Receita.')).toBeVisible()
})

test('CNPJ baixado impede o envio', async ({ page }) => {
  let enviados = 0
  await page.route('**/auth/cnpj/**', (rota) => rota.fulfill(json(200, {
    data: { ...ATIVA.data, situacao: 'BAIXADA', impeditiva: true },
  })))
  await page.route('**/auth/register', (rota) => { enviados++; return rota.fulfill(json(202, { data: {} })) })
  await page.goto('/cadastro')
  await preencherValido(page)
  await expect(page.getByText('Este CNPJ está BAIXADA na Receita Federal.')).toBeVisible()
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await expect(page).toHaveURL(/\/cadastro/)
  expect(enviados).toBe(0)
})

test('cadastro válido leva para "confirme seu e-mail"', async ({ page }) => {
  let corpo = null
  await page.route('**/auth/cnpj/**', (rota) => rota.fulfill(json(200, ATIVA)))
  await page.route('**/auth/register', (rota) => {
    corpo = rota.request().postDataJSON()
    return rota.fulfill(json(202, { data: { message: 'ok' } }))
  })
  await page.goto('/cadastro')
  await preencherValido(page)
  await expect(page.getByLabel('Nome da agência')).toHaveValue('OPEN KNOWLEDGE BRASIL')
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click()
  await expect(page).toHaveURL(/\/verifique-seu-email/)
  await expect(page.getByText('n*****@agencia.com.br')).toBeVisible()
  expect(corpo).toMatchObject({
    name: 'Marina Costa', email: 'nova@agencia.com.br', cnpj: '19.131.243/0001-97',
    agency_name: 'OPEN KNOWLEDGE BRASIL', accept_terms: true,
  })
})

test('o link de confirmação chama a API uma vez só e sai da URL', async ({ page }) => {
  let chamadas = 0
  await page.route('**/auth/verify-email', (rota) => {
    chamadas++
    return rota.fulfill(json(400, { error: { code: 'verification_token_invalid', message: 'x', details: {} } }))
  })
  await page.goto('/verificar-email?token=abc123')
  await expect(page.getByText('Este link é inválido ou já foi usado.')).toBeVisible()
  expect(chamadas).toBe(1)
  expect(page.url()).not.toContain('abc123')
})

test('recuperar senha responde do mesmo jeito para qualquer e-mail', async ({ page }) => {
  await page.route('**/auth/forgot-password', (rota) => rota.fulfill(json(202, { data: {} })))
  await page.goto('/login')
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click()
  await expect(page).toHaveURL(/\/recuperar-senha/)
  await page.getByLabel('E-mail').fill('qualquer@agencia.com.br')
  await page.getByRole('button', { name: 'Enviar link' }).click()
  await expect(page.getByText('Se houver uma conta com este e-mail, enviamos um link. Ele vale por 30 minutos.'))
    .toBeVisible()
})

test('redefinir senha sem token oferece pedir outro link', async ({ page }) => {
  await page.goto('/redefinir-senha')
  await expect(page.getByText('Link incompleto. Peça um novo.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pedir novo link' })).toBeVisible()
})
