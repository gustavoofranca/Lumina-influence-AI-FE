import { test } from 'node:test'
import assert from 'node:assert/strict'

import { precisaModoLeve } from './modoLeve.js'

const canvasQue = (contexto) => () => ({ getContext: () => contexto })
const comGpu = canvasQue({ getExtension: () => null })
const semGpu = canvasQue(null)

test('com placa de vídeo o site fica como é', () => {
  assert.equal(precisaModoLeve({ criarCanvas: comGpu }), false)
})

test('sem aceleração o navegador recusa o contexto exigente e o site fica leve', () => {
  assert.equal(precisaModoLeve({ criarCanvas: semGpu }), true)
})

test('pede o contexto com failIfMajorPerformanceCaveat, que é o sinal de renderização por software', () => {
  let pedido
  const criarCanvas = () => ({ getContext: (_tipo, opcoes) => { pedido = opcoes; return null } })
  precisaModoLeve({ criarCanvas })
  assert.equal(pedido.failIfMajorPerformanceCaveat, true)
})

test('erro ao criar o contexto conta como sem aceleração', () => {
  const criarCanvas = () => ({ getContext: () => { throw new Error('bloqueado') } })
  assert.equal(precisaModoLeve({ criarCanvas }), true)
})

test('?render=leve e ?render=normal forçam o modo, para testar e demonstrar', () => {
  assert.equal(precisaModoLeve({ criarCanvas: comGpu, busca: '?render=leve' }), true)
  assert.equal(precisaModoLeve({ criarCanvas: semGpu, busca: '?render=normal' }), false)
})

test('o contexto de teste é liberado em seguida, sem prender um dos poucos contextos WebGL da página', () => {
  let liberou = false
  const contexto = { getExtension: (nome) => (nome === 'WEBGL_lose_context' ? { loseContext: () => { liberou = true } } : null) }
  precisaModoLeve({ criarCanvas: canvasQue(contexto) })
  assert.equal(liberou, true)
})
