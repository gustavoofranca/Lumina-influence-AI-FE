/**
 * Valor em reais digitado como em app de banco: só dígitos, entrando pela
 * direita (1 → R$ 0,01; 15000 → R$ 150,00).
 *
 * Substitui `<input type="number">`, que aceitava "e", "+" e "-", trocava o
 * valor quando a pessoa rolava a página com o mouse sobre o campo, e não
 * entendia a vírgula decimal do pt-BR.
 *
 * O contrato com o formulário não muda: o valor circula como texto em reais com
 * ponto decimal ("1500.50"), ou "" quando vazio.
 */

// R$ 9.999.999.999,99 — acima do teto da API (R$ 1 bilhão), que a validação de
// valor recusa com mensagem própria.
const MAX_DIGITOS = 12

export function reaisDeDigitos(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITOS)
  if (!digitos) return ''
  const completo = digitos.padStart(3, '0')
  return `${completo.slice(0, -2)}.${completo.slice(-2)}`
}

export function formatarReais(reais) {
  if (reais === '' || reais === null || reais === undefined) return ''
  const numero = Number(reais)
  if (!Number.isFinite(numero)) return ''
  return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Colar é diferente de digitar: "2500" colado quer dizer dois mil e quinhentos
 * reais, não vinte e cinco. Vírgula com 1–2 casas no fim é decimal pt-BR; ponto
 * com 1–2 casas no fim (e sem vírgula) é decimal; o resto é inteiro em reais.
 */
export function reaisDeTextoColado(texto) {
  const limpo = String(texto ?? '').replace(/[R$\s\u00a0]/g, '')
  if (!/\d/.test(limpo)) return ''
  let numero
  if (/,\d{1,2}$/.test(limpo)) numero = Number(limpo.replace(/\./g, '').replace(',', '.'))
  else if (/\.\d{1,2}$/.test(limpo) && !limpo.includes(',')) numero = Number(limpo)
  else numero = Number(limpo.replace(/\D/g, ''))
  return Number.isFinite(numero) && numero >= 0 ? numero.toFixed(2) : ''
}
