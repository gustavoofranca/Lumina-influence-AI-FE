import { test } from 'node:test'
import assert from 'node:assert/strict'

import { ARROBA_OCULTA, normalizarArroba } from './arroba.js'

test('o @ oculto tem sempre sete pontos, sem contar as letras do original', () => {
  assert.equal(ARROBA_OCULTA, '@•••••••')
})

test('normaliza com e sem @, e tira espaço', () => {
  assert.equal(normalizarArroba('ana.souza'), '@ana.souza')
  assert.equal(normalizarArroba('@ana.souza'), '@ana.souza')
  assert.equal(normalizarArroba('  @@ana '), '@ana')
})

test('vazio não vira um @ solto', () => {
  assert.equal(normalizarArroba(''), null)
  assert.equal(normalizarArroba('@'), null)
  assert.equal(normalizarArroba(null), null)
  assert.equal(normalizarArroba(undefined), null)
})
