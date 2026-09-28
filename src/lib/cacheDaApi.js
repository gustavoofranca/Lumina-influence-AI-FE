/**
 * Memória das respostas de leitura, compartilhada pelas telas da aba.
 *
 * Existe para uma coisa: voltar a uma tela já visitada mostra o que ela tinha
 * na hora, em vez do esqueleto de carregamento, enquanto a busca nova corre por
 * trás. Voltar ao painel custava 754 ms e quatro chamadas para exibir um dado de
 * segundos atrás.
 *
 * Três regras mantêm o dado honesto:
 *
 *   - **É só uma primeira pintura.** Quem lê daqui busca de novo logo em
 *     seguida e substitui pelo que o servidor devolver (ver `useApi`).
 *   - **Qualquer escrita apaga tudo.** Um POST, PUT, PATCH ou DELETE que dê
 *     certo limpa a memória inteira (ver `request` em `api.js`). É grosso de
 *     propósito: saber quais leituras uma escrita afeta exigiria um mapa de
 *     dependências que ninguém manteria, e escrita é rara perto de leitura.
 *   - **Troca de sessão apaga tudo.** Sem isso, sair e entrar como outra pessoa
 *     na mesma aba mostraria por um instante os dados da agência anterior.
 *
 * Vive só em memória, e por isso morre com a aba — a mesma propriedade que a
 * ADR-001 escolheu para o token.
 */
const respostas = new Map()

export function temNoCache(chave) {
  return respostas.has(chave)
}

export function lerDoCache(chave) {
  return respostas.get(chave)
}

export function guardarNoCache(chave, valor) {
  respostas.set(chave, valor)
}

export function limparCacheDaApi() {
  respostas.clear()
}
