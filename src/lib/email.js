/** E-mail: sugestão de domínio digitado errado e forma mascarada para exibir. */

const DOMINIOS_COMUNS = [
  'gmail.com', 'hotmail.com', 'outlook.com', 'live.com', 'yahoo.com', 'yahoo.com.br',
  'icloud.com', 'uol.com.br', 'bol.com.br', 'terra.com.br',
]

function distancia(a, b) {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = linha[0]
    linha[0] = i
    for (let j = 1; j <= b.length; j++) {
      const acima = linha[j]
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1))
      diagonal = acima
    }
  }
  return linha[b.length]
}

/** "marina@gmial.com" → "marina@gmail.com". Sugere, nunca corrige sozinho. */
export function sugerirEmail(email) {
  const [local, dominio, ...resto] = String(email ?? '').trim().toLowerCase().split('@')
  if (!local || !dominio || resto.length || dominio.length < 5 || DOMINIOS_COMUNS.includes(dominio)) {
    return null
  }
  let melhor = null
  let menor = 3
  for (const candidato of DOMINIOS_COMUNS) {
    const d = distancia(dominio, candidato)
    if (d < menor) {
      menor = d
      melhor = candidato
    }
  }
  return melhor ? `${local}@${melhor}` : null
}

/** "nova@agencia.com.br" → "n*****@agencia.com.br". */
export function mascararEmail(email) {
  const [local, dominio] = String(email ?? '').split('@')
  return local && dominio ? `${local[0]}*****@${dominio}` : ''
}
