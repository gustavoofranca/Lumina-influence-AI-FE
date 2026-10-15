/**
 * Limites e regras de cada campo de formulário — os mesmos da API.
 *
 * A fonte é `src/schemas/campos.py` no back-end, e os tamanhos são os das
 * colunas do banco. Repetidos aqui porque a tela precisa recusar antes de
 * enviar: a API recusa também, mas responde depois do clique e em português
 * só, e a interface tem dois idiomas. A validação daqui é a primeira
 * linha; o erro da API ao lado do campo (`errosDaApi`) é a rede para o que
 * escapar dela.
 *
 * Mudou um limite lá, muda aqui.
 */

export const LIMITES = {
  marca: 160,
  tituloCampanha: 200,
  entregaveis: 500,
  nomeCriador: 160,
  nicho: 80,
  bio: 500,
  usuarioPlataforma: 120,
  nomeAgencia: 160,
  nomePessoa: 160,
  email: 254,
  // Limite de legenda do próprio Instagram. A API recebe o mesmo teto na
  // próxima fase da validação.
  legendaVideo: 2200,
}

export const ORCAMENTO_MAXIMO_REAIS = 1_000_000_000
export const DATA_MINIMA = '2000-01-01'
export const DATA_MAXIMA = '2100-12-31'

// Largura zero: um nome feito só disto parece vazio na tela.
const INVISIVEIS = /[\u200b-\u200d\u2060\ufeff]/g
const SINAIS_DE_MARCACAO = /[<>]/
// Letra e número de qualquer alfabeto, mais `._-`, com @ opcional na frente —
// a mesma regra do `Handle` na API.
const PADRAO_USUARIO = /^@?[\p{L}\p{N}_.-]+$/u
const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Texto de uma linha. Devolve a mensagem de erro já traduzida, ou `null`.
 *
 * `semMarcacao` é a regra dos nomes (marca, criador, agência, pessoa): a API
 * recusa `<` e `>` neles. Títulos aceitam.
 */
export function validarTexto(t, valor, { max, obrigatorio = false, semMarcacao = false } = {}) {
  const texto = (valor ?? '').trim()
  if (!texto) return obrigatorio ? t('common.validation.required') : null
  if (!texto.replace(INVISIVEIS, '').trim()) return t('common.validation.blank')
  if (max && texto.length > max) return t('common.validation.tooLong', { max })
  if (semMarcacao && SINAIS_DE_MARCACAO.test(texto)) return t('common.validation.noMarkup')
  return null
}

export function validarUsuario(t, valor) {
  const texto = (valor ?? '').trim()
  if (!texto) return t('common.validation.required')
  if (texto.length > LIMITES.usuarioPlataforma) {
    return t('common.validation.tooLong', { max: LIMITES.usuarioPlataforma })
  }
  return PADRAO_USUARIO.test(texto) ? null : t('common.validation.handle')
}

export function validarEmail(t, valor) {
  const texto = (valor ?? '').trim()
  if (!texto) return t('common.validation.required')
  if (texto.length > LIMITES.email) return t('common.validation.tooLong', { max: LIMITES.email })
  return PADRAO_EMAIL.test(texto) ? null : t('common.validation.email')
}

/** Data ISO (aaaa-mm-dd) dentro da faixa que a API aceita. Vazia passa. */
export function validarData(t, iso) {
  if (!iso) return null
  if (iso < DATA_MINIMA || iso > DATA_MAXIMA) {
    return t('common.validation.dateRange', { min: '01/01/2000', max: '31/12/2100' })
  }
  return null
}

/** Valor em reais, digitado pela pessoa. Vazio passa: quem exige é o formulário. */
export function validarDinheiro(t, reais) {
  if (reais === '' || reais === null || reais === undefined) return null
  const n = Number(reais)
  if (!Number.isFinite(n) || n < 0) return t('common.validation.money')
  if (n > ORCAMENTO_MAXIMO_REAIS) {
    return t('common.validation.moneyMax', { max: 'R$ 1.000.000.000,00' })
  }
  return null
}

// ---------------------------------------------------------------- CNPJ
export function mascararCnpj(valor) {
  const d = String(valor ?? '').replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function cnpjTemDigitosValidos(digitos) {
  if (digitos.length !== 14 || new Set(digitos).size === 1) return false
  const digito = (base) => {
    const pesos = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2].slice(-base.length)
    const resto = [...base].reduce((soma, d, i) => soma + Number(d) * pesos[i], 0) % 11
    return resto < 2 ? '0' : String(11 - resto)
  }
  const primeiro = digito(digitos.slice(0, 12))
  return digitos.slice(12) === primeiro + digito(digitos.slice(0, 12) + primeiro)
}

/**
 * CNPJ vazio passa (o campo é opcional). `original` é o valor que já estava
 * gravado: a API só confere o dígito quando o CNPJ muda, porque há agência com
 * CNPJ antigo de dígito errado, e a tela segue a mesma regra.
 */
export function validarCnpj(t, valor, original) {
  const digitos = String(valor ?? '').replace(/\D/g, '')
  if (!digitos) return null
  if (digitos.length !== 14) return t('common.validation.cnpjLength')
  const mudou = digitos !== String(original ?? '').replace(/\D/g, '')
  return mudou && !cnpjTemDigitosValidos(digitos) ? t('common.validation.cnpj') : null
}

// ---------------------------------------------------------------- Erro da API
/**
 * Erros por campo de uma recusa da API (422), traduzidos para as chaves do
 * formulário.
 *
 * `mapa` diz qual campo da tela corresponde a cada campo da API — o
 * formulário de campanha chama de `brand` o que a API chama de `brand_name`.
 * Campo aninhado (`participants.0.fee_brl_cents`) casa pelo último nome.
 */
export function errosDaApi(erro, mapa) {
  const campos = erro?.details?.fields
  if (!Array.isArray(campos)) return {}
  const saida = {}
  for (const campo of campos) {
    const caminho = String(campo.field || '')
    const ultimo = caminho.split('.').filter((parte) => Number.isNaN(Number(parte))).pop()
    const chave = mapa[caminho] ?? mapa[ultimo]
    if (chave && !saida[chave]) saida[chave] = campo.message
  }
  return saida
}
