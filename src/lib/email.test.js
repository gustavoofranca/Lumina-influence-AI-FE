import { test } from 'node:test'
import assert from 'node:assert/strict'

import { mascararEmail, sugerirEmail } from './email.js'

test('sugere domínio comum digitado errado', () => {
  assert.equal(sugerirEmail('marina@gmial.com'), 'marina@gmail.com')
  assert.equal(sugerirEmail('marina@hotmal.com'), 'marina@hotmail.com')
  assert.equal(sugerirEmail('x@outlok.com'), 'x@outlook.com')
})

test('não sugere nada para domínio certo ou próprio', () => {
  assert.equal(sugerirEmail('marina@gmail.com'), null)
  assert.equal(sugerirEmail('marina@agencia.com.br'), null)
  assert.equal(sugerirEmail('sem-arroba'), null)
})

test('mascara o e-mail para mostrar na tela', () => {
  assert.equal(mascararEmail('nova@agencia.com.br'), 'n*****@agencia.com.br')
  assert.equal(mascararEmail(''), '')
})
