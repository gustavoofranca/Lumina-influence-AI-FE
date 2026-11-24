import { test, expect } from '@playwright/test'

import { entrarComoAdmin } from './apoio/sessao.js'

/**
 * 2FA por app autenticador — spec de 19/10/2026.
 *
 * As respostas do 2FA são fabricadas com `page.route`: um código TOTP real
 * depende do relógio e do segredo de uma conta de verdade. A sessão entregue
 * no fim é real (atalho de dev), para que o app consiga de fato entrar.
 */
const API = process.env.LUMINA_API || 'http://localhost:5000/api/v1'
const QR = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'
)
const CODIGOS = ['abcd-2345', 'efgh-6789', 'jkmn-2345', 'pqrs-6789', 'tuvw-2345',
                 'xyza-6789', 'bcde-2345', 'fghj-6789', 'kmnp-2345', 'qrst-6789']

const json = (status, corpo) => ({ status, contentType: 'application/json', body: JSON.stringify(corpo) })
const codigoInvalido = json(422, { error: {
  code: 'validation_error', message: 'Código: código inválido ou já usado',
  details: { fields: [{ field: 'code', label: 'Código', message: 'código inválido ou já usado', type: 'invalid_mfa_code' }] },
} })

/** Uma sessão de verdade, pelo atalho de dev, para o app conseguir entrar no fim. */
async function sessaoReal(page) {
  const r = await page.request.post(`${API}/auth/dev-login`, { data: {} })
  expect(r.ok()).toBeTruthy()
  return (await r.json()).data
}

async function entrarComSenha(page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('dono@agencia.com.br')
  await page.getByLabel('Senha', { exact: true }).fill('uma senha bem comprida')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

test('admin sem 2FA ativa antes de entrar, e só segue depois de guardar os códigos', async ({ page }) => {
  const sessao = await sessaoReal(page)
  let confirmacoes = 0
  await page.route('**/auth/login', (rota) => rota.fulfill(json(200, { data: { mfa: 'setup', mfa_ticket: 'ticket-ativar' } })))
  await page.route('**/auth/2fa/setup', (rota) => {
    expect(rota.request().postDataJSON()).toEqual({ mfa_ticket: 'ticket-ativar' })
    // Sem Bearer: ainda não há sessão.
    expect(rota.request().headers().authorization).toBeUndefined()
    return rota.fulfill(json(200, { data: {
      secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', otpauth_uri: 'otpauth://totp/Lumina:x', qr_svg: QR,
    } }))
  })
  await page.route('**/auth/2fa/setup/confirm', (rota) => {
    confirmacoes++
    const { code } = rota.request().postDataJSON()
    if (code !== '123456') return rota.fulfill(codigoInvalido)
    return rota.fulfill(json(200, { data: { recovery_codes: CODIGOS, ...sessao } }))
  })

  await entrarComSenha(page)
  await expect(page).toHaveURL(/\/entrar\/ativar-2fa$/)
  // O ticket viaja no estado da navegação, nunca na URL.
  expect(page.url()).not.toContain('ticket')
  await expect(page.getByAltText('QR code para cadastrar a Lumina no app autenticador')).toBeVisible()

  // Formato errado é recusado na tela, sem ir à API.
  await page.getByLabel('Código do app autenticador').fill('12ab')
  await page.getByRole('button', { name: 'Ativar' }).click()
  await expect(page.getByText('Digite os 6 números que o app mostra.')).toBeVisible()
  expect(confirmacoes).toBe(0)

  // Recusa da API aparece no campo.
  await page.getByLabel('Código do app autenticador').fill('000000')
  await page.getByRole('button', { name: 'Ativar' }).click()
  await expect(page.getByText('código inválido ou já usado')).toBeVisible()

  // Espaço de quem cola "123 456" é ignorado.
  await page.getByLabel('Código do app autenticador').fill('123 456')
  await page.getByRole('button', { name: 'Ativar' }).click()
  await expect(page.getByRole('list', { name: 'Códigos de recuperação' }).getByRole('listitem')).toHaveCount(10)

  const continuar = page.getByRole('button', { name: 'Continuar' })
  await expect(continuar).toBeDisabled()
  await page.getByLabel('Guardei os códigos num lugar seguro').check()
  await continuar.click()
  await expect(page).toHaveURL(/\/(app\/dashboard|primeiro-acesso)$/, { timeout: 20_000 })
})

test('quem tem 2FA digita o código, ou um de recuperação', async ({ page }) => {
  const sessao = await sessaoReal(page)
  const recebidos = []
  await page.route('**/auth/login', (rota) => rota.fulfill(json(200, { data: { mfa: 'challenge', mfa_ticket: 'ticket-desafio' } })))
  await page.route('**/auth/2fa/verify', (rota) => {
    const corpo = rota.request().postDataJSON()
    recebidos.push(corpo)
    if (corpo.code === 'abcd-2345') return rota.fulfill(json(200, { data: sessao }))
    return rota.fulfill(codigoInvalido)
  })

  await entrarComSenha(page)
  await expect(page).toHaveURL(/\/entrar\/verificacao$/)
  await page.getByLabel('Código do app autenticador').fill('654321')
  await page.getByRole('button', { name: 'Verificar' }).click()
  await expect(page.getByText('código inválido ou já usado')).toBeVisible()
  expect(recebidos[0]).toEqual({ mfa_ticket: 'ticket-desafio', code: '654321' })

  await page.getByRole('button', { name: 'Perdeu o celular? Use um código de recuperação' }).click()
  await page.getByLabel('Código de recuperação').fill('abcd-2345')
  await page.getByRole('button', { name: 'Verificar' }).click()
  await expect(page).toHaveURL(/\/(app\/dashboard|primeiro-acesso)$/, { timeout: 20_000 })
})

test('ticket vencido manda de volta ao login', async ({ page }) => {
  await page.route('**/auth/login', (rota) => rota.fulfill(json(200, { data: { mfa: 'challenge', mfa_ticket: 'ticket-velho' } })))
  await page.route('**/auth/2fa/verify', (rota) => rota.fulfill(json(400, { error: {
    code: 'mfa_ticket_expired', message: 'O tempo para digitar o código acabou. Entre de novo.', details: {},
  } })))

  await entrarComSenha(page)
  await page.getByLabel('Código do app autenticador').fill('123456')
  await page.getByRole('button', { name: 'Verificar' }).click()
  await expect(page.getByText('O tempo para concluir a entrada acabou. Entre de novo.')).toBeVisible()
  await page.getByRole('link', { name: 'Voltar para o login' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('tela do código aberta direto, sem ticket, volta ao login', async ({ page }) => {
  await page.goto('/entrar/verificacao')
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/entrar/ativar-2fa')
  await expect(page).toHaveURL(/\/login$/)
})

test('retorno do Google com 2FA vai para o código e limpa o ticket da URL', async ({ page }) => {
  await page.goto('/auth/callback#mfa=challenge&mfa_ticket=ticket-do-google')
  await expect(page).toHaveURL(/\/entrar\/verificacao$/)
  expect(page.url()).not.toContain('ticket-do-google')
  await expect(page.getByLabel('Código do app autenticador')).toBeVisible()
})

test('nas configurações, admin vê o 2FA como obrigatório depois de ativar', async ({ page }) => {
  await entrarComoAdmin(page)
  const sessao = await sessaoReal(page)
  await page.route('**/auth/2fa/setup', (rota) => {
    // Pela sessão: sem ticket, com Bearer.
    expect(rota.request().headers().authorization).toMatch(/^Bearer /)
    return rota.fulfill(json(200, { data: { secret: 'JBSWY3DPEHPK3PXP', otpauth_uri: 'otpauth://totp/Lumina:x', qr_svg: QR } }))
  })
  await page.route('**/auth/2fa/setup/confirm', (rota) => rota.fulfill(json(200, { data: {
    recovery_codes: CODIGOS, ...sessao, user: { ...sessao.user, mfa_enabled: true, recovery_codes_left: 10 },
  } })))

  await page.goto('/app/configuracoes/perfil')
  await page.getByRole('button', { name: 'Ativar', exact: true }).click()
  await page.getByLabel('Código do app autenticador').fill('123456')
  await page.getByRole('dialog').getByRole('button', { name: 'Ativar' }).click()
  await page.getByLabel('Guardei os códigos num lugar seguro').check()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByText('Verificação em duas etapas ativada.', { exact: false })).toBeVisible()
  await expect(page.getByText('Obrigatória para administradores.')).toBeVisible()
  await expect(page.getByText('10 códigos de recuperação disponíveis.')).toBeVisible()
  // Admin não pode desligar.
  await expect(page.getByRole('button', { name: 'Desligar verificação em duas etapas' })).toHaveCount(0)
})
