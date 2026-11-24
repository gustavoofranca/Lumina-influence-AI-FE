import { test } from 'node:test'
import assert from 'node:assert/strict'

import {
  lerModoApresentacao,
  MODO_APRESENTACAO,
  MOSTRAR_IDS_INTERNOS,
  MOSTRAR_HANDLE,
  MOSTRAR_TRANSCRICAO,
  MOSTRAR_CARTOES_OPERACIONAIS_DO_CRIADOR,
  MOSTRAR_COLUNAS_COMERCIAIS_DO_BENCHMARK,
  MOSTRAR_POSTS_AUDITADOS_NA_PREVIA,
  MOSTRAR_EDITAR_E_EXCLUIR,
} from './apresentacao.js'

test('só a string "true" liga o modo apresentação', () => {
  assert.equal(lerModoApresentacao('true'), true)
})

test('sem a variável, ou com qualquer outro valor, o site fica como é', () => {
  for (const valor of [undefined, null, '', 'false', 'TRUE', '1', 'yes', ' true']) {
    assert.equal(lerModoApresentacao(valor), false, `valor ${JSON.stringify(valor)}`)
  }
})

test('no Node, sem import.meta.env, o modo fica desligado e tudo aparece', () => {
  assert.equal(MODO_APRESENTACAO, false)
  for (const chave of [
    MOSTRAR_IDS_INTERNOS,
    MOSTRAR_HANDLE,
    MOSTRAR_TRANSCRICAO,
    MOSTRAR_CARTOES_OPERACIONAIS_DO_CRIADOR,
    MOSTRAR_COLUNAS_COMERCIAIS_DO_BENCHMARK,
    MOSTRAR_POSTS_AUDITADOS_NA_PREVIA,
    MOSTRAR_EDITAR_E_EXCLUIR,
  ]) {
    assert.equal(chave, true)
  }
})
