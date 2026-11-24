/**
 * Modo leve: o que as telas públicas fazem num navegador sem aceleração de
 * hardware.
 *
 * Sem a placa de vídeo, o navegador desenha tudo no processador, e os efeitos
 * de fundo — duas auras com `blur(100px)` animadas, o vidro com
 * `backdrop-filter`, o campo de estrelas e os fios em WebGL — passam a custar
 * meio segundo por quadro. Medido no Opera GX com `--disable-gpu` (23/10/2026):
 * 3 a 4 quadros por segundo na landing e no login, parado ou rolando; só as
 * auras, sozinhas, levavam o login de 4 para 28. É o caso real de quem está com
 * "Usar aceleração de hardware" desligado, ou com driver na lista de bloqueio.
 *
 * O sinal é o mesmo que o navegador usa: pedir um contexto WebGL com
 * `failIfMajorPerformanceCaveat`. Ele é recusado exatamente quando a
 * renderização é por software (SwiftShader, Microsoft Basic Render Driver).
 *
 * O modo leve troca só o que é caro e mantém a cara: as auras continuam como
 * gradientes, só que paradas e sem desfoque; o vidro mantém a tinta e a borda e
 * perde o desfoque de 4px atrás dele; as estrelas aparecem, paradas. As regras
 * estão em `index.css`, sob `html[data-render='leve']`.
 */

/**
 * `true` quando o navegador renderiza por software.
 *
 * `?render=leve` e `?render=normal` forçam o resultado — para testar, e para
 * demonstrar os dois modos na mesma máquina.
 */
export function precisaModoLeve({ criarCanvas = () => document.createElement('canvas'), busca = '' } = {}) {
  const pedido = new URLSearchParams(busca).get('render')
  if (pedido === 'leve') return true
  if (pedido === 'normal') return false
  try {
    const contexto = criarCanvas().getContext('webgl', { failIfMajorPerformanceCaveat: true })
    if (!contexto) return true
    // A página tem um teto de contextos WebGL vivos; o de teste não pode
    // ocupar o lugar do que desenha os fios.
    contexto.getExtension('WEBGL_lose_context')?.loseContext()
    return false
  } catch {
    return true
  }
}

/** Marca o documento antes da primeira pintura. Chamado em `main.jsx`. */
export function aplicarModoLeve() {
  if (precisaModoLeve({ busca: window.location.search })) {
    document.documentElement.dataset.render = 'leve'
  }
}

/** Para os componentes que desenham em JavaScript (canvas, luz do ponteiro). */
export function modoLeve() {
  return typeof document !== 'undefined' && document.documentElement.dataset.render === 'leve'
}
