/**
 * Medidor de força (zxcvbn-ts), carregado só quando uma tela com senha abre:
 * os dicionários pesam algumas centenas de KB e não têm motivo para estar no
 * bundle da landing.
 *
 * É orientação, não regra. Quem recusa é a API (`utils/senha.py`): o zxcvbn dá
 * nota máxima a "marina.lumina2026", que a regra de não usar o e-mail recusa.
 */
let fabrica = null

async function carregar() {
  if (!fabrica) {
    const [{ ZxcvbnFactory }, comum, ptBr] = await Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      import('@zxcvbn-ts/language-pt-br'),
    ])
    fabrica = new ZxcvbnFactory({
      dictionary: { ...comum.dictionary, ...ptBr.dictionary },
      graphs: comum.adjacencyGraphs,
      translations: ptBr.translations,
    })
  }
  return fabrica
}

/** Nota de 0 (muito fraca) a 4 (muito forte). */
export async function medirForca(senha, entradas = []) {
  const zxcvbn = await carregar()
  return zxcvbn.check(senha, entradas).score
}
