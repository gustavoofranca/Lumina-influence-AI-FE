import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pt from './locales/pt.json'
import en from './locales/en.json'

const CHAVE_IDIOMA = 'lumina:lang'
const IDIOMAS = ['pt', 'en']

/**
 * Idioma guardado, ou o padrão do produto.
 *
 * A vedação de `localStorage` da ADR-001 é sobre o **token**: o que ela protege
 * é "fechar a aba encerra a sessão". Preferência de exibição não é credencial e
 * não tem por que morrer no F5 — sem isto, trocar para inglês e navegar por URL
 * devolvia a interface inteira ao português.
 */
function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(CHAVE_IDIOMA)
    if (IDIOMAS.includes(guardado)) return guardado
  } catch {
    // Navegador sem armazenamento: vale o padrão do produto.
  }
  return 'pt'
}

/**
 * Configuração do i18next.
 *
 * Idioma padrão: pt-BR (com fallback en), preferência guardada no navegador.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    lng: idiomaInicial(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React já escapa
    },
    react: {
      useSuspense: false,
    },
  })

function marcarIdiomaDoDocumento(lang) {
  document.documentElement.lang = lang?.startsWith('pt') ? 'pt-BR' : 'en'
}

// O `lang` do documento precisa valer já no primeiro render: o evento abaixo só
// dispara na troca, e sem isto o leitor de tela lia inglês com voz portuguesa.
marcarIdiomaDoDocumento(i18n.language)

// Persistir aqui, e não no seletor, faz valer para qualquer ponto que troque o
// idioma — inclusive os que vierem depois.
i18n.on('languageChanged', (lang) => {
  const curto = lang?.startsWith('pt') ? 'pt' : 'en'
  marcarIdiomaDoDocumento(curto)
  try {
    localStorage.setItem(CHAVE_IDIOMA, curto)
  } catch {
    // Sem armazenamento, a escolha vale só para esta aba.
  }
})

export default i18n
