/** Mensagens das telas de entrada para erros que não são de um campo. */

export function minutosDeEspera(erro) {
  return Math.max(1, Math.ceil((erro?.details?.retry_after_seconds ?? 60) / 60))
}

export function mensagemDeAuth(t, erro) {
  if (erro?.code === 'rate_limit_exceeded') return t('auth.erros.tooMany', { min: minutosDeEspera(erro) })
  return erro?.message || t('auth.erros.generic')
}
