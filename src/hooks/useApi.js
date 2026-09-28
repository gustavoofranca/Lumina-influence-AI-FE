import { useEffect, useState, useCallback, useRef } from 'react'

import { guardarNoCache, lerDoCache, temNoCache } from '../lib/cacheDaApi.js'

/**
 * Hook genérico para chamadas à API com estados de loading/error/data.
 *
 * @param {Function} fetcher  função async que retorna os dados
 * @param {Array}    deps     dependências que disparam o refetch
 * @param {Object}   opts     { enabled: bool, cacheKey: string }
 *
 * `cacheKey` liga a memória entre telas (ver `lib/cacheDaApi.js`): com ela, a
 * tela abre com a última resposta que teve e busca de novo por trás, sem
 * esqueleto. A chave final inclui `deps`, então o painel de 7 dias e o de 30
 * dias não se confundem. Sem `cacheKey`, o comportamento é o de sempre — é o
 * caso de dado que precisa estar fresco na primeira pintura, como a prévia de
 * exclusão de conta.
 *
 * ---------------------------------------------------------------------------
 * Sobre as três supressões de regra deste arquivo
 * ---------------------------------------------------------------------------
 *
 * O ESLint entrou no projeto em 09/09/2026 e apontou quatro coisas aqui. Uma
 * era defeito e foi corrigida — a escrita no ref durante o render, logo
 * abaixo. As outras três decorrem da **assinatura pública** deste hook, que
 * recebe o array de dependências de quem chama. Nenhuma regra de análise
 * estática consegue verificar um array que ela não enxerga, e satisfazê-las
 * exigiria trocar a assinatura em mais de vinte telas.
 *
 * Ficam suprimidas uma a uma, com o motivo ao lado. Supressão em bloco no topo
 * do arquivo esconderia um achado novo que aparecesse depois.
 */
export function useApi(fetcher, deps = [], { enabled = true, cacheKey } = {}) {
  const chave = cacheKey ? JSON.stringify([cacheKey, ...deps]) : null

  const [data, setData]       = useState(() => (chave && temNoCache(chave) ? lerDoCache(chave) : null))
  const [loading, setLoading] = useState(() => enabled && !(chave && temNoCache(chave)))
  const [error, setError]     = useState(null)

  // Número da busca mais recente. Só ela pode escrever no estado.
  //
  // Sem isto, trocar "7 dias" por "30 dias" disparava duas buscas, e a que
  // voltasse por último vencia — mesmo sendo a mais antiga. Medido com a
  // resposta de 7 dias atrasada em 2 s: a aba ficava em "30 dias" e o gráfico
  // sumia, porque o que ficava na tela era o período de 7 dias, sem pontos.
  const ultimaBuscaRef = useRef(0)

  // Quem chama monta uma arrow nova a cada render (`useApi(() => getX(id), [id])`),
  // então o `fetcher` nunca é o mesmo objeto. O ref existe para que a busca
  // dependa de `deps`, e não da identidade da função.
  //
  // A escrita mora num efeito, e não no corpo do componente. Escrever num ref
  // durante o render é violação do modelo do React: sob renderização
  // concorrente ou no modo estrito o componente renderiza duas vezes, e a
  // escrita do render descartado sobrevive à do render que foi commitado. Num
  // efeito, só o render commitado escreve — e este efeito é declarado antes do
  // de busca, então roda antes dele no mesmo commit.
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const run = useCallback(async () => {
    const estaBusca = ++ultimaBuscaRef.current
    const aindaValida = () => estaBusca === ultimaBuscaRef.current

    // Com a resposta em memória, ela vira a primeira pintura e o esqueleto não
    // aparece; a busca abaixo corre do mesmo jeito e substitui o que estiver
    // velho. Sem ela, é o carregamento de sempre.
    if (chave && temNoCache(chave)) {
      setData(lerDoCache(chave))
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const result = await fetcherRef.current()
      if (!aindaValida()) return
      if (chave) guardarNoCache(chave, result)
      setData(result)
    } catch (err) {
      if (!aindaValida()) return
      setError(err)
    } finally {
      if (aindaValida()) setLoading(false)
    }
    // O array vem de quem chama — é a assinatura do hook. Sem literal, nem a
    // regra de dependências nem a de memoização têm o que verificar.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps)

  // Buscar ao montar é o que este hook existe para fazer, e marcar o
  // carregamento é síncrono nos dois caminhos: quando desabilitado, para
  // desligar o esqueleto; quando habilitado, dentro de `run`. A alternativa
  // que a regra pede — estado derivado ou biblioteca de dados — é outra
  // arquitetura, não outro trecho.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    run()
  }, [run, enabled])
  /* eslint-enable react-hooks/set-state-in-effect */

  return { data, loading, error, refetch: run }
}
