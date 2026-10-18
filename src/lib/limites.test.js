/**
 * Regras de campo do front. As mesmas da API (`schemas/campos.py` e
 * `utils/senha.py`) — quando uma muda lá, o teste daqui precisa mudar junto.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  cnpjTemDigitosValidos, contemLink, extrairCnpjColado, mascararCnpj, validarCnpj,
  validarEmail, validarNomeEmpresa, validarNomePessoa, validarSenha, validarTexto,
} from './limites.js'

// `t` falso: devolve a chave, para o teste conferir qual regra respondeu.
const t = (chave) => chave

test('CNPJ alfanumérico é formatado em maiúsculas', () => {
  assert.equal(mascararCnpj('12abc34501de35'), '12.ABC.345/01DE-35')
  assert.equal(mascararCnpj('11222333000181'), '11.222.333/0001-81')
})

test('letra não entra nas posições do dígito verificador', () => {
  assert.equal(mascararCnpj('12.ABC.345/01DE-3X'), '12.ABC.345/01DE-3')
})

test('CNPJ colado com texto em volta é extraído sem as letras do rótulo', () => {
  assert.equal(extrairCnpjColado('CNPJ: 12.abc.345/01de-35'), '12.ABC.345/01DE-35')
  assert.equal(extrairCnpjColado('CNPJ 11222333000181 (matriz)'), '11.222.333/0001-81')
})

test('dígito verificador pela regra da Receita, numérico e alfanumérico', () => {
  for (const ok of ['12ABC34501DE35', '12.ABC.345/01DE-35', '11222333000181', '12.345.678/0001-95']) {
    assert.ok(cnpjTemDigitosValidos(ok), ok)
  }
  for (const ruim of ['12ABC34501DE99', '11111111111111', '11.222.333/0001-80']) {
    assert.ok(!cnpjTemDigitosValidos(ruim), ruim)
  }
})

test('validarCnpj', () => {
  assert.equal(validarCnpj(t, '', null, { obrigatorio: true }), 'common.validation.required')
  assert.equal(validarCnpj(t, '12.345', null), 'common.validation.cnpjLength')
  assert.equal(validarCnpj(t, '12.ABC.345/01DE-99', null), 'common.validation.cnpj')
  // O valor que já estava gravado não é reconferido (mesma regra da API).
  assert.equal(validarCnpj(t, '12.345.678/0001-90', '12.345.678/0001-90'), null)
})

test('links', () => {
  for (const link of ['www.marina.com', 'https://acme.com.br', 'acme.com.br', 'Veja acme.io/promo', 'Lumina.AI', 'Booking.com']) {
    assert.ok(contemLink(link), link)
  }
  for (const nome of ['Silva & Costa Ltda.', 'ACME (Brasil) S/A', 'José da Silva Jr.', 'Ana-Clara']) {
    assert.ok(!contemLink(nome), nome)
  }
})

test('detector de link não fica lento com entrada hostil', () => {
  const inicio = performance.now()
  contemLink('a.'.repeat(5000) + 'b'.repeat(5000))
  contemLink('x '.repeat(10000))
  assert.ok(performance.now() - inicio < 50)
})

test('validarTexto de nome recusa link', () => {
  assert.equal(validarTexto(t, 'Booking.com', { semMarcacao: true }), 'common.validation.noLink')
  assert.equal(validarTexto(t, 'Booking.com'), null)
})

test('nome de pessoa', () => {
  assert.equal(validarNomePessoa(t, "Maria D'Ávila"), null)
  assert.equal(validarNomePessoa(t, '  marina    costa '), null)
  assert.equal(validarNomePessoa(t, 'Marina2'), 'common.validation.nameNoDigits')
  assert.equal(validarNomePessoa(t, '@marina'), 'common.validation.nameChars')
  assert.equal(validarNomePessoa(t, 'www.marina.com'), 'common.validation.noLink')
  assert.equal(validarNomePessoa(t, 'M'), 'common.validation.nameMin')
})

test('nome de empresa', () => {
  assert.equal(validarNomeEmpresa(t, 'Silva & Costa Ltda.'), null)
  assert.equal(validarNomeEmpresa(t, 'ACME (Brasil) S/A'), null)
  assert.equal(validarNomeEmpresa(t, 'agencia@acme'), 'common.validation.companyNoAt')
  assert.equal(validarNomeEmpresa(t, '!!!'), 'common.validation.companyNeedsAlnum')
  assert.equal(validarNomeEmpresa(t, 'Agência #1'), 'common.validation.companyChars')
})

test('senha', () => {
  assert.equal(validarSenha(t, 'Lumina@2026'), 'common.validation.passwordMin')
  assert.equal(validarSenha(t, 'a'.repeat(129)), 'common.validation.passwordMax')
  assert.equal(validarSenha(t, 'aaaaaaaaaaaa'), 'common.validation.passwordRepeated')
  assert.equal(validarSenha(t, 'marina.lumina2026', { email: 'marina@x.com' }), 'common.validation.passwordHasEmail')
  assert.equal(validarSenha(t, 'minha senha do Joao 77', { nome: 'João Pereira' }), 'common.validation.passwordHasName')
  assert.equal(validarSenha(t, 'café com pão de queijo', { email: 'marina@x.com', nome: 'Marina' }), null)
})

test('e-mail', () => {
  assert.equal(validarEmail(t, 'marina @agencia.com'), 'common.validation.emailSpaces')
  assert.equal(validarEmail(t, '"A" <a@b.com>'), 'common.validation.emailSpaces')
  assert.equal(validarEmail(t, 'a<b@c.com'), 'common.validation.email')
  assert.equal(validarEmail(t, 'marina@agencia'), 'common.validation.email')
  assert.equal(validarEmail(t, ' Marina@Agencia.com.br '), null)
})
