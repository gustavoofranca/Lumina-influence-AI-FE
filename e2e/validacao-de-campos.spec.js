import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * Validação dos formulários na tela — a fase 2 da varredura de 15/10/2026.
 *
 * Na avaliação, o professor tentou quebrar o cadastro de campanha: nenhum campo
 * limitava a digitação, e a recusa da API chegava como "Erro de validação" no
 * último passo do assistente, sem dizer qual campo nem por quê.
 *
 * Nada aqui grava no banco: todo envio é interceptado. Onde importa provar que
 * a recusa da API chega ao campo, a recusa é fabricada; onde importa provar que
 * a validação da tela deixou passar, o envio é contado e respondido aqui.
 */
const MARCA_RECUSADA = {
  error: {
    code: 'validation_error',
    message: 'Marca: deve ter no máximo 160 caracteres',
    details: {
      fields: [{ field: 'brand_name', label: 'Marca', message: 'deve ter no máximo 160 caracteres', type: 'string_too_long' }],
    },
  },
}

async function preencherPasso1(page, { nome = 'Campanha de teste', marca = 'Marca X', inicio = '01102026', fim = '31102026', orcamento = '1000' } = {}) {
  await page.getByLabel('Nome da campanha').fill(nome)
  await page.getByLabel('Marca cliente').fill(marca)
  await page.getByLabel('Início').fill(inicio)
  await page.getByLabel('Fim').fill(fim)
  await page.getByLabel('Orçamento (R$)').fill(orcamento)
}

test('o assistente de campanha limita a digitação e recusa o que a API recusaria', async ({ page }) => {
  await entrarComoAdmin(page)
  await page.goto('/app/campanhas/nova')
  await expect(page.getByLabel('Marca cliente')).toBeVisible({ timeout: 20_000 })

  // Limite de digitação igual ao da API: 200 no título, 160 na marca.
  await page.getByLabel('Nome da campanha').fill('a'.repeat(300))
  await page.getByLabel('Marca cliente').fill('b'.repeat(300))
  await expect(page.getByLabel('Nome da campanha')).toHaveValue('a'.repeat(200))
  await expect(page.getByLabel('Marca cliente')).toHaveValue('b'.repeat(160))

  // Conteúdo que a API recusa é recusado antes de sair do passo 1.
  await preencherPasso1(page, { marca: '<b>Marca</b>', inicio: '01011990', orcamento: '2000000000' })
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('Não use os sinais < ou >.')).toBeVisible()
  await expect(page.getByText('A data precisa estar entre 01/01/2000 e 31/12/2100.')).toBeVisible()
  await expect(page.getByText('O valor máximo é R$ 1.000.000.000,00.')).toBeVisible()
  // Continua no passo 1.
  await expect(page.getByLabel('Marca cliente')).toBeVisible()
})

test('a recusa da API volta ao passo do campo e mostra o motivo nele', async ({ page }) => {
  await entrarComoAdmin(page)
  let envios = 0
  await page.route('**/api/v1/campaigns', async (rota) => {
    if (rota.request().method() !== 'POST') return rota.continue()
    envios++
    await rota.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify(MARCA_RECUSADA) })
  })

  await page.goto('/app/campanhas/nova')
  await expect(page.getByLabel('Marca cliente')).toBeVisible({ timeout: 20_000 })
  await preencherPasso1(page)
  await page.getByRole('button', { name: 'Continuar' }).click()

  const criador = page.locator('main button[aria-pressed]').first()
  await expect(criador).toBeVisible({ timeout: 20_000 })
  await criador.click()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.getByRole('button', { name: 'Criar campanha' }).click()

  // De volta ao passo 1, com o motivo debaixo da marca — e não um aviso
  // genérico no passo 3.
  await expect(page.getByText('deve ter no máximo 160 caracteres')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByLabel('Marca cliente')).toBeVisible()
  expect(envios).toBe(1)
})

test('CNPJ ganha máscara, recusa dígito errado e não trava quando não muda', async ({ page }) => {
  await entrarComoAdmin(page)
  const enviados = []
  await page.route('**/api/v1/agencies/*', async (rota) => {
    if (rota.request().method() !== 'PATCH') return rota.continue()
    enviados.push(rota.request().postDataJSON())
    await rota.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) })
  })

  await page.goto('/app/configuracoes/agencia')
  const cnpj = page.getByLabel('CNPJ')
  await expect(cnpj).toBeVisible({ timeout: 20_000 })
  const original = await cnpj.inputValue()
  const salvar = page.getByRole('button', { name: 'Salvar alterações' })

  // Dígito verificador errado: recusado na tela, nada é enviado.
  await cnpj.fill('11222333000180')
  await expect(cnpj).toHaveValue('11.222.333/0001-80')
  await salvar.click()
  await expect(page.getByText('CNPJ inválido: o dígito verificador não confere.')).toBeVisible()
  expect(enviados).toHaveLength(0)

  // CNPJ que não muda não é conferido — a mesma regra da API, que não trava a
  // edição do nome por um CNPJ antigo gravado com dígito errado.
  await cnpj.fill(original)
  await salvar.click()
  await expect.poll(() => enviados.length).toBe(1)
  await expect(page.getByText('CNPJ inválido: o dígito verificador não confere.')).toHaveCount(0)
})
