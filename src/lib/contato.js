/**
 * Endereço publicado nas páginas legais.
 *
 * Precisa ser o mesmo e-mail de contato registrado no app da Meta: o revisor
 * compara a política de privacidade com as configurações do app, e divergência
 * entre os dois é motivo documentado de rejeição.
 */
const PADRAO = 'contato@k13.com.br'

export const EMAIL_CONTATO = import.meta.env.VITE_CONTACT_EMAIL || PADRAO

if (import.meta.env.DEV && !import.meta.env.VITE_CONTACT_EMAIL) {
  console.warn(
    `[lib/contato] VITE_CONTACT_EMAIL não definido — as páginas legais estão ` +
    `publicando "${PADRAO}". Defina no .env antes de submeter ao App Review.`
  )
}
