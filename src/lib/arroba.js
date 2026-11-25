/**
 * Regras do @ escondido (`components/ui/ArrobaOculta.jsx`).
 *
 * Sete pontos fixos, qualquer que seja o tamanho do @: pontos na medida do
 * texto contariam as letras a quem olha a tela, que é justamente o que o olho
 * existe para evitar.
 */
export const ARROBA_OCULTA = '@•••••••'

/**
 * O @ como a tela mostra: com um `@` só na frente.
 *
 * A API não é uniforme — o serviço de criadores já entrega `@handle`, a conta
 * social entrega `handle` —, e a tela não pode depender de qual chegou.
 * Devolve `null` para vazio, para o componente não desenhar nada.
 */
export function normalizarArroba(handle) {
  const limpo = String(handle ?? '').trim().replace(/^@+/, '')
  return limpo ? `@${limpo}` : null
}
