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
  // Limite de legenda do próprio Instagram — `LIMITE_LEGENDA` na API.
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

// ---------------------------------------------------------------- links
// A mesma regra de `contem_link` na API: corta por espaço e confere cada pedaço,
// sem expressão regular que possa demorar com entrada hostil. Lista fechada de
// domínios: "Ltda." e "Jr." terminam em ponto e não são link.
const TLDS_DE_LINK = new Set([
  'com', 'br', 'net', 'org', 'io', 'app', 'ai', 'co', 'dev', 'me', 'info',
  'site', 'online', 'store', 'xyz', 'tv', 'gg', 'ly',
])
const PONTUACAO_DE_BORDA = `()[]{}<>"'.,;:!?`

function aparar(token) {
  let inicio = 0
  let fim = token.length
  while (inicio < fim && PONTUACAO_DE_BORDA.includes(token[inicio])) inicio++
  while (fim > inicio && PONTUACAO_DE_BORDA.includes(token[fim - 1])) fim--
  return token.slice(inicio, fim)
}

export function contemLink(texto) {
  for (const bruto of String(texto ?? '').toLowerCase().split(/\s+/)) {
    const token = aparar(bruto)
    if (!token) continue
    if (token.startsWith('http://') || token.startsWith('https://')
        || token.startsWith('www.') || token.includes('://')) return true
    const partes = token.split('/')[0].split('.')
    if (partes.length >= 2 && TLDS_DE_LINK.has(partes.at(-1))
        && partes.slice(0, -1).every(Boolean)) return true
  }
  return false
}

export const juntarEspacos = (valor) => String(valor ?? '').trim().split(/\s+/).join(' ')

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
  if (semMarcacao && contemLink(texto)) return t('common.validation.noLink')
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
  if (/\s/.test(texto)) return t('common.validation.emailSpaces')
  return PADRAO_EMAIL.test(texto) && !/[<>]/.test(texto) ? null : t('common.validation.email')
}

// ---------------------------------------------------------------- nomes
const LETRA = /[\p{L}\p{M}]/u
const DIGITO = /\p{Nd}/u
const SEPARADORES_DE_NOME = new Set([' ', "'", '’', '.', '-'])
const PONTUACAO_DE_EMPRESA = new Set([' ', '&', '.', ',', "'", '’', '-', '/', '(', ')', '+'])

/** Nome de pessoa: letras, espaço, apóstrofo, hífen e ponto. Sobrenome não é obrigatório. */
export function validarNomePessoa(t, valor) {
  const base = validarTexto(t, valor, { max: LIMITES.nomePessoa, obrigatorio: true, semMarcacao: true })
  if (base) return base
  const letras = [...juntarEspacos(valor)]
  if (letras.some((c) => DIGITO.test(c))) return t('common.validation.nameNoDigits')
  if (letras.some((c) => !LETRA.test(c) && !SEPARADORES_DE_NOME.has(c))) return t('common.validation.nameChars')
  if (letras.filter((c) => LETRA.test(c)).length < 2) return t('common.validation.nameMin')
  return null
}

/** Nome de empresa: letras, números, espaço e & . , ' - / ( ) +. */
export function validarNomeEmpresa(t, valor) {
  const base = validarTexto(t, valor, { max: LIMITES.nomeAgencia, obrigatorio: true, semMarcacao: true })
  if (base) return base
  const letras = [...juntarEspacos(valor)]
  if (letras.includes('@')) return t('common.validation.companyNoAt')
  if (!letras.some((c) => LETRA.test(c) || DIGITO.test(c))) return t('common.validation.companyNeedsAlnum')
  if (letras.some((c) => !LETRA.test(c) && !DIGITO.test(c) && !PONTUACAO_DE_EMPRESA.has(c))) {
    return t('common.validation.companyChars')
  }
  return null
}

// ---------------------------------------------------------------- senha
// NIST SP 800-63B rev. 4 — a mesma regra de `utils/senha.py`, menos a lista de
// senhas vazadas, que fica só na API (são 31 mil senhas; não vão para o
// navegador). O medidor de força avisa das comuns; a API recusa.
export const SENHA_MIN = 12
export const SENHA_MAX = 128

const semAcento = (texto) => String(texto ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export function validarSenha(t, senha, { email = '', nome = '' } = {}) {
  const s = String(senha ?? '').normalize('NFKC')
  const tamanho = [...s].length
  if (!tamanho) return t('common.validation.required')
  if (tamanho < SENHA_MIN) return t('common.validation.passwordMin', { min: SENHA_MIN })
  if (tamanho > SENHA_MAX) return t('common.validation.passwordMax', { max: SENHA_MAX })
  if (new Set(s).size === 1) return t('common.validation.passwordRepeated')
  const alvo = semAcento(s)
  const local = semAcento(String(email ?? '').split('@')[0])
  if (local.length >= 4 && alvo.includes(local)) return t('common.validation.passwordHasEmail')
  for (const palavra of semAcento(nome).match(/\p{L}+/gu) ?? []) {
    if (palavra.length >= 4 && alvo.includes(palavra)) return t('common.validation.passwordHasName')
  }
  return null
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
// IN RFB 2.229/2024: desde julho de 2026 as 12 primeiras posições aceitam A–Z;
// as duas últimas (dígito verificador) continuam numéricas. O DV usa o código
// do caractere − 48, que dá a regra antiga para dígitos. Mesma regra da API.
const PESOS_CNPJ = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const CNPJ_COMPLETO = /^[0-9A-Z]{12}[0-9]{2}$/
const CNPJ_EM_TEXTO = /[0-9A-Za-z]{2}\.?[0-9A-Za-z]{3}\.?[0-9A-Za-z]{3}\/?[0-9A-Za-z]{4}-?[0-9]{2}/

/** Só letras sem acento e dígitos, em maiúsculas. */
export function cnpjCru(valor) {
  return String(valor ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '')
}

/** Máscara enquanto se digita. Letra nas posições do DV não entra. */
export function mascararCnpj(valor) {
  let cru = ''
  for (const c of cnpjCru(valor)) {
    if (cru.length === 14) break
    if (cru.length >= 12 && !/[0-9]/.test(c)) continue
    cru += c
  }
  const partes = [cru.slice(0, 2), cru.slice(2, 5), cru.slice(5, 8), cru.slice(8, 12), cru.slice(12)]
  const separadores = ['', '.', '.', '/', '-']
  return partes.reduce((saida, parte, i) => (parte ? saida + separadores[i] + parte : saida), '')
}

/**
 * Colar "CNPJ: 12.abc.345/01de-35" não pode virar "CN.PJ1.2AB…": procura o
 * CNPJ dentro do texto antes de aplicar a máscara.
 */
export function extrairCnpjColado(texto) {
  const achado = String(texto ?? '').match(CNPJ_EM_TEXTO)
  return mascararCnpj(achado ? achado[0] : texto)
}

export function cnpjTemDigitosValidos(valor) {
  const cru = cnpjCru(valor)
  if (!CNPJ_COMPLETO.test(cru) || new Set(cru).size === 1) return false
  const digito = (base) => {
    const pesos = PESOS_CNPJ.slice(-base.length)
    const resto = [...base].reduce((soma, c, i) => soma + (c.charCodeAt(0) - 48) * pesos[i], 0) % 11
    return resto < 2 ? '0' : String(11 - resto)
  }
  const primeiro = digito(cru.slice(0, 12))
  return cru.slice(12) === primeiro + digito(cru.slice(0, 12) + primeiro)
}

/**
 * `original` é o valor já gravado: a API só confere o dígito quando o CNPJ
 * muda, porque há agência com CNPJ antigo de dígito errado, e a tela segue a
 * mesma regra. No cadastro não há original, e o dígito é sempre conferido.
 */
export function validarCnpj(t, valor, original, { obrigatorio = false } = {}) {
  const cru = cnpjCru(valor)
  if (!cru) return obrigatorio ? t('common.validation.required') : null
  if (cru.length !== 14) return t('common.validation.cnpjLength')
  const mudou = cru !== cnpjCru(original)
  return mudou && !cnpjTemDigitosValidos(cru) ? t('common.validation.cnpj') : null
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
