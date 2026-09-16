/**
 * Seguidores somados entre plataformas.
 *
 * `total_followers` é a soma do `follower_count` de cada conta do criador, e
 * isso **conta a mesma pessoa mais de uma vez**: quem segue no Instagram e no
 * YouTube entra duas vezes. Não existe audiência única desse tamanho, e a API
 * não tem como saber a sobreposição — nenhuma plataforma expõe isso.
 *
 * O número não está errado; o rótulo é que estava. "Seguidores" sugere pessoas
 * alcançáveis, que é leitura de medição direta. É a mesma família de problema
 * que a ADR-002 trata nos KPIs financeiros: valor derivado exibido com cara de
 * valor medido.
 *
 * A distinção só aparece quando há mais de uma conta — com uma só, a soma é o
 * próprio número e avisar seria ruído.
 */

const NOME_DA_PLATAFORMA = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
}

/** Há mais de uma conta, logo o total é de fato uma soma? */
export function ehSoma(socialAccounts = []) {
  return (socialAccounts || []).length > 1
}

/** "Instagram 198 + YouTube 6" — a conta que o número esconde. */
export function detalharSoma(socialAccounts = [], formatar = (n) => String(n)) {
  return (socialAccounts || [])
    .filter((sa) => (sa.followers ?? 0) > 0)
    .map((sa) => `${NOME_DA_PLATAFORMA[sa.platform] || sa.platform} ${formatar(sa.followers)}`)
    .join(' + ')
}
