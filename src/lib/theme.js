/**
 * Tema da interface — claro ou escuro.
 *
 * A preferência vive no localStorage do navegador: persistir no banco exigiria
 * as colunas que ficaram fora da migração, e tema é escolha de dispositivo, não
 * de conta. Sem escolha gravada, vale o que o sistema operacional pede.
 */
const CHAVE = 'lumina:theme'

export const THEMES = ['dark', 'light']

function preferenciaDoSistema() {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

export function getStoredTheme() {
  try {
    const guardado = localStorage.getItem(CHAVE)
    if (THEMES.includes(guardado)) return guardado
  } catch {
    // Navegador sem armazenamento (janela anônima, cookies bloqueados):
    // segue a preferência do sistema em vez de quebrar a tela.
  }
  return preferenciaDoSistema()
}

/** Escreve o tema no <html>. É o seletor de que as variáveis do CSS dependem. */
export function applyTheme(theme) {
  const alvo = THEMES.includes(theme) ? theme : 'dark'
  document.documentElement.setAttribute('data-theme', alvo)
  return alvo
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(CHAVE, theme)
  } catch {
    // Sem armazenamento, a escolha vale só para esta sessão.
  }
}
