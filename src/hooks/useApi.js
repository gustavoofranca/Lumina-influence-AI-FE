import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Hook genérico para chamadas à API com estados de loading/error/data.
 *
 * @param {Function} fetcher  função async que retorna os dados
 * @param {Array}    deps     dependências que disparam o refetch
 * @param {Object}   opts     { enabled: bool }
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
export function useApi(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError]     = useState(null)

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
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
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
