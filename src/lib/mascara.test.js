import { test } from 'node:test'
import assert from 'node:assert/strict'

import { lerRegras, mascarar, mascararCom } from './mascara.js'

// Nomes fictícios de propósito: o nome real só existe no `.env.local`.
const REGRAS = lerRegras('fulana.beltrana=>pessoa.teste;beltrana=>teste')

test('sem regra nada muda e o próprio objeto volta, sem custo no site publicado', () => {
  const resposta = { data: { handle: '@fulana.beltrana', thumbnail_url: 'https://scontent.cdninstagram.com/a.jpg' } }
  assert.equal(mascararCom(resposta, []), resposta)
  assert.equal(mascararCom(resposta, lerRegras('')), resposta)
  assert.equal(mascararCom(resposta, lerRegras(undefined)), resposta)
})

test('sem VITE_MASCARAS no ambiente, mascarar devolve o mesmo objeto', () => {
  const resposta = { data: ['fulana.beltrana'] }
  assert.equal(mascarar(resposta), resposta)
})

test('troca strings aninhadas em objeto e em array', () => {
  const resposta = {
    data: {
      conta: { handle: 'fulana.beltrana' },
      posts: [{ legenda: 'Bom dia, beltrana aqui' }, 'oi fulana.beltrana'],
      seguidores: 1200,
      ativo: true,
      bio: null,
    },
  }
  assert.deepEqual(mascararCom(resposta, REGRAS), {
    data: {
      conta: { handle: 'pessoa.teste' },
      posts: [{ legenda: 'Bom dia, teste aqui' }, 'oi pessoa.teste'],
      seguidores: 1200,
      ativo: true,
      bio: null,
    },
  })
})

test('não diferencia maiúsculas de minúsculas', () => {
  assert.equal(mascararCom('Fulana.BELTRANA e BeLtRaNa', REGRAS), 'pessoa.teste e teste')
})

test('a regra mais longa vence, mesmo escrita depois da curta', () => {
  const regras = lerRegras('beltrana=>teste;fulana.beltrana=>pessoa.teste')
  assert.equal(mascararCom('fulana.beltrana', regras), 'pessoa.teste')
})

test('o @ fica onde estava', () => {
  assert.equal(mascararCom('@fulana.beltrana', REGRAS), '@pessoa.teste')
})

test('URL do CDN da Meta vira null só com regra ativa', () => {
  const resposta = {
    thumbnail_url: 'https://scontent-gru1-1.cdninstagram.com/v/t51/a.jpg?x=1',
    video_url: 'https://video.xx.fbcdn.net/v/b.mp4',
    raiz: 'https://cdninstagram.com/c.jpg',
  }
  assert.deepEqual(mascararCom(resposta, REGRAS), { thumbnail_url: null, video_url: null, raiz: null })
  assert.deepEqual(mascararCom(resposta, []), resposta)
})

test('URL de outro host fica intacta', () => {
  const resposta = { thumbnail_url: 'https://exemplo.com/a.jpg', falso: 'https://cdninstagram.com.exemplo.com/a.jpg' }
  assert.deepEqual(mascararCom(resposta, REGRAS), resposta)
})

test('entrada malformada é ignorada sem quebrar as outras', () => {
  const regras = lerRegras(' ; sem-seta ; =>vazio ;  fulana.beltrana  =>  pessoa.teste  ;;')
  assert.deepEqual(regras, [{ de: 'fulana.beltrana', para: 'pessoa.teste' }])
  assert.equal(mascararCom('fulana.beltrana', regras), 'pessoa.teste')
})

test('caracteres especiais de regex na regra são tratados como texto', () => {
  const regras = lerRegras('a.b=>x')
  assert.equal(mascararCom('aXb a.b', regras), 'aXb x')
})

test('chaves não mudam, só valores', () => {
  const resposta = { beltrana: 'beltrana', 'fulana.beltrana': ['beltrana'] }
  assert.deepEqual(mascararCom(resposta, REGRAS), { beltrana: 'teste', 'fulana.beltrana': ['teste'] })
})

test('não altera o objeto recebido', () => {
  const resposta = { data: { handle: 'fulana.beltrana', lista: ['beltrana'] } }
  const copia = structuredClone(resposta)
  mascararCom(resposta, REGRAS)
  assert.deepEqual(resposta, copia)
})
