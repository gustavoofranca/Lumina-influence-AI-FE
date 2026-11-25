/**
 * Conexão de conta social numa janela pequena, como o "Entrar com Google".
 *
 * Antes, o consentimento acontecia na própria aba: o provedor tomava o lugar do
 * painel, e a volta caía numa tela nova. Agora o painel fica onde estava, a
 * janela pequena faz o OAuth e, no fim, a página `/conexao/concluida` avisa o
 * painel por um `BroadcastChannel` e se fecha.
 *
 * Canal, e não `window.opener.postMessage`: Facebook e outros provedores usam
 * Cross-Origin-Opener-Policy, que corta o `opener` no caminho. O canal é da
 * mesma origem e não depende dele.
 */

export const CANAL_DE_CONEXOES = 'lumina.conexoes'
const NOME_DA_JANELA = 'lumina-conexao'

/**
 * Abre a janela **antes** de qualquer `await`: aberta depois de uma promessa,
 * ela deixa de contar como resposta ao clique, e o bloqueador de popup a barra.
 * Devolve `null` quando o navegador bloqueia — quem chama cai na navegação da
 * própria aba.
 */
export function abrirJanelaDeConexao() {
  const largura = 520
  const altura = 680
  const esquerda = Math.max(0, window.screenX + (window.outerWidth - largura) / 2)
  const topo = Math.max(0, window.screenY + (window.outerHeight - altura) / 2)
  try {
    return window.open(
      '',
      NOME_DA_JANELA,
      `popup,width=${largura},height=${altura},left=${Math.round(esquerda)},top=${Math.round(topo)}`
    )
  } catch {
    return null
  }
}

function abrirCanal() {
  try {
    return typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CANAL_DE_CONEXOES)
  } catch {
    return null
  }
}

/** Escuta o fim das conexões. Devolve a função que para de escutar. */
export function escutarConexoes(aoConcluir) {
  const canal = abrirCanal()
  if (!canal) return () => {}
  canal.onmessage = (evento) => {
    if (evento.data?.tipo === 'conexao-concluida') aoConcluir(evento.data)
  }
  return () => canal.close()
}

/** Usado pela janela pequena, ao voltar do provedor. */
export function avisarConexao({ plataforma, influenciador, erro }) {
  const canal = abrirCanal()
  if (!canal) return false
  canal.postMessage({ tipo: 'conexao-concluida', plataforma, influenciador, erro: erro || null })
  canal.close()
  return true
}
