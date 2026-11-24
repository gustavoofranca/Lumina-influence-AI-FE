/**
 * Máscara de apresentação: troca nomes e esconde mídia nas respostas da API.
 *
 * Existe para a gravação da apresentação do TCC. A conta social conectada é de
 * uma pessoa real, e o @ e o sobrenome dela aparecem no handle, nas legendas,
 * nos comentários e nos trechos que a IA cita (frases-chave, recomendações,
 * transcrição). Mostrar isso num vídeo que circula fora da banca é tratar dado
 * pessoal sem finalidade que o justifique — o que a LGPD (art. 6º, I e III)
 * pede é o contrário: usar só o necessário para o que se quer demonstrar.
 *
 * As regras vêm de `VITE_MASCARAS` e moram só no `.env.local` da máquina que
 * grava, que o `.gitignore` já exclui. O nome real nunca entra no código, nos
 * testes nem no histórico; o site publicado, sem a variável, não muda nada.
 *
 * Formato: `de=>para;de=>para`. Entrada sem `=>` ou com `de` vazio é ignorada
 * em silêncio — um erro de digitação no `.env.local` não pode derrubar a tela
 * no meio da gravação.
 *
 * Miniaturas e vídeos vêm do CDN da Meta e mostram o rosto, que nenhuma troca
 * de texto esconde. Com ao menos uma regra ativa, toda URL desses hosts vira
 * `null`, e a interface cai no estado de "sem mídia" que já desenha.
 */

const HOSTS_DE_MIDIA = ['cdninstagram.com', 'fbcdn.net']

export function lerRegras(texto) {
  if (!texto) return []
  return texto
    .split(';')
    .map((entrada) => {
      const posicao = entrada.indexOf('=>')
      if (posicao < 0) return null
      const de = entrada.slice(0, posicao).trim()
      const para = entrada.slice(posicao + 2).trim()
      return de ? { de, para } : null
    })
    .filter(Boolean)
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ehMidiaDaMeta(texto) {
  if (!/^https?:\/\//i.test(texto)) return false
  let host
  try {
    host = new URL(texto).hostname.toLowerCase()
  } catch {
    return false
  }
  return HOSTS_DE_MIDIA.some((h) => host === h || host.endsWith(`.${h}`))
}

/**
 * Versão pura: recebe as regras já lidas, para os testes não dependerem do
 * ambiente.
 *
 * Devolve uma cópia em vez de alterar o que recebeu. Hoje o `payload` de
 * `request` acabou de sair do `JSON.parse` e ninguém mais o segura — a máscara
 * roda antes de `useApi` guardar qualquer coisa em `cacheDaApi`, então o cache
 * já recebe o dado mascarado e mutar seria inofensivo. A cópia existe para a
 * função continuar inofensiva se um dia for chamada sobre um objeto que já
 * está no cache ou em estado do React, onde mutar em silêncio pularia a
 * re-renderização ou vazaria a troca para quem não pediu.
 */
export function mascararCom(valor, regras) {
  if (!regras || regras.length === 0) return valor

  // Uma alternância só, da regra mais longa para a mais curta: o regex tenta
  // as alternativas em ordem, então `ana.x` ganha de `x` na mesma posição, e o
  // texto já trocado não é varrido de novo por uma regra mais curta.
  const ordenadas = [...regras].sort((a, b) => b.de.length - a.de.length)
  const padrao = new RegExp(ordenadas.map((r) => escaparRegex(r.de)).join('|'), 'gi')
  const destino = new Map(ordenadas.map((r) => [r.de.toLowerCase(), r.para]))

  const percorrer = (v) => {
    if (typeof v === 'string') {
      if (ehMidiaDaMeta(v)) return null
      return v.replace(padrao, (achado) => destino.get(achado.toLowerCase()) ?? achado)
    }
    if (Array.isArray(v)) return v.map(percorrer)
    if (v && typeof v === 'object') {
      const copia = {}
      for (const [chave, interno] of Object.entries(v)) copia[chave] = percorrer(interno)
      return copia
    }
    return v
  }

  return percorrer(valor)
}

// `?.` porque os testes rodam no Node, onde `import.meta.env` não existe.
const REGRAS_DO_AMBIENTE = lerRegras(import.meta.env?.VITE_MASCARAS)

export function mascarar(valor) {
  return mascararCom(valor, REGRAS_DO_AMBIENTE)
}
