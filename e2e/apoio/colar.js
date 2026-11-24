/**
 * Cola texto num campo disparando o evento `paste` com os dados — o mesmo que
 * o Ctrl+V entrega ao `onPaste`, sem depender da área de transferência do
 * sistema operacional (que o Playwright só alcança com permissão extra).
 */
export async function colar(campo, texto) {
  await campo.evaluate((el, valor) => {
    const dados = new DataTransfer()
    dados.setData('text', valor)
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dados, bubbles: true, cancelable: true }))
  }, texto)
}
