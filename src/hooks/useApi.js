import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Hook genérico para chamadas à API com estados de loading/error/data.
 *
 * @param {Function} fetcher  função async que retorna os dados
 * @param {Array}    deps     dependências que disparam o refetch
 * @param {Object}   opts     { enabled: bool }
 */
export function useApi(fetcher, deps = [], { enabled = true } = {}) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError]     = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (!enabled) { setLoading(false); return }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, enabled])

  return { data, loading, error, refetch: run }
}
