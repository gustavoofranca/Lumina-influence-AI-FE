import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import pt from './locales/pt.json'
import en from './locales/en.json'

/**
 * Configuração do i18next.
 *
 * Idioma padrão: pt-BR (com fallback en).
 * Sem persistência — localStorage está vedado nesta fase.
 * Estado do idioma vive em memória durante a sessão.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    lng: 'pt',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React já escapa
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
