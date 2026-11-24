import { test } from 'node:test'
import assert from 'node:assert/strict'

import { formatarReais, reaisDeDigitos, reaisDeTextoColado } from './dinheiro.js'

// O `toLocaleString` usa espaço inseparável depois do "R$".
const normal = (texto) => texto.replace(/\s/g, ' ')

test('dígitos entram pela direita, como em app de banco', () => {
  assert.equal(reaisDeDigitos('1'), '0.01')
  assert.equal(reaisDeDigitos('15000'), '150.00')
  assert.equal(reaisDeDigitos('1500000'), '15000.00')
})

test('valor já formatado recebendo mais um dígito', () => {
  // "R$ 1.500,00" + "5" digitado no fim.
  assert.equal(reaisDeDigitos('R$ 1.500,005'), '15000.05')
})

test('o que não é dígito não entra', () => {
  assert.equal(reaisDeDigitos('e-+'), '')
  assert.equal(reaisDeDigitos('000'), '')
  assert.equal(reaisDeDigitos(''), '')
})

test('teto de 12 dígitos (R$ 9.999.999.999,99)', () => {
  assert.equal(reaisDeDigitos('1234567890123'), '1234567890.12')
})

test('formatação', () => {
  assert.equal(normal(formatarReais(1500)), 'R$ 1.500,00')
  assert.equal(normal(formatarReais('2500.5')), 'R$ 2.500,50')
  assert.equal(formatarReais(''), '')
  assert.equal(formatarReais('abc'), '')
})

test('colar valor escrito de jeitos diferentes', () => {
  assert.equal(reaisDeTextoColado('R$ 2.500,50'), '2500.50')
  assert.equal(reaisDeTextoColado('2500'), '2500.00')
  assert.equal(reaisDeTextoColado('1.500'), '1500.00')
  assert.equal(reaisDeTextoColado('2500.5'), '2500.50')
  assert.equal(reaisDeTextoColado('abc'), '')
})
